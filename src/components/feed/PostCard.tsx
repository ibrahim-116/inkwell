import { formatRelativeTime } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";
import PostInteractions from "@/components/post/PostInteractions";
import { OptimizedText } from "@/components/ui/OptimizedText";

interface PostCardProps {
  post: {
    id: string;
    title: string;
    subtitle?: string | null;
    slug: string;
    coverImageUrl?: string | null;
    readTimeMinutes: number;
    createdAt: Date | string;
    commentCount: number;
    likeCount: number;
    author: {
      name?: string | null;
      username: string;
      avatarUrl?: string | null;
    };
    tags: {
      Topic: {
        label: string;
        slug: string;
      };
    }[];
  };
  isLiked?: boolean;
  isSaved?: boolean;
  isAuthenticated?: boolean;
}

export default function PostCard({ post, isLiked = false, isSaved = false, isAuthenticated = false }: PostCardProps) {
  const primaryTag = post.tags[0]?.Topic;

  return (
    <article className="card overflow-hidden flex flex-col md:flex-row group relative hover:shadow-sm transition-all duration-300">
      {/* 
        Stretched link to make the whole card clickable. 
        Nested interactive elements (links, buttons) are elevated with relative z-10.
      */}
      <Link 
        href={`/post/${post.slug}`} 
        className="absolute inset-0 z-0"
        aria-label={`Read post: ${post.title}`}
      />

      {/* Content Side */}
      <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
        <div>
          {/* Metadata */}
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <Link
              href={`/profile/${post.author.username}`}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              {post.author.avatarUrl ? (
                <div className="relative w-5 h-5 rounded-full overflow-hidden border border-gray-100">
                  <Image
                    src={post.author.avatarUrl}
                    alt={post.author.name ?? "Author"}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400 border border-gray-200">
                  {post.author.name?.[0].toUpperCase() ?? "U"}
                </div>
              )}
              <span className="text-xs font-semibold text-gray-900">{post.author.name}</span>
            </Link>
            <span className="text-gray-300">·</span>
            <span className="text-xs text-gray-500">{formatRelativeTime(post.createdAt)}</span>
          </div>

          {/* Title & Subtitle */}
          <div className="pointer-events-none mb-4">
            <OptimizedText
              text={post.title}
              variant="post-title"
              maxLines={2}
              as="h2"
              className="mb-2 group-hover:text-[#D4A373] transition-colors"
            />
            {post.subtitle && (
              <OptimizedText
                text={post.subtitle}
                variant="post-subtitle"
                maxLines={2}
                as="p"
                className="text-gray-600 leading-relaxed"
              />
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col gap-4 mt-6 pt-4 border-t border-gray-100 relative z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Clock className="w-3.5 h-3.5" />
              <span>{post.readTimeMinutes} min read</span>
            </div>
            {primaryTag && (
              <Link
                href={`/topic/${primaryTag.slug}`}
                className="text-[10px] py-1 px-2.5 uppercase tracking-wider bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full text-gray-600 transition-colors"
              >
                {primaryTag.label}
              </Link>
            )}
          </div>

          <PostInteractions
            postId={post.id}
            postSlug={post.slug}
            postTitle={post.title}
            initialLikes={post.likeCount}
            initialComments={post.commentCount}
            isLiked={isLiked}
            isSaved={isSaved}
            isAuthenticated={isAuthenticated}
          />
        </div>
      </div>

      {/* Image Side (Optional) */}
      {post.coverImageUrl && (
        <div className="md:w-1/3 h-48 md:h-auto overflow-hidden bg-gray-50 border-l border-gray-100 relative pointer-events-none">
          <Image
            src={post.coverImageUrl}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      )}
    </article>
  );
}
