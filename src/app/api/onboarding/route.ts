import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const onboardingSchema = z.object({
  topics: z.array(z.string()).min(3, "Please select at least 3 topics"),
  bio: z.string().max(200).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url().optional().or(z.literal("")),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = onboardingSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.issues?.[0]?.message || "Validation Error" },
        { status: 400 }
      );
    }

    const { topics, bio, location, website } = result.data;
    const userId = session.user.id;

    // Use a transaction to ensure all updates succeed or fail together
    await prisma.$transaction(async (tx) => {
      // 1. Update user profile and mark onboarding as complete
      await tx.user.update({
        where: { id: userId },
        data: {
          bio: bio || null,
          location: location || null,
          website: website || null,
          onboardingCompleted: true,
        },
      });

      // 2. Find internal IDs for the selected topic slugs
      const topicRecords = await tx.topic.findMany({
        where: { slug: { in: topics } },
        select: { id: true, slug: true },
      });

      if (topicRecords.length < 3) {
        throw new Error("Could not find enough matching topics in the database.");
      }

      // 3. Clear existing interests if any (for idempotency)
      await tx.userInterest.deleteMany({
        where: { userId },
      });

      // 4. Set new interests
      await tx.userInterest.createMany({
        data: topicRecords.map((topic) => ({
          userId,
          topicId: topic.id,
        })),
      });

      // 5. Initialize topic affinities for the personalized feed
      await tx.userTopicAffinity.deleteMany({
        where: { userId },
      });

      await tx.userTopicAffinity.createMany({
        data: topicRecords.map((topic) => ({
          userId,
          topicId: topic.id,
          score: 5.0, // Significant starting score for chosen interests
        })),
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Onboarding API Error:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to save your preferences. Please try again.",
        details: process.env.NODE_ENV === "development" ? error.message : undefined 
      },
      { status: 500 }
    );
  }
}
