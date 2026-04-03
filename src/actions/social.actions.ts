"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createNotification } from "./notification.actions";

/**
 * Toggle Follow/Unfollow for a user
 */
export async function toggleFollow(followingId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const followerId = session.user.id;
  if (followerId === followingId) throw new Error("Cannot follow yourself");

  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId,
      },
    },
  });

  if (existingFollow) {
    await prisma.follow.delete({
      where: { id: existingFollow.id },
    });
  } else {
    await prisma.follow.create({
      data: { followerId, followingId },
    });

    // Notify the user being followed
    const actorUsername = (session.user as any).username;
    await createNotification({
      recipientId: followingId,
      type: "NEW_FOLLOWER",
      message: `${session.user.name || "Someone"} started following you`,
      referenceId: actorUsername, // Use username for navigation
      referenceType: "USER",
    });
  }

  revalidatePath("/(main)/feed", "page");
  revalidatePath(`/post/[slug]`, "layout");
}

/**
 * Toggle Like/Unlike for a post
 */
export async function togglePostLike(postId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  const existingLike = await prisma.reaction.findUnique({
    where: {
      PostLikeness: {
        userId,
        postId,
        type: "LIKE",
      },
    },
  });

  if (existingLike) {
    await prisma.$transaction([
      prisma.reaction.delete({ where: { id: existingLike.id } }),
      prisma.post.update({
        where: { id: postId },
        data: { likeCount: { decrement: 1 } },
      }),
    ]);
  } else {
    await prisma.$transaction([
      prisma.reaction.create({
        data: {
          userId,
          targetType: "POST",
          postId,
          type: "LIKE",
        },
      }),
      prisma.post.update({
        where: { id: postId },
        data: { likeCount: { increment: 1 } },
      }),
    ]);

    // Send notification to post author
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true, title: true, slug: true }
    });

    if (post) {
      await createNotification({
        recipientId: post.authorId,
        type: "LIKE_ON_POST",
        message: `${session.user.name || "Someone"} liked your post: ${post.title}`,
        referenceId: post.slug,
        referenceType: "POST",
      });
    }
  }

  revalidatePath("/(main)/feed", "page");
  revalidatePath(`/post/[slug]`, "layout");
}

/**
 * Toggle Save/Unsave for a post
 */
export async function toggleSavePost(postId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  const existingSave = await prisma.savedPost.findUnique({
    where: {
      userId_postId: { userId, postId },
    },
  });

  if (existingSave) {
    await prisma.savedPost.delete({ where: { id: existingSave.id } });
  } else {
    await prisma.savedPost.create({
      data: { userId, postId },
    });
  }

  revalidatePath("/(main)/feed", "page");
  revalidatePath(`/post/[slug]`, "layout");
}

/**
 * Add a comment to a post
 */
export async function addComment({
  postId,
  bodyText,
  parentCommentId,
}: {
  postId: string;
  bodyText: string;
  parentCommentId?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const authorId = session.user.id;

  const comment = await prisma.$transaction(async (tx: any) => {
    const newComment = await tx.comment.create({
      data: {
        postId,
        authorId,
        bodyText,
        parentCommentId,
      },
      include: {
        author: {
          select: {
            name: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    await tx.post.update({
      where: { id: postId },
      data: { commentCount: { increment: 1 } },
    });

    return newComment;
  });

  // Notifications
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true, title: true, slug: true }
  });

  if (post) {
    if (parentCommentId) {
      // Notify parent comment author
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentCommentId },
        select: { authorId: true }
      });
      if (parentComment && parentComment.authorId !== authorId) {
        await createNotification({
          recipientId: parentComment.authorId,
          type: "REPLY_TO_COMMENT",
          message: `${session.user.name || "Someone"} replied to your response on: ${post.title}`,
          referenceId: post.slug,
          referenceType: "POST",
        });
      }
    } else if (post.authorId !== authorId) {
      // Notify post author
      await createNotification({
        recipientId: post.authorId,
        type: "COMMENT_ON_POST",
        message: `${session.user.name || "Someone"} responded to your post: ${post.title}`,
        referenceId: post.slug,
        referenceType: "POST",
      });
    }
  }

  revalidatePath(`/post/[slug]`, "layout");
  return comment;
}

/**
 * Update a comment's text
 */
export async function updateComment(commentId: string, bodyText: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { authorId: true, postId: true }
  });

  if (!comment || comment.authorId !== session.user.id) {
    throw new Error("Unauthorized to edit this comment");
  }

  await prisma.comment.update({
    where: { id: commentId },
    data: { bodyText }
  });

  revalidatePath(`/post`, "layout");
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { authorId: true, postId: true }
  });

  if (!comment) throw new Error("Comment not found");

  // Allow author or post author to delete? For now, just comment author as requested
  if (comment.authorId !== session.user.id) {
    throw new Error("Unauthorized to delete this comment");
  }

  await prisma.$transaction([
    prisma.comment.delete({ where: { id: commentId } }),
    prisma.post.update({
      where: { id: comment.postId },
      data: { commentCount: { decrement: 1 } }
    })
  ]);

  revalidatePath(`/post`, "layout");
}

/**
 * Report a comment
 */
export async function reportComment(commentId: string, reason: string, description?: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const reporterId = session.user.id;

  await prisma.report.create({
    data: {
      reporterId,
      commentId,
      targetType: "COMMENT",
      reason: reason as any, // Cast to enum
      description
    }
  });

  // No specific path to revalidate, maybe just return success
}

