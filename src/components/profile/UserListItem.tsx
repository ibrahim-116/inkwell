import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import FollowButton from "@/components/post/FollowButton";
import { auth } from "@/auth";
import { OptimizedText } from "@/components/ui/OptimizedText";

interface UserListItemProps {
  user: {
    id: string;
    name: string | null;
    username: string;
    avatarUrl: string | null;
    bio: string | null;
  };
  isFollowing?: boolean;
}

export default async function UserListItem({ user, isFollowing = false }: UserListItemProps) {
  const session = await auth();
  const currentUserId = session?.user?.id;
  const isSelf = currentUserId === user.id;

  return (
    <div className="flex items-center justify-between py-6 border-b border-[#EEECEB] last:border-0 group animate-in fade-in duration-300">
      <div className="flex items-center gap-4">
        <Link href={`/profile/${user.username}`}>
          <Avatar className="w-12 h-12 border border-[#EEECEB] ring-1 ring-white shadow-sm transition-transform group-hover:scale-105">
            <AvatarImage src={user.avatarUrl || ""} />
            <AvatarFallback className="bg-[#F5EDE4] text-[#D4A373] font-bold">
              {user.name?.[0] || user.username[0]}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex flex-col">
          <Link 
            href={`/profile/${user.username}`}
            className="font-bold text-[#1A1A1A] hover:text-[#D4A373] transition-colors"
          >
            <OptimizedText text={user.name || user.username} variant="body-sans" as="span" className="font-bold" />
          </Link>
          <span className="text-xs text-[#999999] font-medium tracking-wide">@{user.username}</span>
          {user.bio && (
            <OptimizedText
              text={user.bio}
              variant="body-sans"
              maxLines={1}
              as="p"
              className="text-sm text-[#555555] mt-1 max-w-sm"
            />
          )}
        </div>
      </div>

      {!isSelf && (
        <FollowButton
          followingId={user.id}
          initialIsFollowing={isFollowing}
          variant="outline"
          className="h-9 px-5 text-xs"
        />
      )}
    </div>
  );
}
