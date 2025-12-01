import { 
  type User, 
  type InsertUser, 
  type Photographer,
  type InsertPhotographer,
  type Booking,
  type InsertBooking,
  type BookingWithCustomer,
  type BookingWithPhotographer,
  type Earning,
  type InsertEarning,
  type PhotoSpot,
  type InsertPhotoSpot,
  type PhotoDelivery,
  type InsertPhotoDelivery,
  type Review,
  type InsertReview,
  type ReviewWithCustomer,
  type EditingService,
  type InsertEditingService,
  type EditingRequest,
  type InsertEditingRequest,
  type EditingRequestWithDetails,
  type Message,
  type InsertMessage,
  type MessageWithSender,
  type LiveLocation,
  users,
  photographers,
  bookings,
  earnings,
  photoSpots,
  photoDeliveries,
  reviews,
  editingServices,
  editingRequests,
  messages,
  liveLocations
} from "@shared/schema";
import { db } from "@db";
import { eq, and, desc, lt, or, isNull } from "drizzle-orm";

export type PhotographerWithUser = Photographer & { fullName: string };

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<{ fullName: string; phone: string; profileImageUrl: string; password: string }>): Promise<User | undefined>;
  
  // Photographer methods
  getPhotographer(id: string): Promise<Photographer | undefined>;
  getPhotographerWithUser(id: string): Promise<PhotographerWithUser | undefined>;
  getPhotographerByUserId(userId: string): Promise<Photographer | undefined>;
  getAllPhotographers(): Promise<Photographer[]>;
  getAllPhotographersWithUsers(): Promise<PhotographerWithUser[]>;
  createPhotographer(photographer: InsertPhotographer): Promise<Photographer>;
  updatePhotographer(id: string, updates: Partial<InsertPhotographer>): Promise<Photographer | undefined>;
  
  // Booking methods
  getBooking(id: string): Promise<Booking | undefined>;
  getBookingsByCustomer(customerId: string): Promise<Booking[]>;
  getBookingsByCustomerWithPhotographer(customerId: string): Promise<BookingWithPhotographer[]>;
  getBookingsByPhotographer(photographerId: string): Promise<Booking[]>;
  getBookingsByPhotographerWithCustomer(photographerId: string): Promise<BookingWithCustomer[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: string, status: string): Promise<Booking | undefined>;
  expireOldPendingBookings(photographerId?: string): Promise<number>;
  
  // Earnings methods
  getEarningsByPhotographer(photographerId: string): Promise<Earning[]>;
  createEarning(earning: InsertEarning): Promise<Earning>;
  getTotalEarnings(photographerId: string): Promise<{ total: number; held: number; pending: number; paid: number }>;
  releaseEarningsByBooking(bookingId: string): Promise<Earning | undefined>;
  getEarningByBooking(bookingId: string): Promise<Earning | undefined>;
  
  // Photo Spots methods
  getPhotoSpot(id: string): Promise<PhotoSpot | undefined>;
  getPhotoSpotsByCity(city: string): Promise<PhotoSpot[]>;
  getAllPhotoSpots(): Promise<PhotoSpot[]>;
  createPhotoSpot(spot: InsertPhotoSpot): Promise<PhotoSpot>;
  
  // Photo Delivery methods
  getPhotoDelivery(id: string): Promise<PhotoDelivery | undefined>;
  getPhotoDeliveryByBooking(bookingId: string): Promise<PhotoDelivery | undefined>;
  createPhotoDelivery(delivery: InsertPhotoDelivery): Promise<PhotoDelivery>;
  updatePhotoDelivery(id: string, updates: Partial<InsertPhotoDelivery>): Promise<PhotoDelivery | undefined>;
  addPhotoToDelivery(id: string, photoUrl: string): Promise<PhotoDelivery | undefined>;
  markPhotoDeliveryDownloaded(id: string): Promise<PhotoDelivery | undefined>;
  
  // Review methods
  getReview(id: string): Promise<Review | undefined>;
  getReviewByBooking(bookingId: string): Promise<Review | undefined>;
  getReviewsByPhotographer(photographerId: string): Promise<ReviewWithCustomer[]>;
  createReview(review: InsertReview): Promise<Review>;
  addPhotographerResponse(reviewId: string, response: string): Promise<Review | undefined>;
  getPhotographerAverageRating(photographerId: string): Promise<{ averageRating: number; reviewCount: number }>;
  
  // Editing Service methods
  getEditingService(photographerId: string): Promise<EditingService | undefined>;
  createEditingService(service: InsertEditingService): Promise<EditingService>;
  updateEditingService(photographerId: string, updates: Partial<InsertEditingService>): Promise<EditingService | undefined>;
  
  // Editing Request methods
  getEditingRequest(id: string): Promise<EditingRequest | undefined>;
  getEditingRequestByBooking(bookingId: string): Promise<EditingRequest | undefined>;
  getEditingRequestsByPhotographer(photographerId: string): Promise<EditingRequestWithDetails[]>;
  getEditingRequestsByCustomer(customerId: string): Promise<EditingRequestWithDetails[]>;
  createEditingRequest(request: InsertEditingRequest): Promise<EditingRequest>;
  updateEditingRequestStatus(id: string, status: string, photographerNotes?: string): Promise<EditingRequest | undefined>;
  deliverEditedPhotos(id: string, photoUrls: string[], photographerNotes?: string): Promise<EditingRequest | undefined>;
  
  // Message methods
  getMessagesByBooking(bookingId: string): Promise<MessageWithSender[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessagesAsRead(bookingId: string, userId: string): Promise<void>;
  getUnreadMessageCount(userId: string): Promise<number>;
  
  // Meeting location methods
  updateMeetingLocation(bookingId: string, latitude: string, longitude: string, notes?: string): Promise<Booking | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUser(id: string, updates: Partial<{ fullName: string; phone: string; profileImageUrl: string; password: string }>): Promise<User | undefined> {
    const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return result[0];
  }

  // Photographer methods
  async getPhotographer(id: string): Promise<Photographer | undefined> {
    const result = await db.select().from(photographers).where(eq(photographers.id, id)).limit(1);
    return result[0];
  }

  async getPhotographerByUserId(userId: string): Promise<Photographer | undefined> {
    const result = await db.select().from(photographers).where(eq(photographers.userId, userId)).limit(1);
    return result[0];
  }

  async getPhotographerWithUser(id: string): Promise<PhotographerWithUser | undefined> {
    const result = await db
      .select({
        id: photographers.id,
        userId: photographers.userId,
        bio: photographers.bio,
        hourlyRate: photographers.hourlyRate,
        location: photographers.location,
        latitude: photographers.latitude,
        longitude: photographers.longitude,
        rating: photographers.rating,
        reviewCount: photographers.reviewCount,
        profileImageUrl: photographers.profileImageUrl,
        portfolioImages: photographers.portfolioImages,
        isAvailable: photographers.isAvailable,
        stripeAccountId: photographers.stripeAccountId,
        fullName: users.fullName,
      })
      .from(photographers)
      .innerJoin(users, eq(photographers.userId, users.id))
      .where(eq(photographers.id, id))
      .limit(1);
    return result[0];
  }

  async getAllPhotographers(): Promise<Photographer[]> {
    return await db.select().from(photographers).where(eq(photographers.isAvailable, true));
  }

  async getAllPhotographersWithUsers(): Promise<PhotographerWithUser[]> {
    return await db
      .select({
        id: photographers.id,
        userId: photographers.userId,
        bio: photographers.bio,
        hourlyRate: photographers.hourlyRate,
        location: photographers.location,
        latitude: photographers.latitude,
        longitude: photographers.longitude,
        rating: photographers.rating,
        reviewCount: photographers.reviewCount,
        profileImageUrl: photographers.profileImageUrl,
        portfolioImages: photographers.portfolioImages,
        isAvailable: photographers.isAvailable,
        stripeAccountId: photographers.stripeAccountId,
        fullName: users.fullName,
      })
      .from(photographers)
      .innerJoin(users, eq(photographers.userId, users.id))
      .where(eq(photographers.isAvailable, true));
  }

  async createPhotographer(photographer: InsertPhotographer): Promise<Photographer> {
    const result = await db.insert(photographers).values(photographer).returning();
    return result[0];
  }

  async updatePhotographer(id: string, updates: Partial<InsertPhotographer>): Promise<Photographer | undefined> {
    const result = await db.update(photographers).set(updates).where(eq(photographers.id, id)).returning();
    return result[0];
  }

  // Booking methods
  async getBooking(id: string): Promise<Booking | undefined> {
    const result = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
    return result[0];
  }

  async getBookingsByCustomer(customerId: string): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.customerId, customerId)).orderBy(desc(bookings.createdAt));
  }

  async getBookingsByCustomerWithPhotographer(customerId: string): Promise<BookingWithPhotographer[]> {
    const results = await db
      .select({
        id: bookings.id,
        customerId: bookings.customerId,
        photographerId: bookings.photographerId,
        duration: bookings.duration,
        location: bookings.location,
        scheduledDate: bookings.scheduledDate,
        scheduledTime: bookings.scheduledTime,
        baseAmount: bookings.baseAmount,
        customerServiceFee: bookings.customerServiceFee,
        totalAmount: bookings.totalAmount,
        platformFee: bookings.platformFee,
        photographerEarnings: bookings.photographerEarnings,
        status: bookings.status,
        stripePaymentId: bookings.stripePaymentId,
        expiresAt: bookings.expiresAt,
        meetingLatitude: bookings.meetingLatitude,
        meetingLongitude: bookings.meetingLongitude,
        meetingNotes: bookings.meetingNotes,
        createdAt: bookings.createdAt,
        photographerFullName: users.fullName,
        photographerProfileImageUrl: users.profileImageUrl,
      })
      .from(bookings)
      .innerJoin(photographers, eq(bookings.photographerId, photographers.id))
      .innerJoin(users, eq(photographers.userId, users.id))
      .where(eq(bookings.customerId, customerId))
      .orderBy(desc(bookings.createdAt));

    return results.map((row) => ({
      id: row.id,
      customerId: row.customerId,
      photographerId: row.photographerId,
      duration: row.duration,
      location: row.location,
      scheduledDate: row.scheduledDate,
      scheduledTime: row.scheduledTime,
      baseAmount: row.baseAmount,
      customerServiceFee: row.customerServiceFee,
      totalAmount: row.totalAmount,
      platformFee: row.platformFee,
      photographerEarnings: row.photographerEarnings,
      status: row.status,
      stripePaymentId: row.stripePaymentId,
      expiresAt: row.expiresAt,
      meetingLatitude: row.meetingLatitude,
      meetingLongitude: row.meetingLongitude,
      meetingNotes: row.meetingNotes,
      createdAt: row.createdAt,
      photographer: {
        fullName: row.photographerFullName,
        profileImageUrl: row.photographerProfileImageUrl,
      },
    }));
  }

  async getBookingsByPhotographer(photographerId: string): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.photographerId, photographerId)).orderBy(desc(bookings.createdAt));
  }

  async getBookingsByPhotographerWithCustomer(photographerId: string): Promise<BookingWithCustomer[]> {
    const results = await db
      .select({
        id: bookings.id,
        customerId: bookings.customerId,
        photographerId: bookings.photographerId,
        duration: bookings.duration,
        location: bookings.location,
        scheduledDate: bookings.scheduledDate,
        scheduledTime: bookings.scheduledTime,
        baseAmount: bookings.baseAmount,
        customerServiceFee: bookings.customerServiceFee,
        totalAmount: bookings.totalAmount,
        platformFee: bookings.platformFee,
        photographerEarnings: bookings.photographerEarnings,
        status: bookings.status,
        stripePaymentId: bookings.stripePaymentId,
        expiresAt: bookings.expiresAt,
        meetingLatitude: bookings.meetingLatitude,
        meetingLongitude: bookings.meetingLongitude,
        meetingNotes: bookings.meetingNotes,
        createdAt: bookings.createdAt,
        customerFullName: users.fullName,
        customerProfileImageUrl: users.profileImageUrl,
      })
      .from(bookings)
      .innerJoin(users, eq(bookings.customerId, users.id))
      .where(eq(bookings.photographerId, photographerId))
      .orderBy(desc(bookings.createdAt));

    return results.map((row) => ({
      id: row.id,
      customerId: row.customerId,
      photographerId: row.photographerId,
      duration: row.duration,
      location: row.location,
      scheduledDate: row.scheduledDate,
      scheduledTime: row.scheduledTime,
      baseAmount: row.baseAmount,
      customerServiceFee: row.customerServiceFee,
      totalAmount: row.totalAmount,
      platformFee: row.platformFee,
      photographerEarnings: row.photographerEarnings,
      status: row.status,
      stripePaymentId: row.stripePaymentId,
      expiresAt: row.expiresAt,
      meetingLatitude: row.meetingLatitude,
      meetingLongitude: row.meetingLongitude,
      meetingNotes: row.meetingNotes,
      createdAt: row.createdAt,
      customer: {
        fullName: row.customerFullName,
        profileImageUrl: row.customerProfileImageUrl,
      },
    }));
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    // Calculate dynamic expiration based on session urgency
    const sessionDate = new Date(booking.scheduledDate);
    const now = new Date();
    const hoursUntilSession = (sessionDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    let responseWindowMinutes: number;
    if (hoursUntilSession <= 2) {
      // Session in 2 hours or less → 30 minute response window
      responseWindowMinutes = 30;
    } else if (hoursUntilSession <= 12) {
      // Session within 12 hours → 1 hour response window
      responseWindowMinutes = 60;
    } else if (hoursUntilSession <= 48) {
      // Session within 48 hours → 4 hour response window
      responseWindowMinutes = 240;
    } else {
      // Session more than 48 hours away → 24 hour response window
      responseWindowMinutes = 24 * 60;
    }
    
    const expiresAt = new Date(Date.now() + responseWindowMinutes * 60 * 1000);
    const result = await db.insert(bookings).values({ ...booking, expiresAt }).returning();
    return result[0];
  }

  async updateBookingStatus(id: string, status: string): Promise<Booking | undefined> {
    const result = await db.update(bookings).set({ status }).where(eq(bookings.id, id)).returning();
    return result[0];
  }

  async expireOldPendingBookings(photographerId?: string): Promise<number> {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const conditions = [
      eq(bookings.status, 'pending'),
      or(
        lt(bookings.expiresAt, now),
        and(isNull(bookings.expiresAt), lt(bookings.createdAt, twentyFourHoursAgo))
      )
    ];
    
    if (photographerId) {
      conditions.push(eq(bookings.photographerId, photographerId));
    }
    
    const result = await db
      .update(bookings)
      .set({ status: 'expired' })
      .where(and(...conditions))
      .returning();
    
    return result.length;
  }

  // Earnings methods
  async getEarningsByPhotographer(photographerId: string): Promise<Earning[]> {
    return await db.select().from(earnings).where(eq(earnings.photographerId, photographerId)).orderBy(desc(earnings.createdAt));
  }

  async createEarning(earning: InsertEarning): Promise<Earning> {
    const result = await db.insert(earnings).values(earning).returning();
    return result[0];
  }

  async getTotalEarnings(photographerId: string): Promise<{ total: number; held: number; pending: number; paid: number }> {
    const allEarnings = await this.getEarningsByPhotographer(photographerId);
    
    const total = allEarnings.reduce((sum, e) => sum + parseFloat(e.netAmount), 0);
    const held = allEarnings.filter(e => e.status === 'held').reduce((sum, e) => sum + parseFloat(e.netAmount), 0);
    const pending = allEarnings.filter(e => e.status === 'pending').reduce((sum, e) => sum + parseFloat(e.netAmount), 0);
    const paid = allEarnings.filter(e => e.status === 'paid').reduce((sum, e) => sum + parseFloat(e.netAmount), 0);
    
    return { total, held, pending, paid };
  }

  async releaseEarningsByBooking(bookingId: string): Promise<Earning | undefined> {
    const result = await db.update(earnings)
      .set({ 
        status: 'pending', 
        releasedAt: new Date() 
      })
      .where(and(
        eq(earnings.bookingId, bookingId),
        eq(earnings.status, 'held')
      ))
      .returning();
    return result[0];
  }

  async getEarningByBooking(bookingId: string): Promise<Earning | undefined> {
    const result = await db.select().from(earnings).where(eq(earnings.bookingId, bookingId)).limit(1);
    return result[0];
  }

  // Photo Spots methods
  async getPhotoSpot(id: string): Promise<PhotoSpot | undefined> {
    const result = await db.select().from(photoSpots).where(eq(photoSpots.id, id)).limit(1);
    return result[0];
  }

  async getPhotoSpotsByCity(city: string): Promise<PhotoSpot[]> {
    return await db.select().from(photoSpots).where(eq(photoSpots.city, city));
  }

  async getAllPhotoSpots(): Promise<PhotoSpot[]> {
    return await db.select().from(photoSpots);
  }

  async createPhotoSpot(spot: InsertPhotoSpot): Promise<PhotoSpot> {
    const result = await db.insert(photoSpots).values(spot).returning();
    return result[0];
  }

  // Photo Delivery methods
  async getPhotoDelivery(id: string): Promise<PhotoDelivery | undefined> {
    const result = await db.select().from(photoDeliveries).where(eq(photoDeliveries.id, id)).limit(1);
    return result[0];
  }

  async getPhotoDeliveryByBooking(bookingId: string): Promise<PhotoDelivery | undefined> {
    const result = await db.select().from(photoDeliveries).where(eq(photoDeliveries.bookingId, bookingId)).limit(1);
    return result[0];
  }

  async createPhotoDelivery(delivery: InsertPhotoDelivery): Promise<PhotoDelivery> {
    const result = await db.insert(photoDeliveries).values(delivery).returning();
    return result[0];
  }

  async updatePhotoDelivery(id: string, updates: Partial<InsertPhotoDelivery>): Promise<PhotoDelivery | undefined> {
    const result = await db.update(photoDeliveries).set(updates).where(eq(photoDeliveries.id, id)).returning();
    return result[0];
  }

  async addPhotoToDelivery(id: string, photoUrl: string): Promise<PhotoDelivery | undefined> {
    const delivery = await this.getPhotoDelivery(id);
    if (!delivery) return undefined;
    
    const currentPhotos = delivery.photos || [];
    const updatedPhotos = [...currentPhotos, photoUrl];
    
    const result = await db.update(photoDeliveries).set({ photos: updatedPhotos }).where(eq(photoDeliveries.id, id)).returning();
    return result[0];
  }

  async markPhotoDeliveryDownloaded(id: string): Promise<PhotoDelivery | undefined> {
    const result = await db.update(photoDeliveries).set({ downloadedAt: new Date() }).where(eq(photoDeliveries.id, id)).returning();
    return result[0];
  }

  // Review methods
  async getReview(id: string): Promise<Review | undefined> {
    const result = await db.select().from(reviews).where(eq(reviews.id, id)).limit(1);
    return result[0];
  }

  async getReviewByBooking(bookingId: string): Promise<Review | undefined> {
    const result = await db.select().from(reviews).where(eq(reviews.bookingId, bookingId)).limit(1);
    return result[0];
  }

  async getReviewsByPhotographer(photographerId: string): Promise<ReviewWithCustomer[]> {
    const results = await db
      .select({
        id: reviews.id,
        bookingId: reviews.bookingId,
        photographerId: reviews.photographerId,
        customerId: reviews.customerId,
        rating: reviews.rating,
        comment: reviews.comment,
        photographerResponse: reviews.photographerResponse,
        respondedAt: reviews.respondedAt,
        createdAt: reviews.createdAt,
        customerFullName: users.fullName,
        customerProfileImageUrl: users.profileImageUrl,
      })
      .from(reviews)
      .innerJoin(users, eq(reviews.customerId, users.id))
      .where(eq(reviews.photographerId, photographerId))
      .orderBy(desc(reviews.createdAt));

    return results.map((row) => ({
      id: row.id,
      bookingId: row.bookingId,
      photographerId: row.photographerId,
      customerId: row.customerId,
      rating: row.rating,
      comment: row.comment,
      photographerResponse: row.photographerResponse,
      respondedAt: row.respondedAt,
      createdAt: row.createdAt,
      customer: {
        fullName: row.customerFullName,
        profileImageUrl: row.customerProfileImageUrl,
      },
    }));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const result = await db.insert(reviews).values(review).returning();
    return result[0];
  }

  async addPhotographerResponse(reviewId: string, response: string): Promise<Review | undefined> {
    const result = await db
      .update(reviews)
      .set({ photographerResponse: response, respondedAt: new Date() })
      .where(eq(reviews.id, reviewId))
      .returning();
    return result[0];
  }

  async getPhotographerAverageRating(photographerId: string): Promise<{ averageRating: number; reviewCount: number }> {
    const photographerReviews = await db
      .select({ rating: reviews.rating })
      .from(reviews)
      .where(eq(reviews.photographerId, photographerId));

    if (photographerReviews.length === 0) {
      return { averageRating: 0, reviewCount: 0 };
    }

    const totalRating = photographerReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / photographerReviews.length;

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      reviewCount: photographerReviews.length,
    };
  }

  // Editing Service methods
  async getEditingService(photographerId: string): Promise<EditingService | undefined> {
    const result = await db.select().from(editingServices).where(eq(editingServices.photographerId, photographerId)).limit(1);
    return result[0];
  }

  async createEditingService(service: InsertEditingService): Promise<EditingService> {
    const result = await db.insert(editingServices).values(service).returning();
    return result[0];
  }

  async updateEditingService(photographerId: string, updates: Partial<InsertEditingService>): Promise<EditingService | undefined> {
    const existing = await this.getEditingService(photographerId);
    if (existing) {
      const result = await db.update(editingServices)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(editingServices.photographerId, photographerId))
        .returning();
      return result[0];
    } else {
      return await this.createEditingService({
        photographerId,
        ...updates,
        isEnabled: updates.isEnabled ?? false,
        pricingModel: updates.pricingModel ?? "flat",
      } as InsertEditingService);
    }
  }

  // Editing Request methods
  async getEditingRequest(id: string): Promise<EditingRequest | undefined> {
    const result = await db.select().from(editingRequests).where(eq(editingRequests.id, id)).limit(1);
    return result[0];
  }

  async getEditingRequestByBooking(bookingId: string): Promise<EditingRequest | undefined> {
    const result = await db.select().from(editingRequests).where(eq(editingRequests.bookingId, bookingId)).limit(1);
    return result[0];
  }

  async getEditingRequestsByPhotographer(photographerId: string): Promise<EditingRequestWithDetails[]> {
    const results = await db
      .select({
        id: editingRequests.id,
        bookingId: editingRequests.bookingId,
        customerId: editingRequests.customerId,
        photographerId: editingRequests.photographerId,
        photoCount: editingRequests.photoCount,
        pricingModel: editingRequests.pricingModel,
        baseAmount: editingRequests.baseAmount,
        customerServiceFee: editingRequests.customerServiceFee,
        totalAmount: editingRequests.totalAmount,
        platformFee: editingRequests.platformFee,
        photographerEarnings: editingRequests.photographerEarnings,
        status: editingRequests.status,
        customerNotes: editingRequests.customerNotes,
        photographerNotes: editingRequests.photographerNotes,
        editedPhotos: editingRequests.editedPhotos,
        requestedAt: editingRequests.requestedAt,
        acceptedAt: editingRequests.acceptedAt,
        deliveredAt: editingRequests.deliveredAt,
        completedAt: editingRequests.completedAt,
        declinedAt: editingRequests.declinedAt,
        customerFullName: users.fullName,
        customerProfileImageUrl: users.profileImageUrl,
        bookingLocation: bookings.location,
        bookingScheduledDate: bookings.scheduledDate,
      })
      .from(editingRequests)
      .innerJoin(users, eq(editingRequests.customerId, users.id))
      .innerJoin(bookings, eq(editingRequests.bookingId, bookings.id))
      .innerJoin(photographers, eq(editingRequests.photographerId, photographers.id))
      .where(eq(editingRequests.photographerId, photographerId))
      .orderBy(desc(editingRequests.requestedAt));

    const photographerData = await db.select({
      fullName: users.fullName,
      profileImageUrl: users.profileImageUrl,
    }).from(users).innerJoin(photographers, eq(photographers.userId, users.id)).where(eq(photographers.id, photographerId)).limit(1);

    const photographerInfo = photographerData[0] || { fullName: "", profileImageUrl: null };

    return results.map((row) => ({
      id: row.id,
      bookingId: row.bookingId,
      customerId: row.customerId,
      photographerId: row.photographerId,
      photoCount: row.photoCount,
      pricingModel: row.pricingModel,
      baseAmount: row.baseAmount,
      customerServiceFee: row.customerServiceFee,
      totalAmount: row.totalAmount,
      platformFee: row.platformFee,
      photographerEarnings: row.photographerEarnings,
      status: row.status,
      customerNotes: row.customerNotes,
      photographerNotes: row.photographerNotes,
      editedPhotos: row.editedPhotos,
      requestedAt: row.requestedAt,
      acceptedAt: row.acceptedAt,
      deliveredAt: row.deliveredAt,
      completedAt: row.completedAt,
      declinedAt: row.declinedAt,
      customer: {
        fullName: row.customerFullName,
        profileImageUrl: row.customerProfileImageUrl,
      },
      photographer: photographerInfo,
      booking: {
        location: row.bookingLocation,
        scheduledDate: row.bookingScheduledDate,
      },
    }));
  }

  async getEditingRequestsByCustomer(customerId: string): Promise<EditingRequestWithDetails[]> {
    const results = await db
      .select({
        id: editingRequests.id,
        bookingId: editingRequests.bookingId,
        customerId: editingRequests.customerId,
        photographerId: editingRequests.photographerId,
        photoCount: editingRequests.photoCount,
        pricingModel: editingRequests.pricingModel,
        baseAmount: editingRequests.baseAmount,
        customerServiceFee: editingRequests.customerServiceFee,
        totalAmount: editingRequests.totalAmount,
        platformFee: editingRequests.platformFee,
        photographerEarnings: editingRequests.photographerEarnings,
        status: editingRequests.status,
        customerNotes: editingRequests.customerNotes,
        photographerNotes: editingRequests.photographerNotes,
        editedPhotos: editingRequests.editedPhotos,
        requestedAt: editingRequests.requestedAt,
        acceptedAt: editingRequests.acceptedAt,
        deliveredAt: editingRequests.deliveredAt,
        completedAt: editingRequests.completedAt,
        declinedAt: editingRequests.declinedAt,
        photographerFullName: users.fullName,
        photographerProfileImageUrl: users.profileImageUrl,
        bookingLocation: bookings.location,
        bookingScheduledDate: bookings.scheduledDate,
      })
      .from(editingRequests)
      .innerJoin(photographers, eq(editingRequests.photographerId, photographers.id))
      .innerJoin(users, eq(photographers.userId, users.id))
      .innerJoin(bookings, eq(editingRequests.bookingId, bookings.id))
      .where(eq(editingRequests.customerId, customerId))
      .orderBy(desc(editingRequests.requestedAt));

    const customerData = await db.select({
      fullName: users.fullName,
      profileImageUrl: users.profileImageUrl,
    }).from(users).where(eq(users.id, customerId)).limit(1);

    const customerInfo = customerData[0] || { fullName: "", profileImageUrl: null };

    return results.map((row) => ({
      id: row.id,
      bookingId: row.bookingId,
      customerId: row.customerId,
      photographerId: row.photographerId,
      photoCount: row.photoCount,
      pricingModel: row.pricingModel,
      baseAmount: row.baseAmount,
      customerServiceFee: row.customerServiceFee,
      totalAmount: row.totalAmount,
      platformFee: row.platformFee,
      photographerEarnings: row.photographerEarnings,
      status: row.status,
      customerNotes: row.customerNotes,
      photographerNotes: row.photographerNotes,
      editedPhotos: row.editedPhotos,
      requestedAt: row.requestedAt,
      acceptedAt: row.acceptedAt,
      deliveredAt: row.deliveredAt,
      completedAt: row.completedAt,
      declinedAt: row.declinedAt,
      customer: customerInfo,
      photographer: {
        fullName: row.photographerFullName,
        profileImageUrl: row.photographerProfileImageUrl,
      },
      booking: {
        location: row.bookingLocation,
        scheduledDate: row.bookingScheduledDate,
      },
    }));
  }

  async createEditingRequest(request: InsertEditingRequest): Promise<EditingRequest> {
    const result = await db.insert(editingRequests).values(request).returning();
    return result[0];
  }

  async updateEditingRequestStatus(id: string, status: string, photographerNotes?: string): Promise<EditingRequest | undefined> {
    const updates: Record<string, unknown> = { status };
    
    if (photographerNotes) {
      updates.photographerNotes = photographerNotes;
    }
    
    if (status === "accepted") {
      updates.acceptedAt = new Date();
    } else if (status === "declined") {
      updates.declinedAt = new Date();
    } else if (status === "completed") {
      updates.completedAt = new Date();
    }
    
    const result = await db.update(editingRequests).set(updates).where(eq(editingRequests.id, id)).returning();
    return result[0];
  }

  async deliverEditedPhotos(id: string, photoUrls: string[], photographerNotes?: string): Promise<EditingRequest | undefined> {
    const updates: Record<string, unknown> = { 
      editedPhotos: photoUrls, 
      status: "delivered",
      deliveredAt: new Date() 
    };
    
    if (photographerNotes) {
      updates.photographerNotes = photographerNotes;
    }
    
    const result = await db.update(editingRequests)
      .set(updates)
      .where(eq(editingRequests.id, id))
      .returning();
    return result[0];
  }

  // Message methods
  async getMessagesByBooking(bookingId: string): Promise<MessageWithSender[]> {
    const results = await db
      .select({
        id: messages.id,
        bookingId: messages.bookingId,
        senderId: messages.senderId,
        body: messages.body,
        isRead: messages.isRead,
        createdAt: messages.createdAt,
        senderFullName: users.fullName,
        senderProfileImageUrl: users.profileImageUrl,
      })
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.bookingId, bookingId))
      .orderBy(messages.createdAt);

    return results.map((row) => ({
      id: row.id,
      bookingId: row.bookingId,
      senderId: row.senderId,
      body: row.body,
      isRead: row.isRead,
      createdAt: row.createdAt,
      sender: {
        fullName: row.senderFullName,
        profileImageUrl: row.senderProfileImageUrl,
      },
    }));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const result = await db.insert(messages).values(message).returning();
    return result[0];
  }

  async markMessagesAsRead(bookingId: string, userId: string): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.bookingId, bookingId),
          eq(messages.isRead, false),
          // Mark as read messages sent TO this user (not FROM this user)
          // This requires a subquery approach - for now mark all unread as read
        )
      );
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    // Get all bookings where this user is either customer or photographer
    const customerBookings = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(eq(bookings.customerId, userId));

    const photographerProfile = await db
      .select({ id: photographers.id })
      .from(photographers)
      .where(eq(photographers.userId, userId))
      .limit(1);

    const photographerBookings = photographerProfile[0]
      ? await db
          .select({ id: bookings.id })
          .from(bookings)
          .where(eq(bookings.photographerId, photographerProfile[0].id))
      : [];

    const allBookingIds = [
      ...customerBookings.map((b) => b.id),
      ...photographerBookings.map((b) => b.id),
    ];

    if (allBookingIds.length === 0) return 0;

    // Count unread messages in these bookings where userId is NOT the sender
    let unreadCount = 0;
    for (const bookingId of allBookingIds) {
      const unreadMessages = await db
        .select({ id: messages.id })
        .from(messages)
        .where(
          and(
            eq(messages.bookingId, bookingId),
            eq(messages.isRead, false)
          )
        );
      // Filter out messages sent by the user themselves
      for (const msg of unreadMessages) {
        const fullMsg = await db
          .select({ senderId: messages.senderId })
          .from(messages)
          .where(eq(messages.id, msg.id))
          .limit(1);
        if (fullMsg[0] && fullMsg[0].senderId !== userId) {
          unreadCount++;
        }
      }
    }

    return unreadCount;
  }

  // Meeting location methods
  async updateMeetingLocation(bookingId: string, latitude: string, longitude: string, notes?: string): Promise<Booking | undefined> {
    const updates: Record<string, unknown> = {
      meetingLatitude: latitude,
      meetingLongitude: longitude,
    };
    
    if (notes !== undefined) {
      updates.meetingNotes = notes;
    }
    
    const result = await db
      .update(bookings)
      .set(updates)
      .where(eq(bookings.id, bookingId))
      .returning();
    return result[0];
  }

  // Live location methods
  async updateLiveLocation(bookingId: string, userId: string, latitude: string, longitude: string, accuracy?: string): Promise<LiveLocation> {
    // First try to update existing record
    const existing = await db
      .select()
      .from(liveLocations)
      .where(and(
        eq(liveLocations.bookingId, bookingId),
        eq(liveLocations.userId, userId)
      ))
      .limit(1);

    if (existing.length > 0) {
      const result = await db
        .update(liveLocations)
        .set({
          latitude,
          longitude,
          accuracy: accuracy || null,
          isActive: true,
          updatedAt: new Date(),
        })
        .where(eq(liveLocations.id, existing[0].id))
        .returning();
      return result[0];
    } else {
      const result = await db
        .insert(liveLocations)
        .values({
          bookingId,
          userId,
          latitude,
          longitude,
          accuracy: accuracy || null,
        })
        .returning();
      return result[0];
    }
  }

  async getLiveLocation(bookingId: string, userId: string): Promise<LiveLocation | undefined> {
    const result = await db
      .select()
      .from(liveLocations)
      .where(and(
        eq(liveLocations.bookingId, bookingId),
        eq(liveLocations.userId, userId),
        eq(liveLocations.isActive, true)
      ))
      .limit(1);
    return result[0];
  }

  async stopLiveLocation(bookingId: string, userId: string): Promise<void> {
    await db
      .update(liveLocations)
      .set({ isActive: false })
      .where(and(
        eq(liveLocations.bookingId, bookingId),
        eq(liveLocations.userId, userId)
      ));
  }

  async getAllActiveLiveLocationsForPhotographer(photographerId: string): Promise<(LiveLocation & { customerName: string })[]> {
    // Get all confirmed bookings for this photographer
    const photographerBookings = await db
      .select({
        id: bookings.id,
        customerId: bookings.customerId,
        scheduledDate: bookings.scheduledDate,
        scheduledTime: bookings.scheduledTime,
      })
      .from(bookings)
      .where(and(
        eq(bookings.photographerId, photographerId),
        eq(bookings.status, 'confirmed')
      ));

    const results: (LiveLocation & { customerName: string })[] = [];

    for (const booking of photographerBookings) {
      const location = await db
        .select()
        .from(liveLocations)
        .where(and(
          eq(liveLocations.bookingId, booking.id),
          eq(liveLocations.userId, booking.customerId),
          eq(liveLocations.isActive, true)
        ))
        .limit(1);

      if (location.length > 0) {
        const customer = await db
          .select({ fullName: users.fullName })
          .from(users)
          .where(eq(users.id, booking.customerId))
          .limit(1);

        results.push({
          ...location[0],
          customerName: customer[0]?.fullName || 'Customer',
        });
      }
    }

    return results;
  }
}

export const storage = new DatabaseStorage();
