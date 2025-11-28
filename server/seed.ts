import { db } from "@db";
import { users, photographers } from "@shared/schema";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await db.delete(photographers);
  await db.delete(users).where(eq(users.role, 'photographer'));

  // Create photographer users with original names
  const photographerData = [
    {
      email: "anna@snapnow.com",
      password: await bcrypt.hash("password123", 10),
      fullName: "Anna L.",
      role: "photographer",
      bio: "Professional portrait and lifestyle photographer. I love capturing candid moments and natural light. Let's create something magic!",
      hourlyRate: "40.00",
      location: "London, UK",
      latitude: "51.5074",
      longitude: "-0.1278",
      rating: "4.9",
      reviewCount: 128,
      profileImageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&h=400",
      portfolioImages: [
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400",
        "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400",
        "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400",
        "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400",
        "https://images.unsplash.com/photo-1519764622345-23439dd776f7?w=400",
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400"
      ],
    },
    {
      email: "jose@snapnow.com",
      password: await bcrypt.hash("password123", 10),
      fullName: "Jose V.",
      role: "photographer",
      bio: "Street style and urban vibes. If you want edgy, cool content for your socials, I'm your guy.",
      hourlyRate: "35.00",
      location: "Shoreditch, London",
      latitude: "51.5246",
      longitude: "-0.0793",
      rating: "4.7",
      reviewCount: 84,
      profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400",
      portfolioImages: [
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"
      ],
    },
    {
      email: "sophie@snapnow.com",
      password: await bcrypt.hash("password123", 10),
      fullName: "Sophie M.",
      role: "photographer",
      bio: "Fashion and editorial photography specialist. I help brands and influencers create stunning visual stories that stand out.",
      hourlyRate: "50.00",
      location: "Notting Hill, London",
      latitude: "51.5171",
      longitude: "-0.2051",
      rating: "5.0",
      reviewCount: 42,
      profileImageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400",
      portfolioImages: [
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400",
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400", 
        "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400",
        "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400"
      ],
    },
  ];

  for (const photog of photographerData) {
    const { bio, hourlyRate, location, latitude, longitude, profileImageUrl, portfolioImages, rating, reviewCount, ...userData } = photog;

    // Create user
    const [user] = await db.insert(users).values(userData).returning();

    // Create photographer profile
    await db.insert(photographers).values({
      userId: user.id,
      bio,
      hourlyRate,
      location,
      latitude,
      longitude,
      rating,
      reviewCount,
      profileImageUrl,
      portfolioImages,
    });

    console.log(`✅ Created photographer: ${user.fullName}`);
  }

  console.log("✨ Seed completed!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});
