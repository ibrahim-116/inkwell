"use client";

import { useOptimistic, useTransition } from "react";
import { UserPlus, UserCheck } from "lucide-react";
import { toggleFollow } from "@/actions/social.actions";
import { cn } from "@/lib/utils";

interface FollowButtonProps {
  followingId: string;
  initialIsFollowing: boolean;
  className?: string;
  variant?: "solid" | "outline" | "ghost";
}

export default function FollowButton({
  followingId,
  initialIsFollowing,
  className,
  variant = "solid",
}: FollowButtonProps) {
  const [isPending, startTransition] = useTransition();

  const [optimisticIsFollowing, setOptimisticIsFollowing] = useOptimistic(
    initialIsFollowing,
    (state, newState: boolean) => newState
  );

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    startTransition(async () => {
      const nextState = !optimisticIsFollowing;
      setOptimisticIsFollowing(nextState);
      try {
        await toggleFollow(followingId);
      } catch (error) {
        console.error("Failed to toggle follow:", error);
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={cn(
        "relative flex items-center justify-center gap-2 font-medium transition-all duration-300 disabled:opacity-50 h-9 px-4",
        variant === "solid" && (
          optimisticIsFollowing
            ? "bg-[#EEECEB] hover:bg-[#E0DEDC] text-[#1A1A1A] border border-[#EEECEB]"
            : "bg-[#1A1A1A] text-[#FDFCFB] hover:bg-[#2D2D2D]"
        ),
        variant === "outline" && (
          optimisticIsFollowing
            ? "border border-[#D4A373] bg-[#F5EDE4] text-[#D4A373]"
            : "border border-[#EEECEB] hover:border-[#D4A373] text-[#555555] hover:text-[#D4A373]"
        ),
        "rounded-full",
        className
      )}
    >
      {optimisticIsFollowing ? (
        <>
          <UserCheck size={16} />
          <span>Following</span>
        </>
      ) : (
        <>
          <UserPlus size={16} />
          <span>Follow</span>
        </>
      )}
    </button>
  );
}
