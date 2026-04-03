import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatRelativeTime } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { Clock, Share2 } from "lucide-react";
import { auth } from "@/auth";
import PostInteractions from "@/components/post/PostInteractions";
import FollowButton from "@/components/post/FollowButton";
import CommentSection, { type Comment } from "@/components/post/CommentSection";

import TiptapRenderer from "@/components/editor/TiptapRenderer";
import PostPageControls from "@/components/post/PostPageControls";
import { OptimizedText } from "@/components/ui/OptimizedText";
import ReadingTracker from "@/components/post/ReadingTracker";
import type { Metadata, ResolvingMetadata } from "next";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  
  const post = await prisma.post.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      author: { select: { name: true, username: true } },
    },
  });

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: post.title,
    description: post.subtitle || `A story by ${post.author.name || post.author.username}`,
    authors: [{ name: post.author.name || post.author.username }],
    openGraph: {
      type: "article",
      title: post.title,
      description: post.subtitle || `A story by ${post.author.name || post.author.username} on Inkwell.`,
      url: `https://inkwell.vercel.app/post/${post.slug}`,
      publishedTime: post.publishedAt?.toISOString(),
      images: post.coverImageUrl ? [post.coverImageUrl] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.subtitle || `A story by ${post.author.name || post.author.username} on Inkwell.`,
      images: post.coverImageUrl ? [post.coverImageUrl] : [],
    },
  };
}


export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();
  const currentUserId = session?.user?.id;
  
  const post = await prisma.post.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      author: {
        select: { id: true, name: true, username: true, avatarUrl: true, bio: true },
      },
      tags: {
        include: { Topic: true },
      },
      Comment: {
        where: { parentCommentId: null },
        include: {
          author: { select: { name: true, username: true, avatarUrl: true } },
          other_Comments: {
            include: { author: { select: { name: true, username: true, avatarUrl: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { Comment: true, Reaction: true } },
    },
  });

  if (!post) notFound();

  let isFollowing = false;
  let isLiked = false;
  let isSaved = false;

  if (currentUserId) {
    const [follow, like, save] = await Promise.all([
      prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: currentUserId, followingId: post.author.id } },
      }),
      prisma.reaction.findUnique({
        where: { 
          PostLikeness: { 
            userId: currentUserId, 
            postId: post.id, 
            type: "LIKE" 
          } 
        },
      }),
      prisma.savedPost.findUnique({
        where: { userId_postId: { userId: currentUserId, postId: post.id } },
      }),
    ]);
    isFollowing = !!follow;
    isLiked = !!like;
    isSaved = !!save;
  }

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-12 lg:py-20">
      {currentUserId && <ReadingTracker postId={post.id} />}
      <header className="mb-12">

        <div className="flex items-center gap-2 mb-8">
          {post.tags.map((tag) => (
            <Link
              key={tag.Topic.id}
              href={`/topic/${tag.Topic.slug}`}
              className="tag text-[11px] px-3 py-1 bg-gray-100 hover:bg-[#F5EDE4] border-transparent transition-colors uppercase tracking-wider text-gray-600 hover:text-[#D4A373] rounded-full"
            >
              {tag.Topic.label}
            </Link>
          ))}
        </div>

        <OptimizedText
          text={post.title}
          variant="h1"
          as="h1"
          className="text-4xl md:text-6xl font-bold mb-8 leading-[1.1] tracking-tight"
        />

        {post.subtitle && (
          <OptimizedText
            text={post.subtitle}
            variant="body-serif"
            as="p"
            className="text-xl md:text-2xl text-gray-500 mb-10 leading-relaxed font-light italic"
          />
        )}

        <div className="flex items-center justify-between py-6 border-y border-gray-100">
          <div className="flex items-center gap-4">
            <Link href={`/profile/${post.author.username}`} className="relative w-12 h-12">
              {post.author.avatarUrl ? (
                <div className="relative w-12 h-12 rounded-[4px] overflow-hidden border border-[#EEECEB] shadow-sm">
                  <Image
                    src={post.author.avatarUrl} 
                    alt={post.author.name ?? "Author"} 
                    fill
                    className="object-cover transition-transform hover:scale-105"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-[4px] bg-[#F5EDE4] flex items-center justify-center text-[#D4A373] font-bold border border-[#EEECEB]">
                  {post.author.name?.[0].toUpperCase() ?? "U"}
                </div>
              )}
            </Link>
            <div>
              <div className="flex items-center gap-4 mb-0.5">
                <Link href={`/profile/${post.author.username}`} className="font-bold text-[#1A1A1A] hover:text-[#D4A373] transition-colors block">
                  {post.author.name}
                </Link>
                {currentUserId && currentUserId !== post.author.id && (
                  <FollowButton
                    followingId={post.author.id}
                    initialIsFollowing={isFollowing}
                    variant="outline"
                  />
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Clock className="w-3.5 h-3.5" />
                <span>{post.readTimeMinutes} min read</span>
                <span className="text-gray-300">·</span>
                <span>{formatRelativeTime(post.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2.5 rounded-full hover:bg-gray-50 text-gray-400 hover:text-gray-900 transition-all border border-transparent hover:border-gray-100">
              <Share2 className="w-5 h-5" />
            </button>
            {currentUserId === post.author.id && (
              <PostPageControls 
                postId={post.id}
                status={post.status as "DRAFT" | "PUBLISHED"}
                authorUsername={post.author.username || ""}
              />
            )}
          </div>
        </div>
      </header>

      {/* Featured Image */}
      {post.coverImageUrl && (
        <figure className="mb-16 -mx-4 md:-mx-12 lg:-mx-20 relative aspect-[16/9] rounded-[4px] overflow-hidden shadow-2xl">
          <Image
            src={post.coverImageUrl} 
            alt={post.title} 
            fill
            className="object-cover"
            priority
          />
        </figure>
      )}

      {/* Article Body */}
      <div className="max-w-3xl mx-auto">
        <PostInteractions
          postId={post.id}
          postSlug={post.slug}
          postTitle={post.title}
          initialLikes={post.likeCount}
          initialComments={post.commentCount}
          isLiked={isLiked}
          isSaved={isSaved}
          variant="full"
        />

        <div className="pt-12 pb-20 border-b border-gray-100">
          <TiptapRenderer content={post.bodyText || ""} />
        </div>

        {/* Author Bio Card */}
        <div className="mt-12 py-10 px-8 bg-white border border-[#EEECEB] rounded-[4px] flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left transition-all hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
            <Link href={`/profile/${post.author.username}`} className="shrink-0 relative w-20 h-20">
                {post.author.avatarUrl ? (
                    <div className="relative w-20 h-20 rounded-[4px] overflow-hidden border border-[#EEECEB]">
                        <Image src={post.author.avatarUrl} alt={post.author.name ?? "Author"} fill className="object-cover" />
                    </div>
                ) : (
                    <div className="w-20 h-20 rounded-[4px] bg-[#F5EDE4] flex items-center justify-center text-2xl font-bold text-[#D4A373] border border-[#EEECEB]">
                        {post.author.name?.[0]}
                    </div>
                )}
            </Link>
            <div className="flex-1">
                <span 
                  className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#999999] mb-3 block"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  Published by content creator
                </span>
                <Link 
                  href={`/profile/${post.author.username}`} 
                  className="text-2xl font-bold text-[#1A1A1A] hover:text-[#D4A373] transition-colors mb-3 block"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                    {post.author.name}
                </Link>
                <OptimizedText
                  text={post.author.bio || "A thoughtful writer on Inkwell. Exploring deep ideas and sharing insights."}
                  variant="body-sans"
                  as="p"
                  className="text-[#555555] mb-8 leading-relaxed text-base"
                />
                <div className="flex flex-col sm:flex-row items-center gap-4">
                   <FollowButton
                     followingId={post.author.id}
                     initialIsFollowing={isFollowing}
                     variant="solid"
                   />
                   <Link 
                     href={`/profile/${post.author.username}`} 
                     className="inline-flex items-center justify-center h-10 px-6 rounded-[4px] border border-[#EEECEB] hover:border-[#D4A373] hover:bg-[#FDFCFB] text-[#555555] hover:text-[#D4A373] text-sm font-medium transition-all"
                   >
                    View profile
                   </Link>
                </div>
            </div>
        </div>

        {/* Comment Section Container */}
        <section id="comments" className="py-20">
          <CommentSection
            postId={post.id}
            initialComments={post.Comment as unknown as Comment[]}
            currentUserId={currentUserId}
          />
        </section>
      </div>
    </article>
  );
}
