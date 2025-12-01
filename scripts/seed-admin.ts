import bcrypt from "bcrypt";
import { db } from "../server/db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";

async function seedAdmin() {
  const adminEmail = "admin@snapnow.com";
  
  // Check if admin already exists
  const existingAdmin = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);
  
  if (existingAdmin.length > 0) {
    console.log("Admin user already exists");
    return;
  }
  
  // Create admin user with hashed password
  const hashedPassword = await bcrypt.hash("admin123", 10);
  
  const [admin] = await db.insert(users).values({
    email: adminEmail,
    password: hashedPassword,
    fullName: "Platform Admin",
    role: "admin",
  }).returning();
  
  console.log("Admin user created successfully:");
  console.log(`  Email: ${adminEmail}`);
  console.log(`  Password: admin123`);
  console.log(`  ID: ${admin.id}`);
}

seedAdmin()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error seeding admin:", err);
    process.exit(1);
  });
