"use client";

import Link from "next/link";
import { Eye, Heart, MessageSquare, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

interface Post {
  id: string;
  title: string;
  slug: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  publishedAt: Date | null;
}

interface TopStoriesTableProps {
  posts: Post[];
}

export default function TopStoriesTable({ posts }: TopStoriesTableProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/70 backdrop-blur-xl border border-white rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.04)] overflow-hidden"
    >
      <div className="p-8 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-[#1A1A1A]">Most Impactful Content</h3>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mt-1">Stories Resonance Ranking</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#999999]">Story</th>
              <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#999999]">Published</th>
              <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#999999] text-right">Views</th>
              <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#999999] text-right">Likes</th>
              <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-[#999999] text-right">Social</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100/50">
            {posts.map((post, idx) => (
              <tr key={post.id} className="hover:bg-white/50 transition-colors group">
                <td className="px-8 py-6 max-w-[400px]">
                   <div className="flex items-center gap-4">
                     <span className="text-xs font-bold text-[#D4A373] opacity-50">{idx + 1}</span>
                     <Link href={`/post/${post.slug}`} className="font-bold text-[#1A1A1A] group-hover:text-[#D4A373] transition-colors line-clamp-1">
                        {post.title}
                     </Link>
                   </div>
                </td>
                <td className="px-8 py-6 text-sm text-gray-400 font-medium whitespace-nowrap">
                  {post.publishedAt ? format(new Date(post.publishedAt), 'MMM d, yyyy') : 'Draft'}
                </td>
                <td className="px-8 py-6 text-right">
                   <div className="flex items-center justify-end gap-2">
                     <Eye className="w-3.5 h-3.5 text-gray-300" />
                     <span className="text-sm font-bold text-[#1A1A1A] tabular-nums">{post.viewCount.toLocaleString()}</span>
                   </div>
                </td>
                <td className="px-8 py-6 text-right">
                   <div className="flex items-center justify-end gap-2">
                     <Heart className="w-3.5 h-3.5 text-rose-300" />
                     <span className="text-sm font-bold text-[#1A1A1A] tabular-nums">{post.likeCount.toLocaleString()}</span>
                   </div>
                </td>
                <td className="px-8 py-6 text-right">
                   <div className="flex items-center justify-end gap-2">
                     <MessageSquare className="w-3.5 h-3.5 text-sky-300" />
                     <span className="text-sm font-bold text-[#1A1A1A] tabular-nums">{post.commentCount.toLocaleString()}</span>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-6 bg-gray-50/30 flex justify-center">
        <Link 
          href="/dashboard/stories" 
          className="text-[10px] font-bold uppercase tracking-widest text-[#D4A373] hover:text-[#1A1A1A] transition-colors flex items-center gap-2 group"
        >
          Manage All Stories
          <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
}
