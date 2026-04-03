import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";
import { Eye, MessageCircle, Heart } from "lucide-react";
import { OptimizedText } from "@/components/ui/OptimizedText";
import DeletePostButton from "./DeletePostButton";

interface ProfilePostItemProps {
  post: {
    id: string;
    title: string;
    slug: string;
    createdAt: Date;
    viewCount: number;
    commentCount: number;
    likeCount: number;
    tags: { Topic: { label: string; slug: string } }[];
  };
  showStats?: boolean;
  isSelf?: boolean;
}

export default function ProfilePostItem({ post, showStats = true, isSelf = false }: ProfilePostItemProps) {
  return (
    <div className="group py-8 border-b border-[#EEECEB] last:border-0 hover:bg-[#FDFCFB]/50 transition-colors px-2 -mx-2 rounded-[4px]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            {post.tags[0] && (
              <Link 
                href={`/topic/${post.tags[0].Topic.slug}`}
                className="text-[10px] uppercase tracking-widest font-bold text-[#D4A373] hover:text-[#1A1A1A] transition-colors"
              >
                {post.tags[0].Topic.label}
              </Link>
            )}
            <span className="text-[10px] text-[#999999] uppercase tracking-widest">
              {formatRelativeTime(post.createdAt)}
            </span>
          </div>

          <Link href={`/post/${post.slug}`}>
            <OptimizedText
              text={post.title}
              variant="post-title"
              as="h3"
              className="text-2xl md:text-3xl font-bold text-[#1A1A1A] group-hover:text-[#D4A373] transition-colors leading-tight mb-2"
            />
          </Link>
        </div>

        {showStats && (
          <div className="flex items-center gap-6 text-[#999999]">
            <div className="flex items-center gap-1.5 transition-colors hover:text-[#1A1A1A]">
              <Eye size={16} />
              <span className="text-sm font-medium">{post.viewCount}</span>
            </div>
            <div className="flex items-center gap-1.5 transition-colors hover:text-[#1A1A1A]">
              <Heart size={16} />
              <span className="text-sm font-medium">{post.likeCount}</span>
            </div>
            <div className="flex items-center gap-1.5 transition-colors hover:text-[#1A1A1A]">
              <MessageCircle size={16} />
              <span className="text-sm font-medium">{post.commentCount}</span>
            </div>
          </div>
        )}
        
        {isSelf && (
          <div className="flex items-center">
            <DeletePostButton postId={post.id} />
          </div>
        )}
      </div>
    </div>
  );
}
