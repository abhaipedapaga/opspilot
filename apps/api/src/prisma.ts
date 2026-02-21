import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const { Pool } = pg;

console.log("DATABASE_URL:", process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });
// Temporary connection test - remove after fix
prisma.$connect()
  .then(() => console.log("✅ Prisma connected to DB"))
  .catch((err) => console.error("❌ Prisma connection failed:", err));