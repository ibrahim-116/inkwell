import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ProfilePostItem from "@/components/profile/ProfilePostItem";
import { Bookmark, PenLine } from "lucide-react";
import Link from "next/link";

export default async function BookmarksPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const savedPosts = await prisma.savedPost.findMany({
    where: { userId: session.user.id },
    include: {
      Post: {
        include: {
          tags: { include: { Topic: true } },
          _count: { select: { Comment: true, Reaction: true } }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const posts = savedPosts.map((s) => ({
    ...s.Post,
    commentCount: s.Post._count.Comment,
    likeCount: s.Post._count.Reaction,
  }));

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        <header className="mb-12 border-b border-[#EEECEB] pb-8">
          <div className="flex items-center gap-3 mb-4">
            <Bookmark className="text-[#D4A373]" size={32} />
            <h1 
              className="text-4xl md:text-5xl font-bold text-[#1A1A1A]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Saved Artifacts
            </h1>
          </div>
          <p className="text-xl text-[#555555] max-w-2xl leading-relaxed font-light italic">
            A curated collection of thoughts and inspirations you've preserved.
          </p>
        </header>

        <div className="max-w-3xl">
          {posts.length > 0 ? (
            <div className="space-y-2">
              {posts.map((post: any) => (
                <ProfilePostItem key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="py-32 text-center border-2 border-dashed border-[#EEECEB] rounded-[4px] bg-white/50">
              <Bookmark className="mx-auto text-[#EEECEB] mb-6" size={64} />
              <p className="text-[#999999] italic font-serif text-2xl mb-8">Your archives are empty.</p>
              <Link 
                href="/feed" 
                className="inline-flex items-center gap-2 text-[#D4A373] hover:text-[#1A1A1A] font-bold tracking-widest uppercase text-xs transition-all"
              >
                <PenLine size={16} />
                Discover stories to save
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
