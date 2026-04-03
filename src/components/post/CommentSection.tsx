"use client";

import { useState, useTransition } from "react";
import { addComment, updateComment } from "@/actions/social.actions";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send, Reply, Heart, CornerDownRight, X, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import CommentControls from "./CommentControls";
import { OptimizedText } from "@/components/ui/OptimizedText";

export interface Comment {
  id: string;
  bodyText: string;
  authorId: string;
  author: {
    name: string | null;
    username: string;
    avatarUrl: string | null;
  };
  createdAt: Date | string;
  likeCount?: number;
  other_Comments?: Comment[];
}

interface CommentSectionProps {
  postId: string;
  initialComments: Comment[];
  currentUserId?: string;
}

export default function CommentSection({
  postId,
  initialComments,
  currentUserId,
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [isPending, startTransition] = useTransition();
  const [commentText, setCommentText] = useState("");
  const [replyToId, setReplyToId] = useState<string | null>(null);

  const handleSubmit = async (text: string, parentId?: string) => {
    if (!text.trim()) return;

    startTransition(async () => {
      try {
        const newComment = await addComment({
          postId,
          bodyText: text,
          parentCommentId: parentId,
        });

        if (parentId) {
          // Add to nested replies
          const updateCommentsFlat = (items: Comment[]): Comment[] => {
            return items.map((c) => {
              if (c.id === parentId) {
                return {
                  ...c,
                  other_Comments: [newComment as unknown as Comment, ...(c.other_Comments || [])],
                };
              }
              if (c.other_Comments) {
                return {
                  ...c,
                  other_Comments: updateCommentsFlat(c.other_Comments),
                };
              }
              return c;
            });
          };
          setComments(updateCommentsFlat(comments));
          setReplyToId(null);
        } else {
          setComments([newComment as unknown as Comment, ...comments]);
          setCommentText("");
        }
      } catch (error) {
        console.error("Failed to add comment:", error);
      }
    });
  };

  const handleDeleteLocal = (id: string) => {
    const filterComments = (items: Comment[]): Comment[] => {
      return items
        .filter((c) => c.id !== id)
        .map((c) => ({
          ...c,
          other_Comments: c.other_Comments ? filterComments(c.other_Comments) : [],
        }));
    };
    setComments(filterComments(comments));
  };

  const handleUpdateLocal = (id: string, newText: string) => {
    const updateCommentsGlobal = (items: Comment[]): Comment[] => {
      return items.map((c) => {
        if (c.id === id) return { ...c, bodyText: newText };
        if (c.other_Comments) return { ...c, other_Comments: updateCommentsGlobal(c.other_Comments) };
        return c;
      });
    };
    setComments(updateCommentsGlobal(comments));
  };

  return (
    <div className="space-y-10 pt-12 border-t border-gray-100 mt-12 bg-transparent">
      <div className="flex items-center gap-3">
        <MessageSquare className="text-[#D4A373]" size={24} />
        <OptimizedText
          text={`Responses (${comments.length})`}
          variant="h3"
          as="h3"
          className="text-2xl font-bold text-[#1A1A1A]"
        />
      </div>

      {/* New Comment Input */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm ring-1 ring-black/[0.02] space-y-4 transition-all focus-within:ring-sky-100/50">
        <Textarea
          placeholder="What are your thoughts?"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="bg-transparent border-none focus-visible:ring-0 text-[#1A1A1A] placeholder:text-gray-400 resize-none min-h-[120px] text-lg leading-relaxed p-0 scrollbar-hide"
        />
        <div className="flex justify-end pt-2 border-t border-gray-50">
          <Button
            onClick={() => handleSubmit(commentText)}
            disabled={isPending || !commentText.trim()}
            className="bg-[#1A1A1A] text-white hover:bg-[#333333] rounded-full px-8 h-11 font-medium transition-all shadow-md active:scale-95"
          >
            {isPending ? "Publishing..." : "Publish Response"}
            <Send size={16} className="ml-2" />
          </Button>
        </div>
      </div>

      {/* Comment List */}
      <div className="space-y-10">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem 
              key={comment.id} 
              comment={comment} 
              currentUserId={currentUserId}
              replyToId={replyToId}
              setReplyToId={setReplyToId}
              onSubmitReply={handleSubmit}
              onDelete={handleDeleteLocal}
              onUpdate={handleUpdateLocal}
              isPending={isPending}
            />
          ))
        ) : (
          <div className="text-center py-16 border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/30">
            <p className="text-gray-400 font-medium">No responses yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CommentItem({ 
  comment, 
  depth = 0, 
  currentUserId,
  replyToId,
  setReplyToId,
  onSubmitReply,
  onDelete,
  onUpdate,
  isPending
}: { 
  comment: Comment; 
  depth?: number;
  currentUserId?: string;
  replyToId: string | null;
  setReplyToId: (id: string | null) => void;
  onSubmitReply: (text: string, parentId: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, text: string) => void;
  isPending: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.bodyText);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  const isAuthor = currentUserId === comment.authorId;
  const isReplying = replyToId === comment.id;

  const handleUpdate = async () => {
    if (!editText.trim() || editText === comment.bodyText) {
      setIsEditing(false);
      return;
    }
    
    setIsSubmittingEdit(true);
    try {
      await updateComment(comment.id, editText);
      onUpdate(comment.id, editText);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update comment:", error);
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  return (
    <div className={cn("space-y-6", depth > 0 && "ml-8 border-l-2 border-gray-100 pl-8 pt-2")}>
      <div className="flex items-start gap-5">
        <Avatar className="w-11 h-11 border-2 border-white shadow-sm ring-1 ring-gray-100 shrink-0">
          <AvatarImage src={comment.author.avatarUrl || ""} />
          <AvatarFallback className="bg-gray-100 text-gray-500 font-bold">
            {comment.author.name?.[0] || comment.author.username[0]}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-2 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-bold text-[#1A1A1A] truncate">
                {comment.author.name}
              </span>
              <span className="text-gray-500 text-xs font-medium">
                @{comment.author.username}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-400 text-xs font-medium bg-gray-50 px-2 py-1 rounded-md hidden sm:block">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
              <CommentControls 
                commentId={comment.id}
                isAuthor={isAuthor}
                onEdit={() => setIsEditing(true)}
                onDelete={() => onDelete(comment.id)}
              />
            </div>
          </div>
          
          {isEditing ? (
            <div className="space-y-3 mt-2">
              <Textarea 
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="min-h-[100px] border-gray-200 focus:border-sky-200 focus:ring-sky-100/50 rounded-xl"
              />
              <div className="flex items-center gap-2 justify-end">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setIsEditing(false)}
                  className="rounded-full px-4 h-9"
                >
                  <X size={14} className="mr-2" />
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleUpdate}
                  disabled={isSubmittingEdit || !editText.trim()}
                  className="bg-[#1A1A1A] text-white hover:bg-[#333333] rounded-full px-6 h-9 font-medium"
                >
                  {isSubmittingEdit ? "Saving..." : "Save Changes"}
                  <Check size={14} className="ml-2" />
                </Button>
              </div>
            </div>
          ) : (
            <OptimizedText
              text={comment.bodyText}
              variant="comment"
              maxLines={5}
              showReadMore
              as="p"
              className="text-[#1A1A1A] py-1 break-words whitespace-pre-wrap"
            />
          )}
          
          <div className="flex items-center gap-6 pt-2">
            <button 
              onClick={() => setReplyToId(isReplying ? null : comment.id)}
              className={cn(
                "text-sm flex items-center gap-1.5 transition-colors font-medium rounded-full px-3 py-1 -ml-3 group",
                isReplying ? "text-sky-600 bg-sky-50" : "text-gray-500 hover:text-[#1A1A1A] hover:bg-gray-100"
              )}
            >
              <Reply size={15} />
              {isReplying ? "Cancel" : "Reply"}
            </button>
            <button className="text-gray-500 hover:text-rose-600 text-sm flex items-center gap-1.5 transition-colors font-medium group px-3 py-1 rounded-full hover:bg-rose-50 -ml-2">
              <Heart size={15} className="group-hover:fill-rose-600 transition-all" />
              {comment.likeCount || 0}
            </button>
          </div>

          {/* Reply Input */}
          {isReplying && (
            <div className="mt-4 pl-4 border-l-2 border-sky-100 space-y-4 animate-in slide-in-from-left-2 duration-200">
              <div className="flex items-center gap-2 text-xs font-semibold text-sky-500 uppercase tracking-wider">
                <CornerDownRight size={14} />
                Replying to {comment.author.name}
              </div>
              <div className="bg-white border-2 border-sky-50 rounded-2xl p-4 shadow-sm space-y-3">
                <Textarea
                  placeholder="Inscribe your reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="bg-transparent border-none focus-visible:ring-0 text-[#1A1A1A] placeholder:text-gray-400 resize-none min-h-[80px] p-0"
                />
                <div className="flex justify-end pt-2 border-t border-sky-50">
                  <Button
                    onClick={() => {
                      onSubmitReply(replyText, comment.id);
                      setReplyText("");
                    }}
                    disabled={isPending || !replyText.trim()}
                    size="sm"
                    className="bg-sky-600 text-white hover:bg-sky-700 rounded-full px-6 h-9 font-medium transition-all"
                  >
                    {isPending ? "Sending..." : "Reply"}
                    <Send size={14} className="ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Recursive replies (if any) */}
      {comment.other_Comments?.map((reply: Comment) => (
        <CommentItem 
          key={reply.id} 
          comment={reply} 
          depth={depth + 1} 
          currentUserId={currentUserId}
          replyToId={replyToId}
          setReplyToId={setReplyToId}
          onSubmitReply={onSubmitReply}
          onDelete={onDelete}
          onUpdate={onUpdate}
          isPending={isPending}
        />
      ))}
    </div>
  );
}

