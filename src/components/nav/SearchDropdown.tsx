"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, User, FileText, Hash, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { globalSearch } from "@/actions/search.actions";
import Link from "next/link";
import Image from "next/image";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

interface SearchResults {
  posts: Array<{ id: string; title: string; slug: string; author: { name: string; username: string } }>;
  users: Array<{ id: string; name: string; username: string; avatarUrl: string | null }>;
  topics: Array<{ id: string; label: string; slug: string }>;
}

export default function SearchDropdown() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResults>({
    posts: [],
    users: [],
    topics: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch results when query changes
  useEffect(() => {
    let isMounted = true;

    if (debouncedQuery.length >= 2) {
      setIsLoading(true);
      globalSearch(debouncedQuery).then((data) => {
        if (isMounted) {
          setResults(data as SearchResults);
          setIsLoading(false);
        }
      });
    } else {
      setResults({ posts: [], users: [], topics: [] });
    }

    return () => {
      isMounted = false;
    };
  }, [debouncedQuery]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalResults = results.posts.length + results.users.length + results.topics.length;
  const showResults = isOpen && (debouncedQuery.length >= 2 || totalResults > 0);

  return (
    <div className="relative flex-1 max-w-sm" ref={containerRef}>
      <div className="relative group">
        <Search 
          className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors",
            isOpen ? "text-[#D4A373]" : "text-gray-400 group-hover:text-gray-600"
          )} 
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search Inkwell..."
          className="input pl-10 pr-12 h-10 text-sm bg-[#F5EDE4]/30 border-transparent focus:bg-white focus:border-[#D4A373]/30 transition-all placeholder:text-gray-400"
          style={{ fontFamily: "var(--font-sans)" }}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 text-gray-400 animate-spin" />
          ) : query ? (
            <button onClick={() => setQuery("")}>
              <X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-gray-200 bg-white px-1.5 font-mono text-[10px] font-medium text-gray-400 opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#EEECEB] rounded-xl shadow-2xl overflow-hidden z-[100] max-h-[480px] flex flex-col"
          >
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              {isLoading && totalResults === 0 ? (
                <div className="p-8 text-center">
                  <Loader2 className="w-6 h-6 text-[#D4A373] animate-spin mx-auto mb-2" />
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Searching the library...</p>
                </div>
              ) : totalResults === 0 ? (
                <div className="p-8 text-center">
                  <Search className="w-6 h-6 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400 italic">No matches found for &quot;{debouncedQuery}&quot;</p>
                </div>
              ) : (
                <>
                  {/* Posts Section */}
                  {results.posts.length > 0 && (
                    <div className="p-2">
                       <CategoryHeader icon={<FileText size={12}/>} title="Articles" />
                       {results.posts.map((post) => (
                         <ResultItem 
                           key={post.id} 
                           href={`/post/${post.slug}`} 
                           title={post.title} 
                           subtitle={`by ${post.author.name}`}
                           onClick={() => setIsOpen(false)}
                         />
                       ))}
                    </div>
                  )}

                  {/* Users Section */}
                  {results.users.length > 0 && (
                    <div className="p-2 border-t border-[#EEECEB]/50">
                       <CategoryHeader icon={<User size={12}/>} title="Authors" />
                       {results.users.map((user) => (
                         <ResultItem 
                           key={user.id} 
                           href={`/profile/${user.username}`} 
                           title={user.name} 
                           subtitle={`@${user.username}`}
                           image={user.avatarUrl}
                           onClick={() => setIsOpen(false)}
                         />
                       ))}
                    </div>
                  )}

                  {/* Topics Section */}
                  {results.topics.length > 0 && (
                    <div className="p-2 border-t border-[#EEECEB]/50">
                       <CategoryHeader icon={<Hash size={12}/>} title="Topics" />
                       {results.topics.map((topic) => (
                         <ResultItem 
                           key={topic.id} 
                           href={`/topic/${topic.slug}`} 
                           title={topic.label} 
                           onClick={() => setIsOpen(false)}
                         />
                       ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {totalResults > 0 && (
               <Link 
                 href={`/search?q=${encodeURIComponent(query)}`}
                 className="p-3 bg-[#FDFCFB] border-t border-[#EEECEB] text-center text-[10px] font-bold text-[#D4A373] hover:text-[#BC8A5F] transition-colors uppercase tracking-widest"
                 onClick={() => setIsOpen(false)}
               >
                 View all results
               </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CategoryHeader({ icon, title }: { icon: React.ReactNode, title: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 text-[10px] uppercase tracking-[0.2em] font-bold text-[#999999] bg-[#FDFCFB]">
      {icon}
      {title}
    </div>
  );
}

function ResultItem({ 
  href, 
  title, 
  subtitle, 
  image, 
  onClick 
}: { 
  href: string, 
  title: string, 
  subtitle?: string, 
  image?: string | null,
  onClick: () => void 
}) {
  return (
    <Link 
      href={href} 
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#F5EDE4]/30 transition-colors group"
      onClick={onClick}
    >
      {image ? (
        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-100 shrink-0">
          <Image 
            src={image} 
            alt={title} 
            fill 
            className="object-cover" 
          />
        </div>
      ) : (
        <div className="w-8 h-8 rounded-lg bg-[#EEECEB] flex items-center justify-center text-gray-400 group-hover:bg-[#D4A373]/10 group-hover:text-[#D4A373] transition-colors">
          <Search size={14} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#1A1A1A] truncate group-hover:text-[#D4A373] transition-colors" style={{ fontFamily: "var(--font-serif)" }}>{title}</p>
        {subtitle && <p className="text-[10px] text-gray-400 truncate uppercase tracking-wider">{subtitle}</p>}
      </div>
    </Link>
  );
}
