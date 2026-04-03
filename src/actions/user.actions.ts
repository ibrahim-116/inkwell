"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const UpdateUserSettingsSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  username: z.string().min(3, "Username must be at least 3 characters").max(30).regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  bio: z.string().max(200, "Bio must be 200 characters or less").optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  website: z.string().url("Invalid URL").optional().nullable().or(z.literal("")),
  avatarUrl: z.string().url().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  showLocation: z.boolean().default(true),
  interests: z.array(z.string()), // topic IDs
});

export async function updateUserSettings(data: z.infer<typeof UpdateUserSettingsSchema>) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const validated = UpdateUserSettingsSchema.parse(data);

  // Check if username is taken by someone else
  if (validated.username !== session.user.username) {
    const existing = await prisma.user.findUnique({
      where: { username: validated.username },
    });
    if (existing) throw new Error("Username is already taken");
  }

  const userId = session.user.id;

  try {
    await prisma.$transaction(async (tx) => {
      // Update user info
      await tx.user.update({
        where: { id: userId },
        data: {
          name: validated.name,
          username: validated.username,
          bio: validated.bio,
          location: validated.location,
          website: validated.website || null,
          avatarUrl: validated.avatarUrl,
          latitude: validated.latitude,
          longitude: validated.longitude,
          showLocation: validated.showLocation,
        },
      });

      // Update interests: Delete old ones not in the new list, Add new ones not in the old list
      const currentInterests = await tx.userInterest.findMany({
        where: { userId: userId },
        select: { topicId: true },
      });

      const currentTopicIds = currentInterests.map((i) => i.topicId);
      const newTopicIds = validated.interests;

      const toAdd = newTopicIds.filter((id) => !currentTopicIds.includes(id));
      const toRemove = currentTopicIds.filter((id) => !newTopicIds.includes(id));

      if (toRemove.length > 0) {
        await tx.userInterest.deleteMany({
          where: {
            userId: userId,
            topicId: { in: toRemove },
          },
        });
      }

      if (toAdd.length > 0) {
        await tx.userInterest.createMany({
          data: toAdd.map((topicId) => ({
            userId: userId,
            topicId,
          })),
        });
      }
    });

    revalidatePath("/settings");
    revalidatePath(`/profile/${validated.username}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating user settings:", error);
    throw new Error("Failed to update settings");
  }
}

export async function getAllTopics() {
  return await prisma.topic.findMany({
    orderBy: { label: "asc" },
  });
}

export async function completeOnboardingAction(topicSlugs: string[]) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  if (topicSlugs.length < 3) {
    return { success: false, error: "Please select at least 3 topics" };
  }

  const userId = session.user.id;

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Find the topic records for the slugs
      const topicRecords = await tx.topic.findMany({
        where: { slug: { in: topicSlugs } },
        select: { id: true },
      });

      if (topicRecords.length < 3) {
        throw new Error("Required topics not found in database.");
      }

      // 2. Update user profile
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          onboardingCompleted: true,
        },
      });

      // 3. Set interests
      await tx.userInterest.deleteMany({ where: { userId } });
      await tx.userInterest.createMany({
        data: topicRecords.map((topic) => ({
          userId,
          topicId: topic.id,
        })),
      });

      // 4. Set initial topic affinities
      await tx.userTopicAffinity.deleteMany({ where: { userId } });
      await tx.userTopicAffinity.createMany({
        data: topicRecords.map((topic) => ({
          userId,
          topicId: topic.id,
          score: 5.0,
        })),
      });

      return updatedUser;
    });

    revalidatePath("/feed");
    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    console.error("Onboarding action error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to complete onboarding" 
    };
  }
}

