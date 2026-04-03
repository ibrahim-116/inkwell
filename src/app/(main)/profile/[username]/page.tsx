import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Settings, BarChart3, MapPin, Globe, Calendar, PenTool, Bookmark, UserPlus, Users } from "lucide-react";
import FollowButton from "@/components/post/FollowButton";
import ProfilePostItem from "@/components/profile/ProfilePostItem";
import UserListItem from "@/components/profile/UserListItem";
import { cn } from "@/lib/utils";
import AuthorAnalytics from "@/components/analytics/AuthorAnalytics";
import { OptimizedText } from "@/components/ui/OptimizedText";
import type { Metadata, ResolvingMetadata } from "next";

export async function generateMetadata(
  { params }: { params: Promise<{ username: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { username } = await params;
  
  const user = await prisma.user.findUnique({
    where: { username },
    select: { name: true, username: true, bio: true, avatarUrl: true }
  });

  if (!user) {
    return {
      title: "Profile Not Found",
    };
  }

  const name = user.name || user.username;

  return {
    title: name,
    description: user.bio || `Read stories from ${name} on Inkwell.`,
    openGraph: {
      type: "profile",
      title: `${name} | Inkwell`,
      description: user.bio || `Read stories from ${name} on Inkwell.`,
      url: `https://inkwell.vercel.app/profile/${user.username}`,
      images: user.avatarUrl ? [user.avatarUrl] : [],
    },
    twitter: {
      card: "summary",
      title: `${name} | Inkwell`,
      description: user.bio || `Read stories from ${name} on Inkwell.`,
      images: user.avatarUrl ? [user.avatarUrl] : [],
    },
  };
}

export default async function ProfilePage({ 
  params,
  searchParams,
}: { 
  params: Promise<{ username: string }>,
  searchParams: Promise<{ tab?: string }>
}) {
  const { username } = await params;
  const { tab = "published" } = await searchParams;
  const session = await auth();
  const currentUserId = session?.user?.id;
  
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
        }
      }
    }
  });

  if (!user) notFound();

  const isSelf = session?.user?.id === user.id;

  // Calculate total views
  const viewsAggregate = await prisma.post.aggregate({
    _sum: { viewCount: true },
    where: { 
      authorId: user.id,
      status: isSelf ? undefined : "PUBLISHED"
    }
  });
  const totalViews = viewsAggregate._sum.viewCount || 0;

  // Fetch posts
  const posts = await prisma.post.findMany({
    where: { 
      authorId: user.id,
      status: isSelf ? { in: ["PUBLISHED", "DRAFT"] } : "PUBLISHED"
    },
    include: {
      tags: { include: { Topic: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  // Follow check
  let isFollowing = false;
  if (currentUserId && currentUserId !== user.id) {
    const follow = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: currentUserId, followingId: user.id } }
    });
    isFollowing = !!follow;
  }

  let followersList: { id: string; name: string | null; username: string; avatarUrl: string | null; bio: string | null; isFollowing: boolean }[] = [];
  let followingList: { id: string; name: string | null; username: string; avatarUrl: string | null; bio: string | null; isFollowing: boolean }[] = [];
  
  if (tab === "followers") {
    const followers = await prisma.follow.findMany({
      where: { followingId: user.id },
      include: {
        User_Follow_followerIdToUser: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
            bio: true,
          }
        }
      }
    });
    
    // Check if current user follows these followers
    const userFollows = currentUserId ? await prisma.follow.findMany({
      where: { 
        followerId: currentUserId,
        followingId: { in: followers.map(f => f.followerId) }
      },
      select: { followingId: true }
    }) : [];
    const followSet = new Set(userFollows.map(f => f.followingId));
    
    followersList = followers.map(f => ({
      ...f.User_Follow_followerIdToUser,
      isFollowing: followSet.has(f.followerId)
    }));
  }

  if (tab === "following") {
    const following = await prisma.follow.findMany({
      where: { followerId: user.id },
      include: {
        User_Follow_followingIdToUser: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
            bio: true,
          }
        }
      }
    });

    // Check if current user follows these people
    const userFollows = currentUserId ? await prisma.follow.findMany({
      where: { 
        followerId: currentUserId,
        followingId: { in: following.map(f => f.followingId) }
      },
      select: { followingId: true }
    }) : [];
    const followSet = new Set(userFollows.map(f => f.followingId));

    followingList = following.map(f => ({
      ...f.User_Follow_followingIdToUser,
      isFollowing: followSet.has(f.followingId)
    }));
  }

  // Fetch saved posts if self
  let savedPosts: any[] = [];
  if (isSelf && tab === "saved") {
    const saved = await prisma.savedPost.findMany({
      where: { userId: user.id },
      include: {
        Post: {
          include: {
            tags: { include: { Topic: true } },
            author: { select: { name: true, username: true, avatarUrl: true } },
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    savedPosts = saved.map((s) => ({
      ...s.Post,
      commentCount: s.Post.commentCount,
      likeCount: s.Post.likeCount,
      viewCount: s.Post.viewCount || 0
    }));
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      {/* Magazine Header */}
      <div className="border-b border-[#EEECEB] bg-white">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
          <div className="flex flex-col md:flex-row gap-12 items-center md:items-start text-center md:text-left">
            <div className="relative w-32 h-32 md:w-40 md:h-40 shrink-0">
              {user.avatarUrl ? (
                <div className="relative w-full h-full rounded-[4px] overflow-hidden border border-[#EEECEB] shadow-sm">
                  <Image src={user.avatarUrl} alt={user.name ?? "User"} fill className="object-cover" />
                </div>
              ) : (
                <div className="w-full h-full rounded-[4px] bg-[#F5EDE4] flex items-center justify-center text-4xl font-bold text-[#D4A373] border border-[#EEECEB]">
                  {user.name?.[0] ?? user.username[0]}
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                <div>
                  <OptimizedText
                    text={user.name || user.username}
                    variant="h1"
                    as="h1"
                    className="text-4xl md:text-6xl font-bold text-[#1A1A1A] mb-2 leading-none"
                  />
                  <p className="text-lg text-[#999999] font-medium tracking-wide">
                    @{user.username}
                  </p>
                </div>

                <div className="flex items-center gap-3 justify-center md:justify-start">
                  {isSelf ? (
                    <>
                      <Link 
                        href="/settings" 
                        className="inline-flex items-center justify-center h-10 px-6 rounded-[4px] border border-[#EEECEB] hover:border-[#1A1A1A] text-[#1A1A1A] text-sm font-semibold transition-all"
                      >
                        Edit Profile
                      </Link>
                      <Link 
                        href="/settings" 
                        className="flex items-center justify-center w-10 h-10 rounded-[4px] border border-[#EEECEB] hover:bg-[#FDFCFB] text-[#555555] transition-all"
                      >
                        <Settings size={20} />
                      </Link>
                    </>
                  ) : (
                    <FollowButton
                      followingId={user.id}
                      initialIsFollowing={isFollowing}
                      variant="solid"
                      className="h-10 px-8"
                    />
                  )}
                </div>
              </div>

              <OptimizedText
                text={user.bio || "Crafting thoughts and exploring perspectives on Inkwell."}
                variant="body-sans"
                as="p"
                className="text-xl text-[#555555] max-w-2xl leading-relaxed mb-8 mx-auto md:mx-0"
              />

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-8 gap-y-4 text-sm text-[#999999] font-medium">
                {user.location && (
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-[#D4A373]" />
                    <span>{user.location}</span>
                  </div>
                )}
                {user.website && (
                  <div className="flex items-center gap-2">
                    <Globe size={16} className="text-[#D4A373]" />
                    <a href={user.website} target="_blank" rel="noopener noreferrer" className="hover:text-[#1A1A1A] transition-colors">{user.website.replace(/^https?:\/\//, '')}</a>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-[#D4A373]" />
                  <span>Joined {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-[#FDFCFB] border-b border-[#EEECEB] sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center gap-12 h-16 overflow-x-auto no-scrollbar">
            <Link href={`/profile/${username}?tab=published`} className="flex flex-col group cursor-pointer">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#999999] mb-0.5 group-hover:text-[#1A1A1A] transition-colors">Posts</span>
              <span className="text-lg font-bold text-[#1A1A1A]">{user._count.posts}</span>
            </Link>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#999999] mb-0.5">Total Views</span>
              <OptimizedText
                text={totalViews.toLocaleString()}
                variant="h2"
                as="span"
                className="text-lg font-bold text-[#1A1A1A]"
              />
            </div>
            <Link href={`/profile/${username}?tab=followers`} className="flex flex-col cursor-pointer group">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#999999] mb-0.5 group-hover:text-[#D4A373] transition-colors">Followers</span>
              <span className="text-lg font-bold text-[#1A1A1A]">{user._count.followers}</span>
            </Link>
            <Link href={`/profile/${username}?tab=following`} className="flex flex-col cursor-pointer group">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#999999] mb-0.5 group-hover:text-[#D4A373] transition-colors">Following</span>
              <span className="text-lg font-bold text-[#1A1A1A]">{user._count.following}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-8 border-b border-[#EEECEB] mb-8 overflow-x-auto no-scrollbar">
            <Link 
              href={`/profile/${username}?tab=published`}
              className={cn(
                "pb-4 text-sm font-bold tracking-widest uppercase flex items-center gap-2 transition-all border-b-2 shrink-0",
                tab === "published" ? "text-[#1A1A1A] border-[#1A1A1A]" : "text-[#999999] border-transparent hover:text-[#1A1A1A]"
              )}
            >
              <PenTool size={16} />
              Published
            </Link>
            {isSelf && (
              <Link 
                href={`/profile/${username}?tab=saved`}
                className={cn(
                  "pb-4 text-sm font-bold tracking-widest uppercase flex items-center gap-2 transition-all border-b-2 shrink-0",
                  tab === "saved" ? "text-[#1A1A1A] border-[#1A1A1A]" : "text-[#999999] border-transparent hover:text-[#1A1A1A]"
                )}
              >
                <Bookmark size={16} />
                Saved Posts
              </Link>
            )}
             <Link 
              href={`/profile/${username}?tab=followers`}
              className={cn(
                "pb-4 text-sm font-bold tracking-widest uppercase flex items-center gap-2 transition-all border-b-2 shrink-0",
                tab === "followers" ? "text-[#1A1A1A] border-[#1A1A1A]" : "text-[#999999] border-transparent hover:text-[#1A1A1A]"
              )}
            >
              <UserPlus size={16} />
              Followers
            </Link>
            <Link 
              href={`/profile/${username}?tab=following`}
              className={cn(
                "pb-4 text-sm font-bold tracking-widest uppercase flex items-center gap-2 transition-all border-b-2 shrink-0",
                tab === "following" ? "text-[#1A1A1A] border-[#1A1A1A]" : "text-[#999999] border-transparent hover:text-[#1A1A1A]"
              )}
            >
              <Users size={16} />
              Following
            </Link>
            {isSelf && (
              <Link 
                href={`/profile/${username}?tab=analytics`}
                className={cn(
                  "pb-4 text-sm font-bold tracking-widest uppercase flex items-center gap-2 transition-all border-b-2 shrink-0",
                  tab === "analytics" ? "text-[#1A1A1A] border-[#1A1A1A]" : "text-[#999999] border-transparent hover:text-[#1A1A1A]"
                )}
              >
                <BarChart3 size={16} />
                Analytics
              </Link>
            )}
          </div>

          <div className="max-w-3xl">
            {tab === "published" && (
              posts.length > 0 ? (
                posts.map((post: any) => (
                  <ProfilePostItem key={post.id} post={post} isSelf={isSelf} />
                ))
              ) : (
                <div className="py-20 text-center border-2 border-dashed border-[#EEECEB] rounded-[4px]">
                  <p className="text-[#999999] italic font-serif text-xl">No chapters inked here yet.</p>
                </div>
              )
            )}
            
            {tab === "saved" && isSelf && (
              savedPosts.length > 0 ? (
                savedPosts.map((post: any) => (
                  <ProfilePostItem key={post.id} post={post} isSelf={false} />
                ))
              ) : (
                <div className="py-20 text-center border-2 border-dashed border-[#EEECEB] rounded-[4px]">
                  <p className="text-[#999999] italic font-serif text-xl">No saved artifacts found.</p>
                </div>
              )
            )}

            {tab === "followers" && (
              followersList.length > 0 ? (
                <div className="divide-y divide-[#EEECEB]">
                  {followersList.map((u) => (
                    <UserListItem key={u.id} user={u} isFollowing={u.isFollowing} />
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center border-2 border-dashed border-[#EEECEB] rounded-[4px]">
                  <p className="text-[#999999] italic font-serif text-xl">No patrons following yet.</p>
                </div>
              )
            )}

            {tab === "following" && (
              followingList.length > 0 ? (
                <div className="divide-y divide-[#EEECEB]">
                  {followingList.map((u) => (
                    <UserListItem key={u.id} user={u} isFollowing={u.isFollowing} />
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center border-2 border-dashed border-[#EEECEB] rounded-[4px]">
                  <p className="text-[#999999] italic font-serif text-xl">Not following any contributors yet.</p>
                </div>
              )
            )}

            {tab === "analytics" && isSelf && (
              <AuthorAnalytics />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

