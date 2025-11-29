import { 
  type User, 
  type InsertUser, 
  type Photographer,
  type InsertPhotographer,
  type Booking,
  type InsertBooking,
  type Earning,
  type InsertEarning,
  type PhotoSpot,
  type InsertPhotoSpot,
  users,
  photographers,
  bookings,
  earnings,
  photoSpots
} from "@shared/schema";
import { db } from "@db";
import { eq, and, desc } from "drizzle-orm";

export type PhotographerWithUser = Photographer & { fullName: string };

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
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
  getBookingsByPhotographer(photographerId: string): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: string, status: string): Promise<Booking | undefined>;
  
  // Earnings methods
  getEarningsByPhotographer(photographerId: string): Promise<Earning[]>;
  createEarning(earning: InsertEarning): Promise<Earning>;
  getTotalEarnings(photographerId: string): Promise<{ total: number; pending: number; paid: number }>;
  
  // Photo Spots methods
  getPhotoSpot(id: string): Promise<PhotoSpot | undefined>;
  getPhotoSpotsByCity(city: string): Promise<PhotoSpot[]>;
  getAllPhotoSpots(): Promise<PhotoSpot[]>;
  createPhotoSpot(spot: InsertPhotoSpot): Promise<PhotoSpot>;
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

  async getBookingsByPhotographer(photographerId: string): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.photographerId, photographerId)).orderBy(desc(bookings.createdAt));
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const result = await db.insert(bookings).values(booking).returning();
    return result[0];
  }

  async updateBookingStatus(id: string, status: string): Promise<Booking | undefined> {
    const result = await db.update(bookings).set({ status }).where(eq(bookings.id, id)).returning();
    return result[0];
  }

  // Earnings methods
  async getEarningsByPhotographer(photographerId: string): Promise<Earning[]> {
    return await db.select().from(earnings).where(eq(earnings.photographerId, photographerId)).orderBy(desc(earnings.createdAt));
  }

  async createEarning(earning: InsertEarning): Promise<Earning> {
    const result = await db.insert(earnings).values(earning).returning();
    return result[0];
  }

  async getTotalEarnings(photographerId: string): Promise<{ total: number; pending: number; paid: number }> {
    const allEarnings = await this.getEarningsByPhotographer(photographerId);
    
    const total = allEarnings.reduce((sum, e) => sum + parseFloat(e.netAmount), 0);
    const pending = allEarnings.filter(e => e.status === 'pending').reduce((sum, e) => sum + parseFloat(e.netAmount), 0);
    const paid = allEarnings.filter(e => e.status === 'paid').reduce((sum, e) => sum + parseFloat(e.netAmount), 0);
    
    return { total, pending, paid };
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
}

export const storage = new DatabaseStorage();
