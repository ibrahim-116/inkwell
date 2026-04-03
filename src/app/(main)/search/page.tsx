import { Metadata } from "next";
import { globalSearch } from "@/actions/search.actions";
import { Search, FileText, User as UserIcon, Hash } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import PostCard from "@/components/feed/PostCard";
import { prisma } from "@/lib/prisma";
import { OptimizedText } from "@/components/ui/OptimizedText";

interface SearchPost {
  id: string;
  title: string;
  slug: string;
  author: { name: string | null; username: string; avatarUrl: string | null };
  tags?: { topic: { label: string; slug: string } }[];
  _count?: { likes: number; comments: number };
}

interface SearchUser {
  id: string;
  name: string | null;
  username: string;
  avatarUrl: string | null;
  bio?: string | null;
}

interface SearchTopic {
  id: string;
  label: string;
  slug: string;
}

interface SearchResults {
  posts: SearchPost[];
  users: SearchUser[];
  topics: SearchTopic[];
}

interface SearchPageProps {
  searchParams: Promise<{ q?: string; tab?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Search results for "${q}" | Inkwell` : "Search | Inkwell",
    description: `Find articles, authors, and topics on Inkwell.`,
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, tab = "all" } = await searchParams;

  if (!q) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-[#F5EDE4] rounded-full flex items-center justify-center mx-auto mb-6">
          <Search className="w-10 h-10 text-[#D4A373]" />
        </div>
        <h1 className="text-3xl font-bold mb-4" style={{ fontFamily: "var(--font-serif)" }}>Seek and you shall find</h1>
        <p className="text-gray-500 max-w-md mx-auto">
          Search for your favorite writers, deep-dive articles, or niche topics in the Inkwell library.
        </p>
      </div>
    );
  }

  // Use the search action for initial results
  const results = await globalSearch(q);

  let fullResults: any = results;
  
  if (tab === "articles") {
    const posts = await prisma.post.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { subtitle: { contains: q, mode: "insensitive" } },
        ],
      },
      include: {
        author: { select: { name: true, username: true, avatarUrl: true, bio: true } },
        tags: { include: { Topic: true } },
        _count: { select: { Reaction: true, Comment: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    fullResults = { ...results, posts: posts as any };
  } else if (tab === "people") {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { username: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 20,
    });
    fullResults = { ...results, users };
  } else if (tab === "topics") {
    const topics = await prisma.topic.findMany({
      where: {
        label: { contains: q, mode: "insensitive" },
      },
      take: 50,
    });
    fullResults = { ...results, topics };
  }

  const tabs = [
    { id: "all", label: "All Results", icon: <Search size={14}/> },
    { id: "articles", label: "Articles", icon: <FileText size={14}/> },
    { id: "people", label: "People", icon: <UserIcon size={14}/> },
    { id: "topics", label: "Topics", icon: <Hash size={14}/> },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <header className="mb-12">
        <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#D4A373] mb-2">Search Results</p>
        <OptimizedText
          text={`“${q}”`}
          variant="h1"
          as="h1"
          className="text-4xl font-bold text-[#1A1A1A]"
        />
      </header>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-8 border-b border-[#EEECEB] overflow-x-auto pb-px scrollbar-hide">
        {tabs.map((t) => {
          const isActive = tab === t.id;
          return (
            <Link
              key={t.id}
              href={`/search?q=${encodeURIComponent(q)}&tab=${t.id}`}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all whitespace-nowrap border-b-2 ${
                isActive 
                ? "border-[#D4A373] text-[#1A1A1A]" 
                : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200"
              }`}
            >
              {t.icon}
              {t.label}
            </Link>
          );
        })}
      </div>

      <div className="space-y-12">
        {/* All Results View */}
        {tab === "all" && (
          <>
            {results.posts.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <OptimizedText text="Articles" variant="h2" as="h2" className="text-lg font-bold" />
                  <Link href={`/search?q=${q}&tab=articles`} className="text-[10px] font-bold text-[#D4A373] uppercase tracking-widest hover:underline">View all</Link>
                </div>
                <div className="grid gap-6">
                  {results.posts.map((post) => (
                    <Link key={post.id} href={`/post/${post.slug}`} className="group block p-4 rounded-2xl border border-transparent hover:border-[#EEECEB] hover:bg-white transition-all">
                      <OptimizedText
                        text={post.title}
                        variant="post-title"
                        as="h3"
                        className="font-bold text-lg group-hover:text-[#D4A373] transition-colors"
                      />
                      <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">by {post.author.name}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {results.users.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <OptimizedText text="People" variant="h2" as="h2" className="text-lg font-bold" />
                  <Link href={`/search?q=${q}&tab=people`} className="text-[10px] font-bold text-[#D4A373] uppercase tracking-widest hover:underline">View all</Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {results.users.map((user) => (
                    <UserResultCard key={user.id} user={user} />
                  ))}
                </div>
              </section>
            )}

            {results.topics.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <OptimizedText text="Topics" variant="h2" as="h2" className="text-lg font-bold" />
                  <Link href={`/search?q=${q}&tab=topics`} className="text-[10px] font-bold text-[#D4A373] uppercase tracking-widest hover:underline">View all</Link>
                </div>
                <div className="flex flex-wrap gap-2">
                  {results.topics.map((topic) => (
                    <Link 
                      key={topic.id} 
                      href={`/topic/${topic.slug}`}
                      className="px-4 py-2 rounded-full border border-[#EEECEB] bg-white text-xs font-medium hover:border-[#D4A373] hover:text-[#D4A373] transition-all"
                    >
                      # {topic.label}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {results.posts.length === 0 && results.users.length === 0 && results.topics.length === 0 && (
              <div className="py-20 text-center">
                <p className="text-gray-400 italic">No matches found in the library.</p>
              </div>
            )}
          </>
        )}

        {/* Tab-specific Views */}
         {tab === "articles" && (
          <div className="grid gap-8">
            {fullResults.posts?.map((post: any) => (
              <PostCard key={post.id} post={post as any} />
            ))}
          </div>
        )}

         {tab === "people" && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {fullResults.users?.map((user: any) => (
              <UserResultCard key={user.id} user={user} />
            ))}
          </div>
        )}

         {tab === "topics" && (
          <div className="flex flex-wrap gap-3">
            {fullResults.topics?.map((topic: any) => (
              <Link 
                key={topic.id} 
                href={`/topic/${topic.slug}`}
                className="px-6 py-3 rounded-full border border-[#EEECEB] bg-white text-sm font-bold hover:border-[#D4A373] hover:text-[#D4A373] transition-all shadow-sm flex items-center gap-2"
              >
                <Hash size={14} className="text-gray-300" />
                {topic.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function UserResultCard({ user }: { user: SearchUser }) {
  return (
    <Link 
      href={`/profile/${user.username}`}
      className="flex items-center gap-4 p-4 rounded-2xl border border-[#EEECEB] bg-[#FDFAF7]/50 hover:bg-white hover:shadow-lg hover:border-transparent transition-all group"
    >
      <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm ring-1 ring-gray-100">
        {user.avatarUrl ? (
          <Image src={user.avatarUrl} alt={user.name!} fill className="object-cover" />
        ) : (
          <div className="w-full h-full bg-[#F5EDE4] flex items-center justify-center text-[#D4A373] font-bold">
            {user.name?.[0]}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <OptimizedText
          text={user.name || user.username}
          variant="body-sans"
          as="p"
          className="font-bold text-[#1A1A1A] truncate group-hover:text-[#D4A373] transition-colors"
        />
        <p className="text-[10px] text-gray-500 uppercase tracking-widest">@{user.username}</p>
      </div>
    </Link>
  );
}
