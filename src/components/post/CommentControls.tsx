"use client";

import { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Pencil, Trash2, Flag, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { deleteComment, reportComment } from "@/actions/social.actions";

interface CommentControlsProps {
  commentId: string;
  isAuthor: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export default function CommentControls({ 
  commentId, 
  isAuthor, 
  onEdit, 
  onDelete 
}: CommentControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this response?")) {
      try {
        await deleteComment(commentId);
        onDelete();
      } catch (error) {
        console.error("Failed to delete comment:", error);
      }
    }
    setIsOpen(false);
  };

  const handleReport = async () => {
    const reason = prompt("Why are you reporting this response? (Spam, Harassment, etc.)");
    if (reason) {
      try {
        await reportComment(commentId, reason.toUpperCase());
        alert("Thank you for your report. We will review it shortly.");
      } catch (error) {
        console.error("Failed to report comment:", error);
      }
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-400 hover:text-[#1A1A1A] p-1.5 hover:bg-gray-100 rounded-full transition-all"
      >
        <MoreHorizontal size={18} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-20 animate-in fade-in slide-in-from-top-1">
          {isAuthor ? (
            <>
              <button
                onClick={() => { onEdit(); setIsOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Pencil size={14} />
                Edit Response
              </button>
              <button
                onClick={handleDelete}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <Trash2 size={14} />
                Delete Response
              </button>
            </>
          ) : (
            <button
              onClick={handleReport}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Flag size={14} />
              Report Response
            </button>
          )}
        </div>
      )}
    </div>
  );
}
