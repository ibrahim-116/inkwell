import { Prisma } from "@prisma/client";

export type PostWithAuthorAndTags = Prisma.PostGetPayload<{
  include: {
    author: {
      select: { name: true; username: true; avatarUrl: true; bio: true };
    };
    tags: {
      include: { Topic: true };
    };
  };
}> & {
  isLiked?: boolean;
  isSaved?: boolean;
};
