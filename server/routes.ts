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

  // Photographer Routes
  
  // Get current photographer's own profile
  app.get("/api/photographers/me", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const photographer = await storage.getPhotographerByUserId(req.session.userId);
      if (!photographer) {
        return res.status(404).json({ error: "Photographer profile not found" });
      }
      
      res.json(photographer);
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
      const allowedFields = ["bio", "hourlyRate", "location", "profileImageUrl", "portfolioImages"];
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
      res.json(photographers);
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
      res.json(photographer);
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
      const hourlyRate = parseFloat(photographer.hourlyRate);
      const grossAmount = hourlyRate * duration;
      const platformFee = Math.round(grossAmount * 0.20 * 100) / 100; // 20% commission
      const photographerEarnings = Math.round((grossAmount - platformFee) * 100) / 100;
      
      // Force customerId to be the logged-in user
      const booking = await storage.createBooking({
        customerId: req.session.userId, // Always use session userId
        photographerId,
        duration,
        location,
        scheduledDate: new Date(scheduledDate),
        scheduledTime,
        totalAmount: grossAmount.toFixed(2),
        platformFee: platformFee.toFixed(2),
        photographerEarnings: photographerEarnings.toFixed(2),
      });
      
      // Create earnings record
      await storage.createEarning({
        photographerId: booking.photographerId,
        bookingId: booking.id,
        grossAmount: grossAmount.toFixed(2),
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
      
      const bookings = await storage.getBookingsByCustomer(req.params.customerId);
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
      
      const bookings = await storage.getBookingsByPhotographer(req.params.photographerId);
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
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const userId = req.session.userId;
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: userId,
      });
      if (!canAccess) {
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
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    res.json({ uploadURL });
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
