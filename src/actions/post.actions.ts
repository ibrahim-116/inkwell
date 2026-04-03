"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getPosts({
  cursor,
  limit = 10,
  topic,
  sort,
  userTopics = [],
}: {
  cursor?: string;
  limit?: number;
  topic?: string;
  sort?: string;
  userTopics?: string[];
}) {
  const session = await auth();
  const currentUserId = session?.user?.id;

  const posts = await prisma.post.findMany({
    where: {
      status: "PUBLISHED",
      ...(topic
        ? { tags: { some: { Topic: { slug: topic } } } }
        : userTopics.length > 0
        ? { tags: { some: { topicId: { in: userTopics } } } }
        : {}),
    },
    include: {
      author: {
        select: { name: true, username: true, avatarUrl: true, bio: true },
      },
      tags: {
        include: { Topic: true },
      },
      ...(currentUserId ? {
        Reaction: {
          where: { userId: currentUserId, type: "LIKE", targetType: "POST" },
          select: { id: true }
        },
        SavedPost: {
          where: { userId: currentUserId },
          select: { id: true }
        }
      } : {})
    },
    orderBy: sort === "recent" ? [{ publishedAt: "desc" }, { id: "desc" }] : [{ viewCount: "desc" }, { id: "desc" }],
    take: limit,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
  });

  const nextCursor = posts.length === limit ? posts[posts.length - 1].id : null;

  // Add interaction status to posts
  const items = posts.map((post) => {
    const p = post as typeof post & { Reaction?: { id: string }[]; SavedPost?: { id: string }[] };
    return {
      ...post,
      isLiked: !!(p.Reaction && p.Reaction.length > 0),
      isSaved: !!(p.SavedPost && p.SavedPost.length > 0),
    };
  });

  return {
    items,
    nextCursor,
  };
}

export async function deletePost(postId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Verify ownership
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post || post.authorId !== session.user.id) {
      throw new Error("Unauthorized");
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    return { success: true };
  } catch (error) {
    console.error("Delete error:", error);
    throw new Error("Failed to delete post");
  }
}

export async function togglePostStatus(postId: string, currentStatus: "DRAFT" | "PUBLISHED") {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Verify ownership
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post || post.authorId !== session.user.id) {
      throw new Error("Unauthorized");
    }

    const newStatus = currentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { 
        status: newStatus,
        publishedAt: newStatus === "PUBLISHED" ? new Date() : undefined
      },
    });

    return { success: true, newStatus: updatedPost.status, slug: updatedPost.slug };
  } catch (error) {
    console.error("Status toggle error:", error);
    throw new Error("Failed to update status");
  }
}

/**
 * Updates or creates a reading engagement record for a post.
 * Tracks how far the user has scrolled.
 */
export async function updatePostEngagement(postId: string, scrollDepth: number) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const engagement = await prisma.postEngagement.upsert({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: postId,
        },
      },
      update: {
        scrollDepth: scrollDepth,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        postId: postId,
        scrollDepth: scrollDepth,
      },
    });

    return { success: true, engagement };
  } catch (error) {
    console.error("Engagement update error:", error);
    return { success: false, error: "Failed to update engagement" };
  }
}

