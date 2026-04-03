import { Prisma } from "@prisma/client";

export type PostWithAuthorAndTags = Omit<Prisma.PostGetPayload<{
  include: {
    author: {
      select: { name: true; username: true; avatarUrl: true; bio: true };
    };
    tags: {
      include: { Topic: true };
    };
  };
}>, "createdAt" | "updatedAt" | "publishedAt" | "scheduledAt" | "editedAt"> & {
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  scheduledAt: string | null;
  editedAt: string | null;
  isLiked?: boolean;
  isSaved?: boolean;
};
