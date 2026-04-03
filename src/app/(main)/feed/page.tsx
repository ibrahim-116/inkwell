import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { TrendingUp, Sparkles, Clock, Users, LogIn } from "lucide-react";
import Link from "next/link";
import InfinitePostList from "@/components/feed/InfinitePostList";
import ContinueReading from "@/components/feed/ContinueReading";
import { PostWithAuthorAndTags } from "@/lib/types";

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string; sort?: string }>;
}) {
  const session = await auth();
  const userId = session?.user?.id ?? null;

  const { topic, sort } = await searchParams;

  // Auth-required: "following" sort — redirect unauthenticated users
  if (sort === "following" && !userId) {
    // show a guest-friendly message instead of hard redirect
  }

  // Fetch user data only if authenticated
  let userTopics: string[] = [];
  let continueReadingPosts: { id: string; title: string; slug: string; coverImageUrl: string | null; scrollDepth: number; author: { name: string | null } }[] = [];
  let userTopicAffinities: { topicId: string; Topic: { id: string; label: string; slug: string } }[] = [];

  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { onboardingCompleted: true, topicAffinities: { include: { Topic: true } } },
    });

    if (user && !user.onboardingCompleted) {
      redirect("/onboarding");
    }

    userTopics = user?.topicAffinities.map((a: { topicId: string }) => a.topicId) ?? [];
    userTopicAffinities = user?.topicAffinities ?? [];

    // "Continue Reading" shelf
    const ongoingEngagements = await prisma.postEngagement.findMany({
      where: {
        userId,
        scrollDepth: { gt: 0.05, lt: 0.95 },
      },
      include: {
        Post: {
          include: {
            author: { select: { name: true } },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 3,
    });

    continueReadingPosts = ongoingEngagements.map((e) => ({
      id: e.Post.id,
      title: e.Post.title,
      slug: e.Post.slug,
      coverImageUrl: e.Post.coverImageUrl,
      scrollDepth: e.scrollDepth,
      author: e.Post.author,
    }));
  }

  // Fetch posts (public)
  const posts = await prisma.post.findMany({
    where: {
      status: "PUBLISHED",
      ...(sort === "following" && userId
        ? { author: { followers: { some: { followerId: userId } } } }
        : topic
          ? { tags: { some: { Topic: { slug: topic } } } }
          : userTopics.length > 0
            ? { tags: { some: { topicId: { in: userTopics } } } }
            : {}
      ),
    },
    include: {
      author: {
        select: { name: true, username: true, avatarUrl: true, bio: true },
      },
      tags: {
        include: { Topic: true },
      },
    },
    orderBy: sort === "recent" || sort === "following"
      ? [{ publishedAt: "desc" }, { id: "desc" }]
      : [{ viewCount: "desc" }, { id: "desc" }],
    take: 10,
  });

  const initialCursor = posts.length === 10 ? posts[posts.length - 1].id : null;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Continue Reading Shelf — auth only */}
      {userId && !topic && <ContinueReading posts={continueReadingPosts} />}

      {/* Feed Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-serif)" }}>
            {topic ? `Topic: ${topic}` : sort === "following" ? "Following" : userId ? "Your Feed" : "Explore"}
          </h1>
          <p className="text-gray-500 text-sm">
            {topic
              ? "Exploring the latest in this category."
              : sort === "following"
                ? "The latest stories from writers you follow."
                : userId
                  ? "Articles curated based on your unique interests."
                  : "Discover long-form writing from curious minds worldwide."}
          </p>
        </div>

        <div className="flex items-center bg-white rounded-full p-1 border border-gray-200 shadow-sm">
          <Link
            href="/feed?sort=personalized"
            className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              sort !== "recent" && sort !== "following" ? "bg-gray-900 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            For You
          </Link>
          <Link
            href={userId ? "/feed?sort=following" : "/sign-in"}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              sort === "following" ? "bg-gray-900 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Following
          </Link>
          <Link
            href="/feed?sort=recent"
            className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              sort === "recent" ? "bg-gray-900 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Recent
          </Link>
        </div>
      </div>

      {/* Topic Pills */}
      <div className="flex items-center gap-3 mb-10 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider shrink-0">Topics:</span>
        <Link
          href="/feed"
          className={`tag px-3 py-1.5 text-xs ${!topic && sort !== "following" ? "bg-gray-900 text-white border-transparent" : ""}`}
        >
          All
        </Link>
        {userTopicAffinities.length > 0 && Array.from(
          new Map(userTopicAffinities.map((a) => [a.Topic.id, a])).values()
        ).map((affinity) => (
          <Link
            key={affinity.Topic.id}
            href={`/feed?topic=${affinity.Topic.slug}`}
            className={`tag px-3 py-1.5 text-xs whitespace-nowrap ${
              topic === affinity.Topic.slug ? "bg-gray-900 text-white border-transparent" : ""
            }`}
          >
            {affinity.Topic.label}
          </Link>
        ))}
        <Link href="/topics" className="text-xs text-amber-700 font-semibold hover:underline bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100 shrink-0">
          Explore More +
        </Link>
      </div>

      {/* Feed Content */}
      <div>
        {posts.length > 0 ? (
          <InfinitePostList
            initialPosts={JSON.parse(JSON.stringify(posts)) as PostWithAuthorAndTags[]}
            initialCursor={initialCursor}
            topic={topic}
            sort={sort}
            userTopics={userTopics}
            isAuthenticated={!!userId}
          />
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: "var(--font-serif)" }}>
              No matches found yet
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-6">
              Looks like there aren&apos;t any articles in this category yet. Why not be the first to share one?
            </p>
            {userId ? (
              <Link href="/post/new" className="btn btn-primary publish-btn">
                Write the first story
              </Link>
            ) : (
              <Link href="/sign-up" className="btn btn-primary publish-btn gap-2">
                <LogIn className="w-4 h-4" />
                Join to write the first story
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
