import { Redis } from "@upstash/redis";

export const redis = Redis.fromEnv();

export const CACHE_KEYS = {
  feedHome: (userId: string) => `feed:${userId}:home`,
  feedFollowing: (userId: string) => `feed:${userId}:following`,
  feedTrending: (topicId: string) => `feed:trending:${topicId}`,
  post: (postId: string) => `post:${postId}`,
  userProfile: (username: string) => `user:${username}`,
} as const;

export const CACHE_TTL = {
  feedHome: 300,       // 5 minutes
  feedFollowing: 120,  // 2 minutes
  feedTrending: 600,   // 10 minutes
  post: 1800,          // 30 minutes
  userProfile: 300,    // 5 minutes
} as const;
