import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertPhotographerSchema, insertBookingSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { z } from "zod";

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
      
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
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
    
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
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
      });
      
      const { photographerId, duration, location, scheduledDate, scheduledTime } = bookingInputSchema.parse(req.body);
      
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
      await storage.expireOldPendingBookings();
      
      const bookings = await storage.getBookingsByCustomerWithPhotographer(req.params.customerId);
      res.json(bookings);
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
      await storage.expireOldPendingBookings(req.params.photographerId);
      
      // Return bookings with customer info for photographer view
      const bookings = await storage.getBookingsByPhotographerWithCustomer(req.params.photographerId);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  // Update booking status (for photographers to accept/decline)
  app.patch("/api/bookings/:bookingId/status", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const { status } = req.body;
      if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
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
      
      const updatedBooking = await storage.updateBookingStatus(req.params.bookingId, status);
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

  return httpServer;
}
