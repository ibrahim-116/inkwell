"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart, Bookmark, MessageSquare, Share2 } from "lucide-react";
import { togglePostLike, toggleSavePost } from "@/actions/social.actions";
import { cn } from "@/lib/utils";

interface PostInteractionsProps {
  postId: string;
  postSlug: string;
  postTitle: string;
  initialLikes: number;
  initialComments: number;
  isLiked: boolean;
  isSaved: boolean;
  isAuthenticated?: boolean;
  variant?: "compact" | "full";
}

export default function PostInteractions({
  postId,
  postSlug,
  postTitle,
  initialLikes,
  initialComments,
  isLiked: initialIsLiked,
  isSaved: initialIsSaved,
  isAuthenticated = false,
  variant = "compact",
}: PostInteractionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [optimisticState, setOptimisticState] = useOptimistic(
    { likes: initialLikes, isLiked: initialIsLiked, isSaved: initialIsSaved },
    (state, action: { type: "LIKE" | "SAVE" }) => {
      if (action.type === "LIKE") {
        return {
          ...state,
          likes: state.isLiked ? state.likes - 1 : state.likes + 1,
          isLiked: !state.isLiked,
        };
      }
      if (action.type === "SAVE") {
        return {
          ...state,
          isSaved: !state.isSaved,
        };
      }
      return state;
    }
  );

  const handleLike = async () => {
    if (!isAuthenticated) {
      router.push("/sign-in");
      return;
    }
    startTransition(async () => {
      setOptimisticState({ type: "LIKE" });
      try {
        await togglePostLike(postId);
      } catch (error) {
        console.error("Failed to like post:", error);
      }
    });
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      router.push("/sign-in");
      return;
    }
    startTransition(async () => {
      setOptimisticState({ type: "SAVE" });
      try {
        await toggleSavePost(postId);
      } catch (error) {
        console.error("Failed to save post:", error);
      }
    });
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/post/${postSlug}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: postTitle,
          text: `Check out this story on Inkwell: ${postTitle}`,
          url: shareUrl,
        });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Error sharing:", error);
        }
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert("Link copied to clipboard!"); // Simple fallback since we don't have a toast system yet
      } catch (error) {
        console.error("Failed to copy:", error);
      }
    }
  };

  return (
    <div className={cn(
      "flex items-center justify-between",
      variant === "full" ? "py-4 border-y border-gray-100" : "pt-4"
    )}>
      <div className="flex items-center gap-6">
        {/* Like Button */}
        <button
          onClick={handleLike}
          disabled={isPending}
          className="flex items-center gap-2 group outline-none"
        >
          <div className={cn(
            "p-2 rounded-full transition-colors",
            optimisticState.isLiked 
              ? "bg-rose-50 text-rose-500" 
              : "text-gray-500 group-hover:bg-rose-50 group-hover:text-rose-500"
          )}>
            <Heart
              size={variant === "full" ? 22 : 18}
              fill={optimisticState.isLiked ? "currentColor" : "none"}
              className={cn("transition-transform", !isPending && "group-active:scale-125")}
            />
          </div>
          <span className={cn(
            "text-sm font-medium transition-colors",
            optimisticState.isLiked ? "text-rose-500" : "text-gray-500 group-hover:text-rose-500"
          )}>
            {optimisticState.likes}
          </span>
        </button>

        {/* Comment Button */}
        <div className="flex items-center gap-2 group text-gray-500 hover:text-sky-600 transition-colors pointer-events-none">
          <div className="p-2 rounded-full group-hover:bg-sky-50">
            <MessageSquare size={variant === "full" ? 22 : 18} />
          </div>
          <span className="text-sm font-medium">{initialComments}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={isPending}
          className="group outline-none"
          title="Save for later"
        >
          <div className={cn(
            "p-2 rounded-full transition-colors",
            optimisticState.isSaved 
              ? "bg-amber-50 text-amber-600" 
              : "text-gray-500 group-hover:bg-amber-50 group-hover:text-amber-600"
          )}>
            <Bookmark
              size={variant === "full" ? 22 : 18}
              fill={optimisticState.isSaved ? "currentColor" : "none"}
              className="transition-transform group-active:scale-125"
            />
          </div>
        </button>

        {/* Share Button */}
        <button 
          onClick={handleShare}
          className="group outline-none text-gray-500 hover:text-emerald-600 transition-colors"
          title="Share this story"
        >
          <div className="p-2 rounded-full group-hover:bg-emerald-50">
            <Share2 size={variant === "full" ? 22 : 18} />
          </div>
        </button>
      </div>
    </div>
  );
}
