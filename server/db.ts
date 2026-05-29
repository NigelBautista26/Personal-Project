import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";

const connectionString = process.env.SNAPNOW_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("No database URL found. Set SNAPNOW_DATABASE_URL or DATABASE_URL.");
}

export const db = drizzle({
  connection: connectionString,
  ws: ws,
});
