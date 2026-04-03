"use client";

import Link from "next/link";
import Image from "next/image";
import { OptimizedText } from "@/components/ui/OptimizedText";
import { Clock } from "lucide-react";

interface EngagementPost {
  id: string;
  title: string;
  slug: string;
  coverImageUrl?: string | null;
  scrollDepth: number;
  author: {
    name: string | null;
  };
}

export default function ContinueReading({ posts }: { posts: EngagementPost[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#D4A373]">
          Jump Back In
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/post/${post.slug}`}
            className="group block relative bg-white border border-[#EEECEB] rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
          >
            <div className="flex p-4 gap-4 h-32">
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                    {post.author.name}
                  </p>
                  <OptimizedText
                    text={post.title}
                    variant="body-sans"
                    className="text-sm font-bold line-clamp-2 group-hover:text-[#D4A373] transition-colors"
                  />
                </div>
                
                <div className="mt-2">
                  <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
                    <span>{Math.round(post.scrollDepth * 100)}% read</span>
                    <Clock size={10} />
                  </div>
                  <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#D4A373] transition-all duration-500"
                      style={{ width: `${post.scrollDepth * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {post.coverImageUrl && (
                <div className="relative w-20 h-24 rounded-lg overflow-hidden shrink-0">
                  <Image
                    src={post.coverImageUrl}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
