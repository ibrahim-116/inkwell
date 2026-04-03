"use client";

import { Trash2 } from "lucide-react";
import { deletePost } from "@/actions/post.actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeletePostButton({ postId }: { postId: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post? This cannot be undone.")) return;
    
    setIsDeleting(true);
    try {
      await deletePost(postId);
      // Refresh the page to reflect the deleted post
      router.refresh();
    } catch (error) {
      console.error("Failed to delete post:", error);
      alert("Failed to delete post. Please try again.");
      setIsDeleting(false);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-1.5 text-[#999999] hover:text-red-500 hover:bg-red-50 rounded-[4px] transition-all disabled:opacity-50 ml-2"
      title="Delete post"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
