"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import { NotificationType } from "@prisma/client";

/**
 * Internal helper to create a notification and trigger Pusher
 */
export async function createNotification({
  recipientId,
  type,
  message,
  referenceId,
  referenceType,
}: {
  recipientId: string;
  type: NotificationType;
  message: string;
  referenceId?: string;
  referenceType?: string;
}) {
  const session = await auth();
  const actorId = session?.user?.id;

  // Don't notify yourself
  if (actorId === recipientId) return;

  try {
    const notification = await prisma.notification.create({
      data: {
        recipientId,
        type,
        message,
        referenceId,
        referenceType,
      },
      include: {
        recipient: {
          select: {
            name: true,
            username: true,
          }
        }
      }
    });

    // Trigger Pusher event on the user's private channel
    await pusherServer.trigger(`user-${recipientId}`, "new-notification", {
      id: notification.id,
      type: notification.type,
      message: notification.message,
      createdAt: notification.createdAt.toISOString(),
      read: false,
    });

    return notification;
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
}

/**
 * Get all notifications for the current user
 */
export async function getNotifications(limit = 20) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return prisma.notification.findMany({
    where: { recipientId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/**
 * Mark a specific notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return prisma.notification.update({
    where: { 
      id: notificationId,
      recipientId: session.user.id // Security check
    },
    data: { read: true },
  });
}

/**
 * Mark all notifications as read for current user
 */
export async function markAllNotificationsAsRead() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return prisma.notification.updateMany({
    where: { 
      recipientId: session.user.id,
      read: false 
    },
    data: { read: true },
  });
}

/**
 * Get total unread count for current user
 */
export async function getUnreadNotificationCount() {
  const session = await auth();
  if (!session?.user?.id) return { count: 0 };

  const count = await prisma.notification.count({
    where: {
      recipientId: session.user.id,
      read: false,
    },
  });

  return { count };
}

