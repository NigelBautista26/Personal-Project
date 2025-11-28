import { db } from "@db";
import { users, photographers } from "@shared/schema";
import bcrypt from "bcrypt";

async function seed() {
  console.log("🌱 Seeding database...");

  // Create photographer users
  const photographerData = [
    {
      email: "sarah@snapnow.com",
      password: await bcrypt.hash("password123", 10),
      fullName: "Sarah Johnson",
      role: "photographer",
      bio: "Professional travel photographer capturing moments worldwide",
      hourlyRate: "75.00",
      location: "Tower Bridge, London",
      latitude: "51.5055",
      longitude: "-0.0754",
      profileImageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
      portfolioImages: [
        "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad",
        "https://images.unsplash.com/photo-1502602898657-3e91760cbb34",
        "https://images.unsplash.com/photo-1526772662000-3f88f10405ff"
      ],
    },
    {
      email: "marcus@snapnow.com",
      password: await bcrypt.hash("password123", 10),
      fullName: "Marcus Chen",
      role: "photographer",
      bio: "Specialized in urban photography and street scenes",
      hourlyRate: "60.00",
      location: "Piccadilly Circus, London",
      latitude: "51.5100",
      longitude: "-0.1357",
      profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
      portfolioImages: [
        "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa",
        "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846",
        "https://images.unsplash.com/photo-1513407030348-c983a97b98d8"
      ],
    },
    {
      email: "emma@snapnow.com",
      password: await bcrypt.hash("password123", 10),
      fullName: "Emma Rodriguez",
      role: "photographer",
      bio: "Creative portrait and lifestyle photographer",
      hourlyRate: "85.00",
      location: "Camden Market, London",
      latitude: "51.5415",
      longitude: "-0.1468",
      profileImageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
      portfolioImages: [
        "https://images.unsplash.com/photo-1516733968668-dbdce39c4651",
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
        "https://images.unsplash.com/photo-1509967419530-da38b4704bc6"
      ],
    },
    {
      email: "james@snapnow.com",
      password: await bcrypt.hash("password123", 10),
      fullName: "James Williams",
      role: "photographer",
      bio: "Architectural and landmark photography specialist",
      hourlyRate: "70.00",
      location: "Westminster Abbey, London",
      latitude: "51.4994",
      longitude: "-0.1273",
      profileImageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
      portfolioImages: [
        "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad",
        "https://images.unsplash.com/photo-1486299267070-83823f5448dd",
        "https://images.unsplash.com/photo-1549144511-f099e773c147"
      ],
    },
  ];

  for (const photog of photographerData) {
    const { bio, hourlyRate, location, latitude, longitude, profileImageUrl, portfolioImages, ...userData } = photog;

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
