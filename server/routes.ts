import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertPhotographerSchema, insertBookingSchema, insertEditingRequestSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { z } from "zod";
import { broadcastToBooking, broadcastToUser, broadcastToPhotographer, broadcastToCustomer } from "./realtime";
import { getUncachableStripeClient, getStripePublishableKey, isStripeConfigured } from "./stripeClient";

// Helper function to calculate session phase based on current time
type SessionPhase = 'upcoming' | 'in_progress' | 'completed';

function calculateSessionPhase(
  scheduledDate: Date | string,
  scheduledTime: string,
  duration: number,
  status: string
): SessionPhase {
  // Handle different statuses appropriately
  if (status === 'completed' || status === 'photos_pending') {
    return 'completed';
  }
  
  if (status === 'cancelled' || status === 'declined' || status === 'expired') {
    return 'completed'; // Treat cancelled/declined as no longer active
  }
  
  if (status === 'pending') {
    return 'upcoming';
  }
  
  // For confirmed bookings, calculate based on time
  if (status !== 'confirmed') {
    return 'upcoming';
  }

  const now = new Date();
  
  // Parse the scheduled date and time
  const dateStr = typeof scheduledDate === 'string' 
    ? scheduledDate.split('T')[0] 
    : scheduledDate.toISOString().split('T')[0];
  
  // Parse time (format: "14:00" or "2:00 PM")
  let hours: number, minutes: number;
  if (scheduledTime.includes('AM') || scheduledTime.includes('PM')) {
    const match = scheduledTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (match) {
      hours = parseInt(match[1]);
      minutes = parseInt(match[2]);
      const isPM = match[3].toUpperCase() === 'PM';
      if (isPM && hours !== 12) hours += 12;
      if (!isPM && hours === 12) hours = 0;
    } else {
      return 'upcoming';
    }
  } else {
    const timeParts = scheduledTime.split(':');
    hours = parseInt(timeParts[0]);
    minutes = parseInt(timeParts[1] || '0');
  }

  // Create session start and end times
  const sessionStart = new Date(`${dateStr}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`);
  const sessionEnd = new Date(sessionStart.getTime() + duration * 60 * 60 * 1000);

  if (now < sessionStart) {
    return 'upcoming';
  } else if (now >= sessionStart && now < sessionEnd) {
    return 'in_progress';
  } else {
    return 'completed';
  }
}

// Helper function to add session phase to bookings
function addSessionPhaseToBookings<T extends { scheduledDate: Date | string; scheduledTime: string; duration: number; status: string }>(
  bookings: T[]
): (T & { sessionPhase: SessionPhase })[] {
  return bookings.map(booking => ({
    ...booking,
    sessionPhase: calculateSessionPhase(
      booking.scheduledDate,
      booking.scheduledTime,
      booking.duration,
      booking.status
    ),
  }));
}

// Helper function to expire bookings and cancel their Stripe payment intents
async function expireBookingsAndCancelPayments(photographerId?: string): Promise<void> {
  const expiredBookings = await storage.expireOldPendingBookings(photographerId);
  
  // Cancel payment intents for expired bookings
  if (expiredBookings.length > 0) {
    try {
      const stripe = await getUncachableStripeClient();
      for (const booking of expiredBookings) {
        if (booking.stripePaymentId) {
          try {
            await stripe.paymentIntents.cancel(booking.stripePaymentId);
            console.log(`Payment authorization cancelled for expired booking ${booking.id}`);
          } catch (stripeError: any) {
            // Payment may already be cancelled - log but don't fail
            console.log(`Note: Could not cancel payment for booking ${booking.id}:`, stripeError.message);
          }
        }
      }
    } catch (error) {
      // Stripe not configured - skip payment cancellation
      console.log("Stripe not configured, skipping payment cancellation for expired bookings");
    }
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });
      
      // Don't send password back
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      // Validate login payload
      const loginSchema = z.object({
        email: z.string().email(),
        password: z.string().min(6),
      });
      
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Set session
      req.session.userId = user.id;
      
      // Check if photographer has completed onboarding
      let hasPhotographerProfile = false;
      if (user.role === "photographer") {
        const profile = await storage.getPhotographerByUserId(user.id);
        hasPhotographerProfile = profile !== null;
      }
      
      const { password: _, ...userWithoutPassword } = user;
      res.json({ ...userWithoutPassword, hasPhotographerProfile });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ error: "Invalid request" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Check if photographer has completed onboarding
    let hasPhotographerProfile = false;
    if (user.role === "photographer") {
      const profile = await storage.getPhotographerByUserId(user.id);
      hasPhotographerProfile = profile !== null;
    }
    
    const { password, ...userWithoutPassword } = user;
    res.json({ ...userWithoutPassword, hasPhotographerProfile });
  });

  // Update current user profile
  app.patch("/api/users/me", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const allowedFields = ["fullName", "phone", "profileImageUrl"];
      const updateData: Record<string, any> = {};
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      }
      
      const updatedUser = await storage.updateUser(req.session.userId, updateData);
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(400).json({ error: "Failed to update profile" });
    }
  });

  // Change password
  app.post("/api/users/me/change-password", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const passwordSchema = z.object({
        currentPassword: z.string().min(6),
        newPassword: z.string().min(6),
      });
      
      const { currentPassword, newPassword } = passwordSchema.parse(req.body);
      
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const validPassword = await bcrypt.compare(currentPassword, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }
      
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await storage.updateUser(req.session.userId, { password: hashedPassword });
      
      res.json({ success: true, message: "Password changed successfully" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(400).json({ error: "Failed to change password" });
    }
  });

  // Get upload URL for user profile photo
  app.post("/api/users/me/upload-url", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const objectStorageService = new ObjectStorageService();
      const uploadUrl = await objectStorageService.getObjectEntityUploadURL();
      
      res.json({ uploadUrl });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  // Set user profile picture (after upload, set ACL and save URL)
  app.post("/api/users/me/profile-picture", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      if (!req.body.imageURL) {
        return res.status(400).json({ error: "imageURL is required" });
      }

      const userId = req.session.userId;
      const objectStorageService = new ObjectStorageService();
      
      // Set ACL policy - owner is the user, visibility is public
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.imageURL,
        {
          owner: userId,
          visibility: "public",
        },
      );

      // Update user profile with the image URL
      const user = await storage.updateUser(userId, { profileImageUrl: objectPath });
      res.status(200).json(user);
    } catch (error) {
      console.error("Error setting user profile picture:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Photographer Routes
  
  // Get current photographer's own profile with session state
  app.get("/api/photographers/me", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const photographer = await storage.getPhotographerByUserId(req.session.userId);
      if (!photographer) {
        return res.status(404).json({ error: "Photographer profile not found" });
      }
      
      // Calculate session state based on current bookings
      const bookings = await storage.getBookingsByPhotographerWithCustomer(photographer.id);
      const now = new Date();
      
      // Check if photographer is currently in an active session
      const activeSession = bookings.find((b: any) => {
        if (b.status !== 'confirmed' && b.status !== 'in_progress') return false;
        
        const sessionDate = new Date(b.scheduledDate);
        const [hours, minutes] = b.scheduledTime.split(':').map(Number);
        sessionDate.setHours(hours, minutes, 0, 0);
        
        const sessionEnd = new Date(sessionDate);
        sessionEnd.setHours(sessionEnd.getHours() + b.duration);
        
        return now >= sessionDate && now <= sessionEnd;
      });
      
      // Find next available time (next booking start or end of current session)
      let nextAvailableAt: string | null = null;
      if (activeSession) {
        const sessionDate = new Date(activeSession.scheduledDate);
        const [hours, minutes] = activeSession.scheduledTime.split(':').map(Number);
        sessionDate.setHours(hours, minutes, 0, 0);
        const sessionEnd = new Date(sessionDate);
        sessionEnd.setHours(sessionEnd.getHours() + activeSession.duration);
        nextAvailableAt = sessionEnd.toISOString();
      }
      
      // Determine session state
      let sessionState: 'available' | 'in_session' | 'offline' = 'offline';
      if (!photographer.isAvailable) {
        sessionState = 'offline';
      } else if (activeSession) {
        sessionState = 'in_session';
      } else {
        sessionState = 'available';
      }
      
      res.json({
        ...photographer,
        sessionState,
        nextAvailableAt,
      });
    } catch (error) {
      console.error("Error fetching own photographer profile:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  // Update current photographer's own profile
  app.patch("/api/photographers/me", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const photographer = await storage.getPhotographerByUserId(req.session.userId);
      if (!photographer) {
        return res.status(404).json({ error: "Photographer profile not found" });
      }
      
      // Only allow updating certain fields
      const allowedFields = ["bio", "hourlyRate", "location", "profileImageUrl", "portfolioImages", "isAvailable"];
      const updateData: Record<string, any> = {};
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      }
      
      const updatedPhotographer = await storage.updatePhotographer(photographer.id, updateData);
      res.json(updatedPhotographer);
    } catch (error) {
      console.error("Error updating photographer profile:", error);
      res.status(400).json({ error: "Failed to update profile" });
    }
  });

  // Get upload URL for portfolio photos
  app.post("/api/photographers/me/upload-url", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const photographer = await storage.getPhotographerByUserId(req.session.userId);
      if (!photographer) {
        return res.status(404).json({ error: "Photographer profile not found" });
      }
      
      const objectStorageService = new ObjectStorageService();
      const uploadUrl = await objectStorageService.getObjectEntityUploadURL();
      
      res.json({ uploadUrl });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  // Add photo to portfolio
  app.post("/api/photographers/me/portfolio", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const photographer = await storage.getPhotographerByUserId(req.session.userId);
      if (!photographer) {
        return res.status(404).json({ error: "Photographer profile not found" });
      }
      
      const { imageUrl } = req.body;
      if (!imageUrl) {
        return res.status(400).json({ error: "Image URL required" });
      }
      
      // Convert object storage path to accessible URL and make it public
      const objectStorageService = new ObjectStorageService();
      const normalizedUrl = await objectStorageService.trySetObjectEntityAclPolicy(
        imageUrl,
        {
          owner: req.session.userId,
          visibility: "public",
        }
      );
      
      // Add to existing portfolio images
      const currentImages = photographer.portfolioImages || [];
      const updatedImages = [...currentImages, normalizedUrl];
      
      const updatedPhotographer = await storage.updatePhotographer(photographer.id, {
        portfolioImages: updatedImages,
      });
      
      res.json(updatedPhotographer);
    } catch (error) {
      console.error("Error adding portfolio photo:", error);
      res.status(500).json({ error: "Failed to add photo" });
    }
  });

  // Update profile picture
  app.post("/api/photographers/me/profile-picture", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const photographer = await storage.getPhotographerByUserId(req.session.userId);
      if (!photographer) {
        return res.status(404).json({ error: "Photographer profile not found" });
      }
      
      const { imageUrl } = req.body;
      if (!imageUrl) {
        return res.status(400).json({ error: "Image URL required" });
      }
      
      // Convert object storage path to accessible URL and make it public
      const objectStorageService = new ObjectStorageService();
      const normalizedUrl = await objectStorageService.trySetObjectEntityAclPolicy(
        imageUrl,
        {
          owner: req.session.userId,
          visibility: "public",
        }
      );
      
      const updatedPhotographer = await storage.updatePhotographer(photographer.id, {
        profileImageUrl: normalizedUrl,
      });
      
      res.json(updatedPhotographer);
    } catch (error) {
      console.error("Error updating profile picture:", error);
      res.status(500).json({ error: "Failed to update profile picture" });
    }
  });

  // Delete photo from portfolio
  app.delete("/api/photographers/me/portfolio", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const photographer = await storage.getPhotographerByUserId(req.session.userId);
      if (!photographer) {
        return res.status(404).json({ error: "Photographer profile not found" });
      }
      
      const { imageUrl } = req.body;
      if (!imageUrl) {
        return res.status(400).json({ error: "Image URL required" });
      }
      
      // Remove from portfolio images
      const currentImages = photographer.portfolioImages || [];
      const updatedImages = currentImages.filter((img: string) => img !== imageUrl);
      
      const updatedPhotographer = await storage.updatePhotographer(photographer.id, {
        portfolioImages: updatedImages,
      });
      
      res.json(updatedPhotographer);
    } catch (error) {
      console.error("Error deleting portfolio photo:", error);
      res.status(500).json({ error: "Failed to delete photo" });
    }
  });

  // Reorder portfolio photos
  app.put("/api/photographers/me/portfolio/reorder", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const photographer = await storage.getPhotographerByUserId(req.session.userId);
      if (!photographer) {
        return res.status(404).json({ error: "Photographer profile not found" });
      }
      
      const { images } = req.body;
      if (!Array.isArray(images)) {
        return res.status(400).json({ error: "Images array required" });
      }
      
      const updatedPhotographer = await storage.updatePhotographer(photographer.id, {
        portfolioImages: images,
      });
      
      res.json(updatedPhotographer);
    } catch (error) {
      console.error("Error reordering portfolio photos:", error);
      res.status(500).json({ error: "Failed to reorder photos" });
    }
  });

  app.get("/api/photographers", async (req, res) => {
    try {
      const photographers = await storage.getAllPhotographersWithUsers();
      const now = new Date();
      
      // Add session state to each photographer
      const photographersWithState = await Promise.all(
        photographers.map(async (photographer: any) => {
          const bookings = await storage.getBookingsByPhotographerWithCustomer(photographer.id);
          
          // Check if photographer is currently in an active session
          const activeSession = bookings.find((b: any) => {
            if (b.status !== 'confirmed' && b.status !== 'in_progress') return false;
            
            const sessionDate = new Date(b.scheduledDate);
            const [hours, minutes] = b.scheduledTime.split(':').map(Number);
            sessionDate.setHours(hours, minutes, 0, 0);
            
            const sessionEnd = new Date(sessionDate);
            sessionEnd.setHours(sessionEnd.getHours() + b.duration);
            
            return now >= sessionDate && now <= sessionEnd;
          });
          
          // Find next available time
          let nextAvailableAt: string | null = null;
          if (activeSession) {
            const sessionDate = new Date(activeSession.scheduledDate);
            const [hours, minutes] = activeSession.scheduledTime.split(':').map(Number);
            sessionDate.setHours(hours, minutes, 0, 0);
            const sessionEnd = new Date(sessionDate);
            sessionEnd.setHours(sessionEnd.getHours() + activeSession.duration);
            nextAvailableAt = sessionEnd.toISOString();
          }
          
          // Determine session state
          let sessionState: 'available' | 'in_session' | 'offline' = 'offline';
          if (!photographer.isAvailable) {
            sessionState = 'offline';
          } else if (activeSession) {
            sessionState = 'in_session';
          } else {
            sessionState = 'available';
          }
          
          return {
            ...photographer,
            sessionState,
            nextAvailableAt,
          };
        })
      );
      
      res.json(photographersWithState);
    } catch (error) {
      console.error("Error fetching photographers:", error);
      res.status(500).json({ error: "Failed to fetch photographers" });
    }
  });

  app.get("/api/photographers/:id", async (req, res) => {
    try {
      const photographer = await storage.getPhotographerWithUser(req.params.id);
      if (!photographer) {
        return res.status(404).json({ error: "Photographer not found" });
      }
      
      // Calculate session state based on current bookings
      const bookings = await storage.getBookingsByPhotographerWithCustomer(req.params.id);
      const now = new Date();
      
      // Check if photographer is currently in an active session
      const activeSession = bookings.find((b: any) => {
        if (b.status !== 'confirmed' && b.status !== 'in_progress') return false;
        
        const sessionDate = new Date(b.scheduledDate);
        const [hours, minutes] = b.scheduledTime.split(':').map(Number);
        sessionDate.setHours(hours, minutes, 0, 0);
        
        const sessionEnd = new Date(sessionDate);
        sessionEnd.setHours(sessionEnd.getHours() + b.duration);
        
        return now >= sessionDate && now <= sessionEnd;
      });
      
      // Find next available time
      let nextAvailableAt: string | null = null;
      if (activeSession) {
        const sessionDate = new Date(activeSession.scheduledDate);
        const [hours, minutes] = activeSession.scheduledTime.split(':').map(Number);
        sessionDate.setHours(hours, minutes, 0, 0);
        const sessionEnd = new Date(sessionDate);
        sessionEnd.setHours(sessionEnd.getHours() + activeSession.duration);
        nextAvailableAt = sessionEnd.toISOString();
      }
      
      // Determine session state
      let sessionState: 'available' | 'in_session' | 'offline' = 'offline';
      if (!photographer.isAvailable) {
        sessionState = 'offline';
      } else if (activeSession) {
        sessionState = 'in_session';
      } else {
        sessionState = 'available';
      }
      
      res.json({
        ...photographer,
        sessionState,
        nextAvailableAt,
      });
    } catch (error) {
      console.error("Error fetching photographer:", error);
      res.status(500).json({ error: "Failed to fetch photographer" });
    }
  });

  app.post("/api/photographers", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      // Force userId to be the logged-in user (prevent spoofing)
      const photographerData = insertPhotographerSchema.parse({
        ...req.body,
        userId: req.session.userId, // Override any client-provided userId
      });
      
      const photographer = await storage.createPhotographer(photographerData);
      res.json(photographer);
    } catch (error) {
      console.error("Photographer creation error:", error);
      res.status(400).json({ error: "Invalid request" });
    }
  });

  app.patch("/api/photographers/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      // Verify the photographer belongs to the logged-in user
      const existingPhotographer = await storage.getPhotographer(req.params.id);
      if (!existingPhotographer) {
        return res.status(404).json({ error: "Photographer not found" });
      }
      
      if (existingPhotographer.userId !== req.session.userId) {
        return res.status(403).json({ error: "Cannot update another photographer's profile" });
      }
      
      const photographer = await storage.updatePhotographer(req.params.id, req.body);
      res.json(photographer);
    } catch (error) {
      res.status(400).json({ error: "Invalid request" });
    }
  });

  // Booking Routes
  app.post("/api/bookings", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      // Validate input with Zod
      const bookingInputSchema = z.object({
        photographerId: z.string(),
        duration: z.number().positive().int(),
        location: z.string().min(1),
        scheduledDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}T/)),
        scheduledTime: z.string(),
        stripePaymentIntentId: z.string().optional(),
      });
      
      const { photographerId, duration, location, scheduledDate, scheduledTime, stripePaymentIntentId } = bookingInputSchema.parse(req.body);
      
      // Verify photographer exists and is available
      const photographer = await storage.getPhotographer(photographerId);
      if (!photographer) {
        return res.status(404).json({ error: "Photographer not found" });
      }
      
      if (!photographer.isAvailable) {
        return res.status(400).json({ error: "Photographer is not available" });
      }
      
      // SERVER-SIDE calculation based on photographer's hourly rate (never trust client)
      // Two-sided revenue model:
      // - Customer pays: baseAmount + 10% service fee
      // - Platform takes: 20% from photographer's base earnings
      const hourlyRate = parseFloat(photographer.hourlyRate);
      const baseAmount = hourlyRate * duration; // What photographer charges
      const customerServiceFee = Math.round(baseAmount * 0.10 * 100) / 100; // 10% customer fee
      const totalAmount = Math.round((baseAmount + customerServiceFee) * 100) / 100; // Customer pays this
      const platformFee = Math.round(baseAmount * 0.20 * 100) / 100; // 20% from photographer
      const photographerEarnings = Math.round((baseAmount - platformFee) * 100) / 100;
      
      // Force customerId to be the logged-in user
      const booking = await storage.createBooking({
        customerId: req.session.userId, // Always use session userId
        photographerId,
        duration,
        location,
        scheduledDate: new Date(scheduledDate),
        scheduledTime,
        baseAmount: baseAmount.toFixed(2),
        customerServiceFee: customerServiceFee.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        platformFee: platformFee.toFixed(2),
        photographerEarnings: photographerEarnings.toFixed(2),
        stripePaymentId: stripePaymentIntentId, // Store payment intent ID for later capture/cancel
      });
      
      // Create earnings record
      await storage.createEarning({
        photographerId: booking.photographerId,
        bookingId: booking.id,
        grossAmount: baseAmount.toFixed(2),
        platformFee: platformFee.toFixed(2),
        netAmount: photographerEarnings.toFixed(2),
      });
      
      res.json(booking);
    } catch (error) {
      console.error("Booking creation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid booking data", details: error.errors });
      }
      res.status(400).json({ error: "Invalid request" });
    }
  });

  app.get("/api/bookings/customer/:customerId", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      // Only allow users to see their own bookings
      if (req.params.customerId !== req.session.userId) {
        return res.status(403).json({ error: "Cannot view another user's bookings" });
      }
      
      // Expire any old pending bookings for this customer before fetching
      await expireBookingsAndCancelPayments();
      
      const bookings = await storage.getBookingsByCustomerWithPhotographer(req.params.customerId);
      res.json(addSessionPhaseToBookings(bookings));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  app.get("/api/customer/bookings", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      await expireBookingsAndCancelPayments();
      const bookings = await storage.getBookingsByCustomerWithPhotographer(req.session.userId);
      res.json(addSessionPhaseToBookings(bookings));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  app.get("/api/photographer/bookings", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const photographer = await storage.getPhotographerByUserId(req.session.userId);
      if (!photographer) {
        return res.status(404).json({ error: "Photographer profile not found" });
      }
      
      await expireBookingsAndCancelPayments(photographer.id);
      const bookings = await storage.getBookingsByPhotographerWithCustomer(photographer.id);
      res.json(addSessionPhaseToBookings(bookings));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  app.get("/api/bookings/photographer/:photographerId", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      // Verify photographer belongs to the logged-in user
      const photographer = await storage.getPhotographer(req.params.photographerId);
      if (!photographer || photographer.userId !== req.session.userId) {
        return res.status(403).json({ error: "Cannot view another photographer's bookings" });
      }
      
      // Expire any old pending bookings for this photographer before fetching
      await expireBookingsAndCancelPayments(req.params.photographerId);
      
      // Return bookings with customer info for photographer view
      const bookings = await storage.getBookingsByPhotographerWithCustomer(req.params.photographerId);
      res.json(addSessionPhaseToBookings(bookings));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  // Get single booking with related data (for mobile app detail pages)
  app.get("/api/bookings/:bookingId", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const booking = await storage.getBooking(req.params.bookingId);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      
      // Verify user is part of this booking (either customer or photographer)
      const user = await storage.getUser(req.session.userId);
      const photographer = await storage.getPhotographer(booking.photographerId);
      
      const isCustomer = booking.customerId === req.session.userId;
      const isPhotographer = photographer?.userId === req.session.userId;
      
      if (!isCustomer && !isPhotographer) {
        return res.status(403).json({ error: "Not authorized to view this booking" });
      }
      
      // Get additional data based on user type
      let enrichedBooking: any = { ...booking };
      
      // Add session phase
      enrichedBooking.sessionPhase = calculateSessionPhase(
        booking.scheduledDate,
        booking.scheduledTime,
        booking.duration,
        booking.status
      );
      
      if (isCustomer && photographer) {
        // Customer view - include photographer info
        const photographerUser = await storage.getUser(photographer.userId);
        enrichedBooking.photographer = {
          id: photographer.id,
          profileImageUrl: photographer.profileImageUrl,
          hourlyRate: photographer.hourlyRate,
          user: photographerUser ? {
            id: photographerUser.id,
            fullName: photographerUser.fullName,
            email: photographerUser.email,
          } : null,
        };
      }
      
      if (isPhotographer) {
        // Photographer view - include customer info
        const customer = await storage.getUser(booking.customerId);
        enrichedBooking.customer = customer ? {
          id: customer.id,
          fullName: customer.fullName,
          email: customer.email,
          profileImageUrl: customer.profileImageUrl,
        } : null;
      }
      
      res.json(enrichedBooking);
    } catch (error) {
      console.error("Error fetching booking:", error);
      res.status(500).json({ error: "Failed to fetch booking" });
    }
  });

  // Update booking status (for photographers to accept/decline)
  app.patch("/api/bookings/:bookingId/status", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const { status } = req.body;
      if (!['pending', 'confirmed', 'cancelled', 'completed', 'declined'].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      
      const booking = await storage.getBooking(req.params.bookingId);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      
      // Verify the photographer owns this booking
      const photographer = await storage.getPhotographer(booking.photographerId);
      if (!photographer || photographer.userId !== req.session.userId) {
        return res.status(403).json({ error: "Not authorized to update this booking" });
      }
      
      // Handle Stripe payment based on status change
      if (booking.stripePaymentId) {
        const stripe = await getUncachableStripeClient();
        
        if (status === 'confirmed') {
          // Capture the payment when photographer accepts
          try {
            await stripe.paymentIntents.capture(booking.stripePaymentId);
            console.log(`Payment captured for booking ${booking.id}`);
          } catch (stripeError: any) {
            console.error("Failed to capture payment:", stripeError);
            return res.status(500).json({ error: "Failed to capture payment. The authorization may have expired." });
          }
        } else if (status === 'cancelled' || status === 'declined') {
          // Cancel the payment authorization when photographer declines
          try {
            await stripe.paymentIntents.cancel(booking.stripePaymentId);
            console.log(`Payment authorization cancelled for booking ${booking.id}`);
          } catch (stripeError: any) {
            // Payment may already be cancelled or captured - log but don't fail
            console.log("Payment cancellation note:", stripeError.message);
          }
        }
      }
      
      const updatedBooking = await storage.updateBookingStatus(req.params.bookingId, status);
      
      // Broadcast booking status change
      broadcastToBooking(req.params.bookingId, "booking.updated", updatedBooking);
      broadcastToCustomer(booking.customerId, "booking.updated", updatedBooking);
      
      res.json(updatedBooking);
    } catch (error) {
      console.error("Booking status update error:", error);
      res.status(500).json({ error: "Failed to update booking status" });
    }
  });

  // Earnings Routes
  app.get("/api/earnings/photographer/:photographerId", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      // Verify photographer belongs to the logged-in user
      const photographer = await storage.getPhotographer(req.params.photographerId);
      if (!photographer || photographer.userId !== req.session.userId) {
        return res.status(403).json({ error: "Cannot view another photographer's earnings" });
      }
      
      const earnings = await storage.getEarningsByPhotographer(req.params.photographerId);
      res.json(earnings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch earnings" });
    }
  });

  app.get("/api/earnings/photographer/:photographerId/summary", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      // Verify photographer belongs to the logged-in user
      const photographer = await storage.getPhotographer(req.params.photographerId);
      if (!photographer || photographer.userId !== req.session.userId) {
        return res.status(403).json({ error: "Cannot view another photographer's earnings" });
      }
      
      const summary = await storage.getTotalEarnings(req.params.photographerId);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch earnings summary" });
    }
  });

  // Dismiss expired/cancelled booking (customer or photographer)
  app.post("/api/bookings/:bookingId/dismiss", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const booking = await storage.getBooking(req.params.bookingId);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      // Get photographer profile if user is a photographer
      const photographer = await storage.getPhotographerByUserId(req.session.userId);
      
      // Check if user is the customer OR the photographer for this booking
      const isCustomer = booking.customerId === req.session.userId;
      const isPhotographer = photographer && booking.photographerId === photographer.id;
      
      if (!isCustomer && !isPhotographer) {
        return res.status(403).json({ error: "Not authorized to dismiss this booking" });
      }

      // Only expired, cancelled, or declined bookings can be dismissed
      if (booking.status !== "expired" && booking.status !== "cancelled" && booking.status !== "declined") {
        return res.status(400).json({ error: "Only expired, cancelled, or declined bookings can be dismissed" });
      }

      // Update the booking with dismissedAt timestamp
      await storage.dismissBooking(req.params.bookingId);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error dismissing booking:", error);
      res.status(500).json({ error: "Failed to dismiss booking" });
    }
  });

  // Photo Spots Routes
  app.get("/api/photo-spots", async (req, res) => {
    try {
      const { city } = req.query;
      if (city && typeof city === 'string') {
        const spots = await storage.getPhotoSpotsByCity(city);
        return res.json(spots);
      }
      const spots = await storage.getAllPhotoSpots();
      res.json(spots);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch photo spots" });
    }
  });

  app.get("/api/photo-spots/:id", async (req, res) => {
    try {
      const spot = await storage.getPhotoSpot(req.params.id);
      if (!spot) {
        return res.status(404).json({ error: "Photo spot not found" });
      }
      res.json(spot);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch photo spot" });
    }
  });

  // Photo Delivery Routes
  
  // Get photo delivery for a booking (customer view)
  app.get("/api/bookings/:bookingId/photos", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const booking = await storage.getBooking(req.params.bookingId);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      
      // Verify the customer owns this booking
      if (booking.customerId !== req.session.userId) {
        // Also check if user is the photographer
        const photographer = await storage.getPhotographerByUserId(req.session.userId);
        if (!photographer || photographer.id !== booking.photographerId) {
          return res.status(403).json({ error: "Not authorized to view these photos" });
        }
      }
      
      const delivery = await storage.getPhotoDeliveryByBooking(req.params.bookingId);
      res.json(delivery || null);
    } catch (error) {
      console.error("Error fetching photo delivery:", error);
      res.status(500).json({ error: "Failed to fetch photos" });
    }
  });

  // Create or update photo delivery (photographer only)
  app.post("/api/bookings/:bookingId/photos", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const booking = await storage.getBooking(req.params.bookingId);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      
      // Verify the photographer owns this booking
      const photographer = await storage.getPhotographerByUserId(req.session.userId);
      if (!photographer || photographer.id !== booking.photographerId) {
        return res.status(403).json({ error: "Not authorized to upload photos" });
      }
      
      // Check if delivery already exists
      let delivery = await storage.getPhotoDeliveryByBooking(req.params.bookingId);
      
      if (delivery) {
        // Update existing delivery
        delivery = await storage.updatePhotoDelivery(delivery.id, {
          message: req.body.message,
        });
      } else {
        // Create new delivery
        delivery = await storage.createPhotoDelivery({
          bookingId: req.params.bookingId,
          photographerId: photographer.id,
          photos: [],
          message: req.body.message,
        });
      }
      
      res.json(delivery);
    } catch (error) {
      console.error("Error creating photo delivery:", error);
      res.status(500).json({ error: "Failed to create photo delivery" });
    }
  });

  // Add photo to delivery (photographer only)
  app.post("/api/bookings/:bookingId/photos/upload", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const booking = await storage.getBooking(req.params.bookingId);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      
      // Verify the photographer owns this booking
      const photographer = await storage.getPhotographerByUserId(req.session.userId);
      if (!photographer || photographer.id !== booking.photographerId) {
        return res.status(403).json({ error: "Not authorized to upload photos" });
      }
      
      const { imageUrl } = req.body;
      if (!imageUrl) {
        return res.status(400).json({ error: "Image URL required" });
      }
      
      // Make the photo accessible (public for now, could be private with access control)
      const objectStorageService = new ObjectStorageService();
      const normalizedUrl = await objectStorageService.trySetObjectEntityAclPolicy(
        imageUrl,
        {
          owner: req.session.userId,
          visibility: "public",
        }
      );
      
      // Get or create delivery
      let delivery = await storage.getPhotoDeliveryByBooking(req.params.bookingId);
      
      if (!delivery) {
        delivery = await storage.createPhotoDelivery({
          bookingId: req.params.bookingId,
          photographerId: photographer.id,
          photos: [normalizedUrl],
        });
      } else {
        delivery = await storage.addPhotoToDelivery(delivery.id, normalizedUrl);
      }
      
      // Automatically mark booking as completed when photos are delivered
      if (booking.status === 'confirmed') {
        await storage.updateBookingStatus(booking.id, 'completed');
        
        // Release payment to photographer now that photos are uploaded
        await storage.releaseEarningsByBooking(booking.id);
      }
      
      res.json(delivery);
    } catch (error) {
      console.error("Error uploading photo:", error);
      res.status(500).json({ error: "Failed to upload photo" });
    }
  });

  // Mark photos as downloaded (customer action)
  app.post("/api/bookings/:bookingId/photos/downloaded", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const booking = await storage.getBooking(req.params.bookingId);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      
      // Verify the customer owns this booking
      if (booking.customerId !== req.session.userId) {
        return res.status(403).json({ error: "Not authorized" });
      }
      
      const delivery = await storage.getPhotoDeliveryByBooking(req.params.bookingId);
      if (!delivery) {
        return res.status(404).json({ error: "No photos found for this booking" });
      }
      
      const updatedDelivery = await storage.markPhotoDeliveryDownloaded(delivery.id);
      res.json(updatedDelivery);
    } catch (error) {
      console.error("Error marking photos as downloaded:", error);
      res.status(500).json({ error: "Failed to update download status" });
    }
  });

  // Review Routes
  
  // Get reviews for a photographer
  app.get("/api/photographers/:id/reviews", async (req, res) => {
    try {
      const photographerId = req.params.id;
      const reviews = await storage.getReviewsByPhotographer(photographerId);
      const { averageRating, reviewCount } = await storage.getPhotographerAverageRating(photographerId);
      
      res.json({
        reviews,
        averageRating,
        reviewCount,
      });
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });
  
  // Check if a booking can be reviewed
  app.get("/api/bookings/:bookingId/can-review", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const booking = await storage.getBooking(req.params.bookingId);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      
      // Only the customer who made the booking can review
      if (booking.customerId !== req.session.userId) {
        return res.json({ canReview: false, reason: "Not your booking" });
      }
      
      // Only completed bookings can be reviewed
      if (booking.status !== 'completed') {
        return res.json({ canReview: false, reason: "Booking not completed" });
      }
      
      // Check if review already exists
      const existingReview = await storage.getReviewByBooking(req.params.bookingId);
      if (existingReview) {
        return res.json({ canReview: false, reason: "Already reviewed", review: existingReview });
      }
      
      res.json({ canReview: true });
    } catch (error) {
      console.error("Error checking review eligibility:", error);
      res.status(500).json({ error: "Failed to check review eligibility" });
    }
  });
  
  // Submit a review for a booking
  app.post("/api/bookings/:bookingId/reviews", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const booking = await storage.getBooking(req.params.bookingId);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      
      // Verify the customer owns this booking
      if (booking.customerId !== req.session.userId) {
        return res.status(403).json({ error: "Cannot review another customer's booking" });
      }
      
      // Verify booking is completed
      if (booking.status !== 'completed') {
        return res.status(400).json({ error: "Can only review completed bookings" });
      }
      
      // Check if review already exists
      const existingReview = await storage.getReviewByBooking(req.params.bookingId);
      if (existingReview) {
        return res.status(400).json({ error: "Booking already reviewed" });
      }
      
      // Validate review data
      const reviewSchema = z.object({
        rating: z.number().int().min(1).max(5),
        comment: z.string().optional(),
      });
      
      const { rating, comment } = reviewSchema.parse(req.body);
      
      const review = await storage.createReview({
        bookingId: req.params.bookingId,
        photographerId: booking.photographerId,
        customerId: req.session.userId,
        rating,
        comment: comment || null,
      });
      
      res.json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(400).json({ error: "Failed to create review" });
    }
  });
  
  // Get review for a specific booking
  app.get("/api/bookings/:bookingId/reviews", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const booking = await storage.getBooking(req.params.bookingId);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      
      // Allow the customer or the photographer to view the review
      const photographer = await storage.getPhotographerByUserId(req.session.userId);
      const isPhotographer = photographer && photographer.id === booking.photographerId;
      
      if (booking.customerId !== req.session.userId && !isPhotographer) {
        return res.status(403).json({ error: "Not authorized" });
      }
      
      const review = await storage.getReviewByBooking(req.params.bookingId);
      if (!review) {
        return res.status(404).json({ error: "No review found for this booking" });
      }
      
      res.json(review);
    } catch (error) {
      console.error("Error fetching review:", error);
      res.status(500).json({ error: "Failed to fetch review" });
    }
  });
  
  // Photographer responds to a review
  app.post("/api/reviews/:reviewId/respond", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const review = await storage.getReview(req.params.reviewId);
      if (!review) {
        return res.status(404).json({ error: "Review not found" });
      }
      
      // Verify the photographer owns this review
      const photographer = await storage.getPhotographerByUserId(req.session.userId);
      if (!photographer || photographer.id !== review.photographerId) {
        return res.status(403).json({ error: "Only the photographer can respond to this review" });
      }
      
      // Check if already responded
      if (review.photographerResponse) {
        return res.status(400).json({ error: "Already responded to this review" });
      }
      
      const responseSchema = z.object({
        response: z.string().min(1).max(500),
      });
      
      const { response } = responseSchema.parse(req.body);
      
      const updatedReview = await storage.addPhotographerResponse(req.params.reviewId, response);
      res.json(updatedReview);
    } catch (error) {
      console.error("Error responding to review:", error);
      res.status(400).json({ error: "Failed to respond to review" });
    }
  });

  // ===== EDITING SERVICES ROUTES =====
  
  // Get photographer's editing service settings
  app.get("/api/editing-services/:photographerId", async (req, res) => {
    try {
      const service = await storage.getEditingService(req.params.photographerId);
      res.json(service || null);
    } catch (error) {
      console.error("Error fetching editing service:", error);
      res.status(500).json({ error: "Failed to fetch editing service" });
    }
  });

  // Get current photographer's editing service settings
  app.get("/api/editing-services/me/settings", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const photographer = await storage.getPhotographerByUserId(req.session.userId);
      if (!photographer) {
        return res.status(404).json({ error: "Photographer profile not found" });
      }

      const service = await storage.getEditingService(photographer.id);
      res.json(service || null);
    } catch (error) {
      console.error("Error fetching editing service settings:", error);
      res.status(500).json({ error: "Failed to fetch editing service settings" });
    }
  });

  // Update photographer's editing service settings
  app.put("/api/editing-services/me/settings", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const photographer = await storage.getPhotographerByUserId(req.session.userId);
      if (!photographer) {
        return res.status(404).json({ error: "Photographer profile not found" });
      }

      const settingsSchema = z.object({
        isEnabled: z.boolean(),
        pricingModel: z.enum(["flat", "per_photo"]),
        flatRate: z.string().nullable().optional(),
        perPhotoRate: z.string().nullable().optional(),
        turnaroundDays: z.number().min(1).max(30).optional(),
        description: z.string().max(500).nullable().optional(),
      });

      const settings = settingsSchema.parse(req.body);
      const service = await storage.updateEditingService(photographer.id, settings);
      res.json(service);
    } catch (error) {
      console.error("Error updating editing service settings:", error);
      res.status(400).json({ error: "Failed to update editing service settings" });
    }
  });

  // ===== EDITING REQUESTS ROUTES =====

  // Create an editing request
  app.post("/api/editing-requests", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const requestSchema = z.object({
        bookingId: z.string(),
        photographerId: z.string(),
        photoCount: z.number().min(1).optional(),
        customerNotes: z.string().max(500).optional(),
        requestedPhotoUrls: z.array(z.string()).optional(),
      });

      const { bookingId, photographerId, photoCount, customerNotes, requestedPhotoUrls } = requestSchema.parse(req.body);

      // Verify the booking belongs to this customer
      const booking = await storage.getBooking(bookingId);
      if (!booking || booking.customerId !== req.session.userId) {
        return res.status(403).json({ error: "Booking not found or access denied" });
      }

      // Check if an editing request already exists for this booking
      const existingRequest = await storage.getEditingRequestByBooking(bookingId);
      if (existingRequest) {
        return res.status(400).json({ error: "An editing request already exists for this booking" });
      }

      // Get photographer's editing service settings
      const editingService = await storage.getEditingService(photographerId);
      if (!editingService || !editingService.isEnabled) {
        return res.status(400).json({ error: "Editing service not available for this photographer" });
      }

      // Calculate pricing (same 10% customer fee, 20% platform fee model)
      let baseAmount: number;
      if (editingService.pricingModel === "per_photo" && editingService.perPhotoRate && photoCount) {
        baseAmount = parseFloat(editingService.perPhotoRate) * photoCount;
      } else if (editingService.flatRate) {
        baseAmount = parseFloat(editingService.flatRate);
      } else {
        return res.status(400).json({ error: "Pricing not configured" });
      }

      const customerServiceFee = baseAmount * 0.10;
      const totalAmount = baseAmount + customerServiceFee;
      const platformFee = baseAmount * 0.20;
      const photographerEarnings = baseAmount - platformFee;

      const editingRequest = await storage.createEditingRequest({
        bookingId,
        customerId: req.session.userId,
        photographerId,
        photoCount: photoCount || null,
        pricingModel: editingService.pricingModel,
        baseAmount: baseAmount.toFixed(2),
        customerServiceFee: customerServiceFee.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        platformFee: platformFee.toFixed(2),
        photographerEarnings: photographerEarnings.toFixed(2),
        status: "requested",
        customerNotes: customerNotes || null,
        photographerNotes: null,
        requestedPhotoUrls: requestedPhotoUrls || [],
      });

      res.json(editingRequest);
    } catch (error) {
      console.error("Error creating editing request:", error);
      res.status(400).json({ error: "Failed to create editing request" });
    }
  });

  // Get editing request by booking ID
  app.get("/api/editing-requests/booking/:bookingId", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const editingRequest = await storage.getEditingRequestByBooking(req.params.bookingId);
      res.json(editingRequest || null);
    } catch (error) {
      console.error("Error fetching editing request:", error);
      res.status(500).json({ error: "Failed to fetch editing request" });
    }
  });

  // Get all editing requests for photographer (using session)
  app.get("/api/editing-requests/photographer", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const photographer = await storage.getPhotographerByUserId(req.session.userId);
      if (!photographer) {
        return res.status(404).json({ error: "Photographer profile not found" });
      }

      const requests = await storage.getEditingRequestsByPhotographer(photographer.id);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching editing requests:", error);
      res.status(500).json({ error: "Failed to fetch editing requests" });
    }
  });

  // Get all editing requests for photographer by ID
  app.get("/api/editing-requests/photographer/:photographerId", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Verify the logged-in user is the photographer
      const photographer = await storage.getPhotographerByUserId(req.session.userId);
      if (!photographer || photographer.id !== req.params.photographerId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const requests = await storage.getEditingRequestsByPhotographer(req.params.photographerId);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching editing requests:", error);
      res.status(500).json({ error: "Failed to fetch editing requests" });
    }
  });

  // Get all editing requests for customer
  app.get("/api/editing-requests/customer", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const requests = await storage.getEditingRequestsByCustomer(req.session.userId);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching editing requests:", error);
      res.status(500).json({ error: "Failed to fetch editing requests" });
    }
  });

  // Update editing request status (photographer accepts/declines/starts work)
  app.patch("/api/editing-requests/:requestId/status", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const statusSchema = z.object({
        status: z.enum(["accepted", "declined", "in_progress"]),
        photographerNotes: z.string().max(500).optional(),
      });

      const { status, photographerNotes } = statusSchema.parse(req.body);

      const editingRequest = await storage.getEditingRequest(req.params.requestId);
      if (!editingRequest) {
        return res.status(404).json({ error: "Editing request not found" });
      }

      // Verify the photographer owns this request
      const photographer = await storage.getPhotographerByUserId(req.session.userId);
      if (!photographer || photographer.id !== editingRequest.photographerId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const updatedRequest = await storage.updateEditingRequestStatus(
        req.params.requestId,
        status,
        photographerNotes
      );
      res.json(updatedRequest);
    } catch (error) {
      console.error("Error updating editing request status:", error);
      res.status(400).json({ error: "Failed to update editing request" });
    }
  });

  // Deliver edited photos
  app.post("/api/editing-requests/:requestId/deliver", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const deliverSchema = z.object({
        editedPhotos: z.array(z.string()).min(1),
        photographerNotes: z.string().max(500).optional(),
      });

      const { editedPhotos, photographerNotes } = deliverSchema.parse(req.body);

      const editingRequest = await storage.getEditingRequest(req.params.requestId);
      if (!editingRequest) {
        return res.status(404).json({ error: "Editing request not found" });
      }

      // Verify the photographer owns this request
      const photographer = await storage.getPhotographerByUserId(req.session.userId);
      if (!photographer || photographer.id !== editingRequest.photographerId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const updatedRequest = await storage.deliverEditedPhotos(req.params.requestId, editedPhotos, photographerNotes);
      res.json(updatedRequest);
    } catch (error) {
      console.error("Error delivering edited photos:", error);
      res.status(400).json({ error: "Failed to deliver edited photos" });
    }
  });

  // Customer confirms completion of editing request
  app.patch("/api/editing-requests/:requestId/complete", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const editingRequest = await storage.getEditingRequest(req.params.requestId);
      if (!editingRequest) {
        return res.status(404).json({ error: "Editing request not found" });
      }

      // Verify the customer owns this request
      if (editingRequest.customerId !== req.session.userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      if (editingRequest.status !== "delivered") {
        return res.status(400).json({ error: "Cannot complete - photos not yet delivered" });
      }

      const updatedRequest = await storage.completeEditingRequest(req.params.requestId);
      res.json(updatedRequest);
    } catch (error) {
      console.error("Error completing editing request:", error);
      res.status(400).json({ error: "Failed to complete editing request" });
    }
  });

  // Customer requests revision of edited photos
  app.post("/api/editing-requests/:requestId/request-revision", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const revisionSchema = z.object({
        revisionNotes: z.string().min(1).max(1000),
      });

      const { revisionNotes } = revisionSchema.parse(req.body);

      const editingRequest = await storage.getEditingRequest(req.params.requestId);
      if (!editingRequest) {
        return res.status(404).json({ error: "Editing request not found" });
      }

      // Verify the customer owns this request
      if (editingRequest.customerId !== req.session.userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      if (editingRequest.status !== "delivered") {
        return res.status(400).json({ error: "Cannot request revision - photos not yet delivered" });
      }

      const updatedRequest = await storage.requestRevision(req.params.requestId, revisionNotes);
      res.json(updatedRequest);
    } catch (error) {
      console.error("Error requesting revision:", error);
      res.status(400).json({ error: "Failed to request revision" });
    }
  });

  // Object Storage Routes
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    const objectStorageService = new ObjectStorageService();
    try {
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/objects/:objectPath(*)", async (req, res) => {
    console.log("Object request:", req.path, "userId:", req.session.userId);
    if (!req.session.userId) {
      console.log("Object request denied - not authenticated");
      return res.status(401).json({ error: "Not authenticated" });
    }

    const userId = req.session.userId;
    const objectStorageService = new ObjectStorageService();
    try {
      console.log("Getting object file for path:", req.path);
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      console.log("Object file found:", objectFile.name);
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: userId,
      });
      console.log("Can access:", canAccess);
      if (!canAccess) {
        console.log("Access denied for user:", userId);
        return res.sendStatus(401);
      }
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.post("/api/objects/upload", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const objectStorageService = new ObjectStorageService();
    const { uploadURL, objectPath } = await objectStorageService.getObjectEntityUploadURL();
    res.json({ uploadURL, objectPath });
  });

  app.post("/api/objects/set-acl", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { objectPath } = req.body;
    if (!objectPath) {
      return res.status(400).json({ error: "objectPath is required" });
    }

    try {
      const objectStorageService = new ObjectStorageService();
      const normalizedPath = await objectStorageService.trySetObjectEntityAclPolicy(
        objectPath,
        {
          owner: req.session.userId,
          visibility: "public",
        }
      );
      res.json({ objectPath: normalizedPath });
    } catch (error) {
      console.error("Error setting object ACL:", error);
      res.status(500).json({ error: "Failed to set object access" });
    }
  });

  app.put("/api/photographer-images", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (!req.body.imageURL) {
      return res.status(400).json({ error: "imageURL is required" });
    }

    const userId = req.session.userId;

    try {
      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.imageURL,
        {
          owner: userId,
          visibility: "public",
        },
      );

      res.status(200).json({
        objectPath: objectPath,
      });
    } catch (error) {
      console.error("Error setting photographer image:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Message Routes
  app.get("/api/bookings/:bookingId/messages", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { bookingId } = req.params;
      const booking = await storage.getBooking(bookingId);
      
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      // Check if user is part of this booking (customer or photographer)
      const photographer = await storage.getPhotographerByUserId(req.session.userId);
      const isCustomer = booking.customerId === req.session.userId;
      const isPhotographer = photographer && booking.photographerId === photographer.id;

      if (!isCustomer && !isPhotographer) {
        return res.status(403).json({ error: "Not authorized to view these messages" });
      }

      const messages = await storage.getMessagesByBooking(bookingId);
      
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/bookings/:bookingId/messages", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { bookingId } = req.params;
      const { body } = req.body;

      if (!body || typeof body !== "string" || body.trim().length === 0) {
        return res.status(400).json({ error: "Message body is required" });
      }

      const booking = await storage.getBooking(bookingId);
      
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      // Check if user is part of this booking
      const photographer = await storage.getPhotographerByUserId(req.session.userId);
      const isCustomer = booking.customerId === req.session.userId;
      const isPhotographer = photographer && booking.photographerId === photographer.id;

      if (!isCustomer && !isPhotographer) {
        return res.status(403).json({ error: "Not authorized to send messages in this booking" });
      }

      const message = await storage.createMessage({
        bookingId,
        senderId: req.session.userId,
        body: body.trim(),
      });

      // Return the message with sender info
      const user = await storage.getUser(req.session.userId);
      const messageWithSender = {
        ...message,
        sender: {
          fullName: user?.fullName || "Unknown",
          profileImageUrl: user?.profileImageUrl || null,
        },
      };

      // Broadcast new message to booking channel
      broadcastToBooking(bookingId, "message.new", messageWithSender);

      res.status(201).json(messageWithSender);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  app.get("/api/messages/unread-count", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const count = await storage.getUnreadMessageCount(req.session.userId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread count:", error);
      res.status(500).json({ error: "Failed to fetch unread count" });
    }
  });

  app.post("/api/bookings/:bookingId/messages/mark-read", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { bookingId } = req.params;
      const booking = await storage.getBooking(bookingId);
      
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      const photographer = await storage.getPhotographerByUserId(req.session.userId);
      const isCustomer = booking.customerId === req.session.userId;
      const isPhotographer = photographer && booking.photographerId === photographer.id;

      if (!isCustomer && !isPhotographer) {
        return res.status(403).json({ error: "Not authorized" });
      }

      await storage.markMessagesAsRead(bookingId, req.session.userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking messages as read:", error);
      res.status(500).json({ error: "Failed to mark messages as read" });
    }
  });

  // Meeting Location Routes
  app.patch("/api/bookings/:bookingId/meeting-location", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { bookingId } = req.params;
      const { latitude, longitude, notes } = req.body;

      if (latitude === undefined || latitude === null || longitude === undefined || longitude === null) {
        return res.status(400).json({ error: "Latitude and longitude are required" });
      }

      const booking = await storage.getBooking(bookingId);
      
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      // Only photographer can set meeting location
      const photographer = await storage.getPhotographerByUserId(req.session.userId);
      if (!photographer || booking.photographerId !== photographer.id) {
        return res.status(403).json({ error: "Only the photographer can set the meeting location" });
      }

      // Booking must be pending or confirmed
      if (booking.status !== "pending" && booking.status !== "confirmed") {
        return res.status(400).json({ error: "Can only set meeting location for pending or confirmed bookings" });
      }

      const updatedBooking = await storage.updateMeetingLocation(
        bookingId,
        latitude.toString(),
        longitude.toString(),
        notes
      );

      // Broadcast meeting location update
      broadcastToBooking(bookingId, "meeting.updated", {
        latitude,
        longitude,
        notes,
      });
      broadcastToCustomer(booking.customerId, "booking.updated", updatedBooking);

      res.json(updatedBooking);
    } catch (error) {
      console.error("Error updating meeting location:", error);
      res.status(500).json({ error: "Failed to update meeting location" });
    }
  });

  // Live Location Routes - Both customer and photographer can share location
  app.post("/api/bookings/:bookingId/live-location", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { bookingId } = req.params;
      const { latitude, longitude, accuracy } = req.body;

      if (latitude === undefined || latitude === null || longitude === undefined || longitude === null) {
        return res.status(400).json({ error: "Latitude and longitude are required" });
      }

      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      // Check if user is either the customer or the photographer for this booking
      const photographer = await storage.getPhotographerByUserId(req.session.userId);
      const isCustomer = booking.customerId === req.session.userId;
      const isPhotographer = photographer && booking.photographerId === photographer.id;

      if (!isCustomer && !isPhotographer) {
        return res.status(403).json({ error: "Not authorized to share location for this booking" });
      }

      // Booking must be confirmed
      if (booking.status !== "confirmed") {
        return res.status(400).json({ error: "Can only share location for confirmed bookings" });
      }

      // Check if within 10 minutes before session
      const sessionDateTime = new Date(booking.scheduledDate);
      const [hours, minutes] = booking.scheduledTime.replace(/[AP]M/i, '').trim().split(':').map(Number);
      const isPM = booking.scheduledTime.toLowerCase().includes('pm');
      sessionDateTime.setHours(isPM && hours !== 12 ? hours + 12 : hours, minutes || 0);
      
      const now = new Date();
      const minutesUntilSession = (sessionDateTime.getTime() - now.getTime()) / (1000 * 60);
      
      // Allow sharing up to 10 minutes before and during session
      if (minutesUntilSession > 10) {
        return res.status(400).json({ 
          error: "Location sharing is only available 10 minutes before your session",
          minutesUntilAvailable: Math.ceil(minutesUntilSession - 10)
        });
      }

      const liveLocation = await storage.updateLiveLocation(
        bookingId,
        req.session.userId,
        latitude.toString(),
        longitude.toString(),
        accuracy?.toString()
      );

      // Broadcast live location update to the booking channel
      broadcastToBooking(bookingId, "location.update", {
        ...liveLocation,
        userType: isCustomer ? "customer" : "photographer",
      });

      res.json(liveLocation);
    } catch (error) {
      console.error("Error updating live location:", error);
      res.status(500).json({ error: "Failed to update live location" });
    }
  });

  app.delete("/api/bookings/:bookingId/live-location", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { bookingId } = req.params;
      await storage.stopLiveLocation(bookingId, req.session.userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error stopping live location:", error);
      res.status(500).json({ error: "Failed to stop live location" });
    }
  });

  // Photographer views customer's live location
  app.get("/api/bookings/:bookingId/live-location", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { bookingId } = req.params;
      const booking = await storage.getBooking(bookingId);
      
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      // Only photographer can view customer's live location
      const photographer = await storage.getPhotographerByUserId(req.session.userId);
      if (!photographer || booking.photographerId !== photographer.id) {
        return res.status(403).json({ error: "Not authorized" });
      }

      const location = await storage.getLiveLocation(bookingId, booking.customerId);
      res.json(location || null);
    } catch (error) {
      console.error("Error fetching live location:", error);
      res.status(500).json({ error: "Failed to fetch live location" });
    }
  });

  // Customer views photographer's live location
  app.get("/api/bookings/:bookingId/photographer-location", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { bookingId } = req.params;
      const booking = await storage.getBooking(bookingId);
      
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      // Only customer can view photographer's live location
      if (booking.customerId !== req.session.userId) {
        return res.status(403).json({ error: "Not authorized" });
      }

      // Get photographer's user ID
      const photographer = await storage.getPhotographer(booking.photographerId);
      if (!photographer) {
        return res.status(404).json({ error: "Photographer not found" });
      }

      const location = await storage.getLiveLocation(bookingId, photographer.userId);
      res.json(location || null);
    } catch (error) {
      console.error("Error fetching photographer location:", error);
      res.status(500).json({ error: "Failed to fetch photographer location" });
    }
  });

  app.get("/api/photographer/live-locations", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const photographer = await storage.getPhotographerByUserId(req.session.userId);
      if (!photographer) {
        return res.status(404).json({ error: "Photographer profile not found" });
      }

      const locations = await storage.getAllActiveLiveLocationsForPhotographer(photographer.id);
      res.json(locations);
    } catch (error) {
      console.error("Error fetching live locations:", error);
      res.status(500).json({ error: "Failed to fetch live locations" });
    }
  });

  // Admin Routes
  
  // Middleware to check if user is admin
  const requireAdmin = async (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }
    
    next();
  };

  // Get all photographer applications (admin only)
  app.get("/api/admin/photographers", requireAdmin, async (req, res) => {
    try {
      const { status } = req.query;
      
      if (status && ['pending_review', 'verified', 'rejected'].includes(status as string)) {
        const photographers = await storage.getPhotographersByVerificationStatus(status as 'pending_review' | 'verified' | 'rejected');
        return res.json(photographers);
      }
      
      const photographers = await storage.getAllPhotographerApplications();
      res.json(photographers);
    } catch (error) {
      console.error("Error fetching photographer applications:", error);
      res.status(500).json({ error: "Failed to fetch applications" });
    }
  });

  // Get pending photographer applications count (admin only)
  app.get("/api/admin/photographers/pending-count", requireAdmin, async (req, res) => {
    try {
      const pending = await storage.getPhotographersByVerificationStatus('pending_review');
      res.json({ count: pending.length });
    } catch (error) {
      console.error("Error fetching pending count:", error);
      res.status(500).json({ error: "Failed to fetch pending count" });
    }
  });

  // Approve a photographer (admin only)
  app.post("/api/admin/photographers/:id/approve", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      
      const photographer = await storage.getPhotographer(id);
      if (!photographer) {
        return res.status(404).json({ error: "Photographer not found" });
      }
      
      const updated = await storage.updatePhotographerVerificationStatus(
        id, 
        'verified', 
        req.session.userId!
      );
      
      res.json(updated);
    } catch (error) {
      console.error("Error approving photographer:", error);
      res.status(500).json({ error: "Failed to approve photographer" });
    }
  });

  // Reject a photographer (admin only)
  app.post("/api/admin/photographers/:id/reject", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      
      const photographer = await storage.getPhotographer(id);
      if (!photographer) {
        return res.status(404).json({ error: "Photographer not found" });
      }
      
      const updated = await storage.updatePhotographerVerificationStatus(
        id, 
        'rejected', 
        req.session.userId!,
        reason
      );
      
      res.json(updated);
    } catch (error) {
      console.error("Error rejecting photographer:", error);
      res.status(500).json({ error: "Failed to reject photographer" });
    }
  });

  // Get admin stats (admin only)
  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      const pending = await storage.getPhotographersByVerificationStatus('pending_review');
      const verified = await storage.getPhotographersByVerificationStatus('verified');
      const rejected = await storage.getPhotographersByVerificationStatus('rejected');
      
      res.json({
        pendingCount: pending.length,
        verifiedCount: verified.length,
        rejectedCount: rejected.length,
        totalCount: pending.length + verified.length + rejected.length,
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Mobile Payment Session - token-based auth for WebView checkout
  // Store for temporary mobile payment tokens (in production, use Redis/database)
  const mobilePaymentTokens = new Map<string, { userId: string; bookingData: any; expiresAt: number }>();
  
  // Create a mobile payment session with a temporary token
  app.post("/api/mobile/create-payment-session", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { photographerId, duration, location, scheduledDate, scheduledTime, amount, photographerName } = req.body;
      
      // Generate a random token
      const token = crypto.randomUUID() + '-' + Date.now().toString(36);
      
      // Store the token with booking data (expires in 10 minutes)
      mobilePaymentTokens.set(token, {
        userId: req.session.userId,
        bookingData: { photographerId, duration, location, scheduledDate, scheduledTime, amount, photographerName },
        expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      });
      
      // Clean up expired tokens
      Array.from(mobilePaymentTokens.entries()).forEach(([key, value]) => {
        if (value.expiresAt < Date.now()) {
          mobilePaymentTokens.delete(key);
        }
      });
      
      res.json({ token, expiresIn: 600 });
    } catch (error: any) {
      console.error("Mobile payment session error:", error);
      res.status(500).json({ error: error.message || "Failed to create payment session" });
    }
  });
  
  // Get payment session data by token (for mobile checkout page)
  app.get("/api/mobile/payment-session/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const session = mobilePaymentTokens.get(token);
      
      if (!session) {
        return res.status(404).json({ error: "Session not found or expired" });
      }
      
      if (session.expiresAt < Date.now()) {
        mobilePaymentTokens.delete(token);
        return res.status(410).json({ error: "Session expired" });
      }
      
      // Get stripe config
      const configured = await isStripeConfigured();
      if (!configured) {
        return res.status(503).json({ error: "Payment not configured" });
      }
      
      const publishableKey = await getStripePublishableKey();
      
      res.json({
        bookingData: session.bookingData,
        stripePublishableKey: publishableKey,
      });
    } catch (error: any) {
      console.error("Get payment session error:", error);
      res.status(500).json({ error: error.message || "Failed to get payment session" });
    }
  });
  
  // Create payment intent using mobile token (no session required)
  app.post("/api/mobile/create-payment-intent/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const session = mobilePaymentTokens.get(token);
      
      if (!session) {
        return res.status(404).json({ error: "Session not found or expired" });
      }
      
      if (session.expiresAt < Date.now()) {
        mobilePaymentTokens.delete(token);
        return res.status(410).json({ error: "Session expired" });
      }
      
      const { amount, photographerName } = session.bookingData;
      
      const stripe = await getUncachableStripeClient();
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'gbp',
        capture_method: 'manual',
        metadata: {
          mobileToken: token,
          userId: session.userId,
          photographerName: photographerName || 'Photographer',
        },
        description: `SnapNow Photography Session${photographerName ? ` with ${photographerName}` : ''}`,
      });
      
      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });
    } catch (error: any) {
      console.error("Mobile payment intent error:", error);
      res.status(500).json({ error: error.message || "Failed to create payment intent" });
    }
  });
  
  // Complete booking after payment (using mobile token)
  app.post("/api/mobile/complete-booking/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const { paymentIntentId } = req.body;
      
      const session = mobilePaymentTokens.get(token);
      
      if (!session) {
        return res.status(404).json({ error: "Session not found or expired" });
      }
      
      const { photographerId, duration, location, scheduledDate, scheduledTime } = session.bookingData;
      
      // Get photographer info for pricing
      const photographer = await storage.getPhotographer(photographerId);
      if (!photographer) {
        return res.status(404).json({ error: "Photographer not found" });
      }
      
      const baseAmount = parseFloat(photographer.hourlyRate) * duration;
      const serviceFee = baseAmount * 0.1;
      const totalAmount = baseAmount + serviceFee;
      const platformFee = baseAmount * 0.2;
      const photographerEarnings = baseAmount - platformFee;
      
      // Calculate expiration time
      const sessionDate = new Date(scheduledDate);
      const [hours, minutes] = scheduledTime.split(':').map(Number);
      sessionDate.setHours(hours, minutes, 0, 0);
      
      const now = new Date();
      const hoursUntilSession = (sessionDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      let expirationMinutes: number;
      if (hoursUntilSession <= 2) {
        expirationMinutes = 30;
      } else if (hoursUntilSession <= 6) {
        expirationMinutes = 60;
      } else if (hoursUntilSession <= 24) {
        expirationMinutes = 4 * 60;
      } else {
        expirationMinutes = 24 * 60;
      }
      
      const expiresAt = new Date(now.getTime() + expirationMinutes * 60 * 1000);
      
      const booking = await storage.createBooking({
        customerId: session.userId,
        photographerId,
        duration,
        location,
        scheduledDate: sessionDate,
        scheduledTime,
        baseAmount: baseAmount.toFixed(2),
        customerServiceFee: serviceFee.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        platformFee: platformFee.toFixed(2),
        photographerEarnings: photographerEarnings.toFixed(2),
        stripePaymentId: paymentIntentId,
        expiresAt: expiresAt,
      });
      
      // Clean up the token
      mobilePaymentTokens.delete(token);
      
      res.json({ success: true, bookingId: booking.id });
    } catch (error: any) {
      console.error("Mobile complete booking error:", error);
      res.status(500).json({ error: error.message || "Failed to complete booking" });
    }
  });

  // Stripe Payment Routes
  app.get("/api/stripe/config", async (req, res) => {
    try {
      const configured = await isStripeConfigured();
      if (!configured) {
        return res.json({ configured: false });
      }
      const publishableKey = await getStripePublishableKey();
      res.json({ configured: true, publishableKey });
    } catch (error) {
      res.json({ configured: false });
    }
  });

  app.post("/api/stripe/create-payment-intent", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { amount, bookingId, photographerName } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Invalid amount" });
      }

      const stripe = await getUncachableStripeClient();
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'gbp',
        capture_method: 'manual', // Authorization hold - don't charge until photographer accepts
        metadata: {
          bookingId: bookingId || 'demo',
          userId: req.session.userId,
          photographerName: photographerName || 'Demo Photographer',
        },
        description: `SnapNow Photography Session${photographerName ? ` with ${photographerName}` : ''}`,
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });
    } catch (error: any) {
      console.error("Stripe payment intent error:", error);
      res.status(500).json({ error: error.message || "Failed to create payment intent" });
    }
  });

  app.post("/api/stripe/confirm-payment", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { paymentIntentId } = req.body;

      const stripe = await getUncachableStripeClient();
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      res.json({
        status: paymentIntent.status,
        succeeded: paymentIntent.status === 'succeeded',
      });
    } catch (error: any) {
      console.error("Stripe confirm payment error:", error);
      res.status(500).json({ error: error.message || "Failed to confirm payment" });
    }
  });

  // Cancel a payment intent (used when booking creation fails after payment authorization)
  app.post("/api/stripe/cancel-payment-intent", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { paymentIntentId } = req.body;

      if (!paymentIntentId) {
        return res.status(400).json({ error: "Payment intent ID required" });
      }

      const stripe = await getUncachableStripeClient();
      
      // Security: Verify the payment intent belongs to this user before cancelling
      // Check the metadata to ensure this user created the payment
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        
        // Only allow cancellation if:
        // 1. The payment was created by this user (stored in metadata)
        // 2. The payment is still in a cancellable state
        if (paymentIntent.metadata?.userId !== req.session.userId) {
          console.warn(`User ${req.session.userId} attempted to cancel payment ${paymentIntentId} belonging to user ${paymentIntent.metadata?.userId}`);
          return res.status(403).json({ error: "Not authorized to cancel this payment" });
        }
        
        await stripe.paymentIntents.cancel(paymentIntentId);
        console.log(`Payment intent ${paymentIntentId} cancelled by user ${req.session.userId}`);
        res.json({ success: true });
      } catch (stripeError: any) {
        // Payment may already be cancelled or in a non-cancellable state
        console.log("Payment cancellation note:", stripeError.message);
        res.json({ success: true, note: "Payment may already be released" });
      }
    } catch (error: any) {
      console.error("Stripe cancel payment intent error:", error);
      res.status(500).json({ error: error.message || "Failed to cancel payment intent" });
    }
  });

  return httpServer;
}
