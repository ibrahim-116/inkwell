"use server";

import { prisma } from "@/lib/prisma";

export async function globalSearch(query: string) {
  if (!query || query.length < 2) return { posts: [], users: [], topics: [] };

  const sanitizedQuery = query.trim();

  const [posts, users, topics] = await Promise.all([
    // Search Posts
    prisma.post.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { title: { contains: sanitizedQuery, mode: "insensitive" } },
          { subtitle: { contains: sanitizedQuery, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        author: { select: { name: true, username: true } },
      },
      take: 5,
    }),
    
    // Search Users
    prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: sanitizedQuery, mode: "insensitive" } },
          { username: { contains: sanitizedQuery, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        avatarUrl: true,
      },
      take: 5,
    }),

    // Search Topics
    prisma.topic.findMany({
      where: {
        label: { contains: sanitizedQuery, mode: "insensitive" },
      },
      select: {
        id: true,
        label: true,
        slug: true,
      },
      take: 5,
    }),
  ]);

  return { posts, users, topics };
}
