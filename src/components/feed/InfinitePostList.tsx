"use client";

import { useEffect, useState, useRef } from "react";
import PostCard from "./PostCard";
import { getPosts } from "@/actions/post.actions";
import { PostWithAuthorAndTags } from "@/lib/types";
import { Loader2 } from "lucide-react";

interface InfinitePostListProps {
  initialPosts: PostWithAuthorAndTags[];
  initialCursor: string | null;
  topic?: string;
  sort?: string;
  userTopics?: string[];
  isAuthenticated?: boolean;
}

export default function InfinitePostList({
  initialPosts,
  initialCursor,
  topic,
  sort,
  userTopics,
  isAuthenticated = false,
}: InfinitePostListProps) {
  const [posts, setPosts] = useState<PostWithAuthorAndTags[]>(() => {
    // Deduplicate initial posts just in case
    const unique = new Map<string, PostWithAuthorAndTags>();
    initialPosts.forEach(p => unique.set(p.id, p));
    return Array.from(unique.values());
  });
  const [nextCursor, setNextCursor] = useState<string | null>(initialCursor);
  const [isLoading, setIsLoading] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Reset state when topic or sort changes
  useEffect(() => {
    const unique = new Map<string, PostWithAuthorAndTags>();
    initialPosts.forEach(p => unique.set(p.id, p));
    setPosts(Array.from(unique.values()));
    setNextCursor(initialCursor);
  }, [initialPosts, initialCursor, topic, sort]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting && nextCursor && !isLoading) {
          setIsLoading(true);
          try {
            const data = await getPosts({
              cursor: nextCursor,
              limit: 10,
              topic,
              sort,
              userTopics,
            });
            setPosts((prev) => {
              const newItems = (data.items as PostWithAuthorAndTags[]).filter(
                (newItem) => !prev.some((prevItem) => prevItem.id === newItem.id)
              );
              return [...prev, ...newItems];
            });
            setNextCursor(data.nextCursor);
          } catch (error) {
            console.error("Failed to load more posts:", error);
          } finally {
            setIsLoading(false);
          }
        }
      },
      { threshold: 1.0 }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [nextCursor, isLoading, topic, sort, userTopics]);

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          isLiked={post.isLiked}
          isSaved={post.isSaved}
          isAuthenticated={isAuthenticated}
        />
      ))}

      {nextCursor && (
        <div ref={loaderRef} className="flex justify-center py-10">
          {isLoading ? (
            <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
          ) : (
            <div className="h-4" /> // Trigger zone
          )}
        </div>
      )}

      {!nextCursor && posts.length > 0 && (
        <p className="text-center text-gray-400 text-sm py-10 italic">
          You&apos;ve reached the end of your feed.
        </p>
      )}
    </div>
  );
}
