"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { startOfDay, subDays } from "date-fns";

export async function getAuthorAnalyticsReport(days = 30) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const startDate = startOfDay(subDays(new Date(), days));

  // 1. Fetch total aggregate stats from Post model
  const aggregates = await prisma.post.aggregate({
    where: { authorId: userId },
    _sum: {
      viewCount: true,
      likeCount: true,
      commentCount: true,
    }
  });

  const followerCount = await prisma.follow.count({
    where: { followingId: userId }
  });

  // 2. Fetch daily performance over time
  // Grouping by date for the area chart
  const dailyMetrics = await prisma.postDailyMetric.groupBy({
    by: ['date'],
    where: {
      Post: { authorId: userId },
      date: { gte: startDate }
    },
    _sum: {
      views: true,
      likes: true,
      comments: true,
    },
    orderBy: { date: 'asc' }
  });

  // 3. Fetch Top Performing Content
  const topPosts = await prisma.post.findMany({
    where: { authorId: userId, status: "PUBLISHED" },
    orderBy: { viewCount: 'desc' },
    take: 5,
    select: {
      id: true,
      title: true,
      slug: true,
      viewCount: true,
      likeCount: true,
      commentCount: true,
      publishedAt: true,
    }
  });

  return {
    success: true,
    summary: {
      totalViews: aggregates._sum.viewCount || 0,
      totalLikes: aggregates._sum.likeCount || 0,
      totalComments: aggregates._sum.commentCount || 0,
      totalFollowers: followerCount || 0,
    },
    timeSeries: dailyMetrics.map((m: any) => ({
      date: m.date.toISOString().split('T')[0],
      views: m._sum.views || 0,
      engagement: (m._sum.likes || 0) + (m._sum.comments || 0),
    })),
    topPosts
  };
}
