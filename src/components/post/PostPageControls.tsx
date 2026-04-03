"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  MoreHorizontal, 
  Edit3, 
  Trash2, 
  FileText, 
  Globe, 
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { deletePost, togglePostStatus } from "@/actions/post.actions";
import ConfirmModal from "@/components/ui/ConfirmModal";

interface PostPageControlsProps {
  postId: string;
  status: "DRAFT" | "PUBLISHED";
  authorUsername: string;
}

export default function PostPageControls({
  postId,
  status,
  authorUsername,
}: PostPageControlsProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deletePost(postId);
      if (res.success) {
        // Redirect to profile as requested: "where user can see what they posted"
        router.push(`/profile/${authorUsername}`);
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to delete post:", error);
      setIsDeleting(false);
      setIsConfirmOpen(false);
    }
  };

  const handleToggleStatus = async () => {
    setIsToggling(true);
    try {
      const res = await togglePostStatus(postId, status);
      if (res.success) {
        setIsOpen(false);
        // If we unpublished it, it's no longer visible at this slug for others,
        // so redirecting to the edit page or drafts might be better.
        // But for now, let's just refresh to see the status change if author is still there.
        if (res.newStatus === "DRAFT") {
            router.push(`/post/edit/${postId}`);
        } else {
            router.refresh();
        }
      }
    } catch (error) {
      console.error("Failed to toggle status:", error);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "p-2.5 rounded-full transition-all border",
          isOpen 
            ? "bg-gray-900 border-gray-900 text-white shadow-lg" 
            : "bg-white border-gray-100 text-gray-400 hover:text-gray-900 hover:border-gray-200"
        )}
      >
        <MoreHorizontal className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for closing */}
            <div 
              className="fixed inset-0 z-30" 
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10, x: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10, x: -10 }}
              className="absolute right-0 mt-3 w-64 bg-white rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden z-40"
            >
              <div className="p-2">
                <button
                  onClick={() => router.push(`/post/edit/${postId}`)}
                  className="w-full flex items-center justify-between p-4 rounded-[1rem] hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-50 rounded-lg group-hover:bg-amber-100 transition-colors">
                      <Edit3 className="w-4 h-4 text-amber-600" />
                    </div>
                    <span className="text-sm font-bold text-gray-700 underline-offset-4 group-hover:underline">Edit Story</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition-colors" />
                </button>

                <button
                  onClick={handleToggleStatus}
                  disabled={isToggling}
                  className="w-full flex items-center justify-between p-4 rounded-[1rem] hover:bg-gray-50 transition-colors group disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-sky-50 rounded-lg group-hover:bg-sky-100 transition-colors">
                      {status === "PUBLISHED" ? (
                        <FileText className="w-4 h-4 text-sky-600" />
                      ) : (
                        <Globe className="w-4 h-4 text-emerald-600" />
                      )}
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="text-sm font-bold text-gray-700 underline-offset-4 group-hover:underline">
                          {status === "PUBLISHED" ? "Move to Drafts" : "Publish Now"}
                        </span>
                        {isToggling && <span className="text-[10px] text-sky-500 font-bold uppercase animate-pulse">Processing...</span>}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition-colors" />
                </button>

                <div className="my-1 border-t border-gray-50" />

                <button
                  onClick={() => setIsConfirmOpen(true)}
                  className="w-full flex items-center justify-between p-4 rounded-[1rem] hover:bg-rose-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-50 rounded-lg group-hover:bg-rose-100 transition-colors">
                      <Trash2 className="w-4 h-4 text-rose-600" />
                    </div>
                    <span className="text-sm font-bold text-rose-600 underline-offset-4 group-hover:underline">Delete Story</span>
                  </div>
                </button>
              </div>
              
              <div className="bg-gray-50 p-4">
                 <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                    Changes to visibility take effect immediately across the Inkwell network.
                 </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete this story?"
        description="This action is permanent and will remove all comments and reactions associated with this post."
        confirmText="Delete permanently"
        variant="danger"
      />
    </div>
  );
}
