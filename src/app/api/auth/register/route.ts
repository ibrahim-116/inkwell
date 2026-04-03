import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import argon2 from "argon2";
import { z } from "zod";
import crypto from "crypto";

const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input. Please check your details." },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    // Check if user already exists
    let existing;
    try {
      existing = await prisma.user.findUnique({ where: { email } });
    } catch (dbError: any) {
      console.error("[DATABASE_ERROR]", dbError);
      return NextResponse.json({ error: "Database connection failed.", details: dbError.message }, { status: 500 });
    }
    
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // Hash password
    let passwordHash;
    try {
      passwordHash = await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
      });
    } catch (hashError: any) {
      console.error("[HASHING_ERROR]", hashError);
      return NextResponse.json({ error: "Password encryption failed.", details: hashError.message }, { status: 500 });
    }

    // Generate username
    const base = email.split("@")[0].replace(/[^a-z0-9]/gi, "_").toLowerCase();
    const suffix = crypto.randomBytes(3).toString("hex");
    const username = `${base}_${suffix}`;

    // Create user
    let user;
    try {
      user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          username,
          emailVerified: new Date(),
        },
      });
    } catch (createError: any) {
      console.error("[CREATION_ERROR]", createError);
      return NextResponse.json({ error: "User creation failed.", details: createError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, userId: user.id });

  } catch (error: Error | any) {
    console.error("Critical registration error:", error);
    return NextResponse.json(
      { 
        error: "Critical failure occurred.",
        details: process.env.NODE_ENV === "development" ? (error as Error).message : undefined 
      },
      { status: 500 }
    );
  }
}
