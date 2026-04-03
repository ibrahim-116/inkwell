import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function test() {
  console.log("Testing connection to:", process.env.DATABASE_URL);
  try {
    await prisma.$connect();
    console.log("✅ Successfully connected to the database!");
    const userCount = await prisma.user.count();
    console.log("✅ User table accessible. Count:", userCount);
  } catch (error) {
    console.error("❌ Connection failed:");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
