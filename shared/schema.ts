import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  profileImageUrl: text("profile_image_url"),
  role: text("role").notNull(), // 'customer', 'photographer', or 'admin'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const photographers = pgTable("photographers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  bio: text("bio"),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }).notNull(),
  location: text("location").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }).notNull(),
  longitude: decimal("longitude", { precision: 10, scale: 7 }).notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("5.0"),
  reviewCount: integer("review_count").default(0),
  profileImageUrl: text("profile_image_url"),
  portfolioImages: text("portfolio_images").array().default(sql`ARRAY[]::text[]`),
  isAvailable: boolean("is_available").default(true),
  stripeAccountId: text("stripe_account_id"),
  portfolioInstagramUrl: text("portfolio_instagram_url"),
  portfolioWebsiteUrl: text("portfolio_website_url"),
  verificationStatus: text("verification_status").notNull().default("pending_review"), // 'pending_review', 'verified', 'rejected'
  rejectionReason: text("rejection_reason"),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
});

export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull().references(() => users.id),
  photographerId: varchar("photographer_id").notNull().references(() => photographers.id),
  duration: integer("duration").notNull(), // in hours
  location: text("location").notNull(),
  scheduledDate: timestamp("scheduled_date").notNull(),
  scheduledTime: text("scheduled_time").notNull(),
  baseAmount: decimal("base_amount", { precision: 10, scale: 2 }).notNull(), // photographer rate x duration
  customerServiceFee: decimal("customer_service_fee", { precision: 10, scale: 2 }).notNull(), // 10% fee charged to customer
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(), // baseAmount + customerServiceFee
  platformFee: decimal("platform_fee", { precision: 10, scale: 2 }).notNull(), // 20% taken from photographer
  photographerEarnings: decimal("photographer_earnings", { precision: 10, scale: 2 }).notNull(), // baseAmount - platformFee
  status: text("status").notNull().default("pending"), // pending, confirmed, completed, cancelled, expired
  stripePaymentId: text("stripe_payment_id"),
  expiresAt: timestamp("expires_at"), // 24 hours from creation for pending bookings
  meetingLatitude: decimal("meeting_latitude", { precision: 10, scale: 7 }),
  meetingLongitude: decimal("meeting_longitude", { precision: 10, scale: 7 }),
  meetingNotes: text("meeting_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").notNull().references(() => bookings.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  body: text("body").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const liveLocations = pgTable("live_locations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").notNull().references(() => bookings.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  latitude: decimal("latitude", { precision: 10, scale: 7 }).notNull(),
  longitude: decimal("longitude", { precision: 10, scale: 7 }).notNull(),
  accuracy: decimal("accuracy", { precision: 10, scale: 2 }),
  isActive: boolean("is_active").default(true).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const photoDeliveries = pgTable("photo_deliveries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").notNull().references(() => bookings.id),
  photographerId: varchar("photographer_id").notNull().references(() => photographers.id),
  photos: text("photos").array().default(sql`ARRAY[]::text[]`), // array of photo URLs
  message: text("message"), // optional message from photographer
  deliveredAt: timestamp("delivered_at").defaultNow().notNull(),
  downloadedAt: timestamp("downloaded_at"), // track when customer downloads
});

export const earnings = pgTable("earnings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  photographerId: varchar("photographer_id").notNull().references(() => photographers.id),
  bookingId: varchar("booking_id").notNull().references(() => bookings.id),
  grossAmount: decimal("gross_amount", { precision: 10, scale: 2 }).notNull(),
  platformFee: decimal("platform_fee", { precision: 10, scale: 2 }).notNull(),
  netAmount: decimal("net_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("held"), // held (until photos uploaded), pending (ready for payout), paid
  releasedAt: timestamp("released_at"), // when photos uploaded and payment released
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const photoSpots = pgTable("photo_spots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  city: text("city").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // landmark, park, street, waterfront, architecture, etc.
  latitude: decimal("latitude", { precision: 10, scale: 7 }).notNull(),
  longitude: decimal("longitude", { precision: 10, scale: 7 }).notNull(),
  imageUrl: text("image_url").notNull(),
  galleryImages: text("gallery_images").array().default(sql`ARRAY[]::text[]`),
  bestTimeToVisit: text("best_time_to_visit"),
  tips: text("tips"),
});

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").notNull().references(() => bookings.id).unique(),
  photographerId: varchar("photographer_id").notNull().references(() => photographers.id),
  customerId: varchar("customer_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  photographerResponse: text("photographer_response"),
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const editingServices = pgTable("editing_services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  photographerId: varchar("photographer_id").notNull().references(() => photographers.id).unique(),
  isEnabled: boolean("is_enabled").default(false).notNull(),
  pricingModel: text("pricing_model").notNull().default("flat"), // 'flat' or 'per_photo'
  flatRate: decimal("flat_rate", { precision: 10, scale: 2 }), // price for flat rate editing
  perPhotoRate: decimal("per_photo_rate", { precision: 10, scale: 2 }), // price per photo
  turnaroundDays: integer("turnaround_days").default(3), // estimated delivery time
  description: text("description"), // what's included in editing service
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const editingRequests = pgTable("editing_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").notNull().references(() => bookings.id),
  customerId: varchar("customer_id").notNull().references(() => users.id),
  photographerId: varchar("photographer_id").notNull().references(() => photographers.id),
  photoCount: integer("photo_count"), // number of photos to edit (for per_photo pricing)
  pricingModel: text("pricing_model").notNull(), // 'flat' or 'per_photo'
  baseAmount: decimal("base_amount", { precision: 10, scale: 2 }).notNull(),
  customerServiceFee: decimal("customer_service_fee", { precision: 10, scale: 2 }).notNull(), // 10% fee
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  platformFee: decimal("platform_fee", { precision: 10, scale: 2 }).notNull(), // 20% from photographer
  photographerEarnings: decimal("photographer_earnings", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("requested"), // requested, accepted, in_progress, delivered, completed, declined, cancelled
  customerNotes: text("customer_notes"), // special requests from customer
  photographerNotes: text("photographer_notes"), // notes from photographer
  editedPhotos: text("edited_photos").array().default(sql`ARRAY[]::text[]`), // delivered edited photos
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
  acceptedAt: timestamp("accepted_at"),
  deliveredAt: timestamp("delivered_at"),
  completedAt: timestamp("completed_at"),
  declinedAt: timestamp("declined_at"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertPhotographerSchema = createInsertSchema(photographers).omit({
  id: true,
  rating: true,
  reviewCount: true,
  isAvailable: true,
  verificationStatus: true,
  rejectionReason: true,
  reviewedAt: true,
  reviewedBy: true,
});

export const verificationStatusSchema = z.enum(["pending_review", "verified", "rejected"]);
export type VerificationStatus = z.infer<typeof verificationStatusSchema>;

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  status: true,
});

export const insertEarningSchema = createInsertSchema(earnings).omit({
  id: true,
  createdAt: true,
  status: true,
  paidAt: true,
});

export const insertPhotoSpotSchema = createInsertSchema(photoSpots).omit({
  id: true,
});

export const insertPhotoDeliverySchema = createInsertSchema(photoDeliveries).omit({
  id: true,
  deliveredAt: true,
  downloadedAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  photographerResponse: true,
  respondedAt: true,
});

export const insertEditingServiceSchema = createInsertSchema(editingServices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEditingRequestSchema = createInsertSchema(editingRequests).omit({
  id: true,
  requestedAt: true,
  acceptedAt: true,
  deliveredAt: true,
  completedAt: true,
  declinedAt: true,
  editedPhotos: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  isRead: true,
});

export const insertLiveLocationSchema = createInsertSchema(liveLocations).omit({
  id: true,
  updatedAt: true,
  isActive: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertPhotographer = z.infer<typeof insertPhotographerSchema>;
export type Photographer = typeof photographers.$inferSelect;

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

// Extended booking type with customer info for photographer view
export type BookingWithCustomer = Booking & {
  customer: {
    fullName: string;
    profileImageUrl: string | null;
  };
};

// Extended booking type with photographer info for customer view
export type BookingWithPhotographer = Booking & {
  photographer: {
    fullName: string;
    profileImageUrl: string | null;
  };
};

export type InsertEarning = z.infer<typeof insertEarningSchema>;
export type Earning = typeof earnings.$inferSelect;

export type InsertPhotoSpot = z.infer<typeof insertPhotoSpotSchema>;
export type PhotoSpot = typeof photoSpots.$inferSelect;

export type InsertPhotoDelivery = z.infer<typeof insertPhotoDeliverySchema>;
export type PhotoDelivery = typeof photoDeliveries.$inferSelect;

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

export type ReviewWithCustomer = Review & {
  customer: {
    fullName: string;
    profileImageUrl: string | null;
  };
};

export type InsertEditingService = z.infer<typeof insertEditingServiceSchema>;
export type EditingService = typeof editingServices.$inferSelect;

export type InsertEditingRequest = z.infer<typeof insertEditingRequestSchema>;
export type EditingRequest = typeof editingRequests.$inferSelect;

export type EditingRequestWithDetails = EditingRequest & {
  customer: {
    fullName: string;
    profileImageUrl: string | null;
  };
  photographer: {
    fullName: string;
    profileImageUrl: string | null;
  };
  booking: {
    location: string;
    scheduledDate: Date;
  };
};

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertLiveLocation = z.infer<typeof insertLiveLocationSchema>;
export type LiveLocation = typeof liveLocations.$inferSelect;

export type MessageWithSender = Message & {
  sender: {
    fullName: string;
    profileImageUrl: string | null;
  };
};

export type PhotographerApplication = Photographer & {
  user: {
    fullName: string;
    email: string;
    profileImageUrl: string | null;
    createdAt: Date;
  };
};
