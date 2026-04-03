"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PenSquare, Clock, ArrowRight, Trash2, FileText, ChevronRight } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface DraftPost {
  id: string;
  title: string;
  subtitle: string;
  updatedAt: string;
  slug: string;
}

export default function DraftsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [drafts, setDrafts] = useState<DraftPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDrafts = useCallback(async () => {
    try {
      const res = await fetch(`/api/posts?status=DRAFT&authorId=${session?.user?.id}`);
      if (res.ok) {
        const data = await res.json();
        setDrafts(data);
      }
    } catch (error) {
      console.error("Failed to fetch drafts:", error);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (sessionStatus === "authenticated") {
      fetchDrafts();
    }
  }, [sessionStatus, router, fetchDrafts]);

  const deleteDraft = async (id: string) => {
    if (!confirm("Are you sure you want to delete this draft? This cannot be undone.")) return;
    
    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDrafts(prev => prev.filter(d => d.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete draft:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 animate-pulse">
        <div className="h-10 w-48 bg-gray-100 rounded-lg mb-8" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-50 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-amber-50 rounded-lg">
            <PenSquare className="w-5 h-5 text-amber-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900" style={{ fontFamily: "var(--font-serif)" }}>
            Drafts
          </h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">
          Your un-published masterpieces. We&apos;ve saved every word. Pick up where you left off.
        </p>
      </header>

      {drafts.length === 0 ? (
        <div className="text-center py-24 bg-gray-50/50 rounded-[2rem] border border-dashed border-gray-200">
           <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
           <h3 className="text-xl font-bold text-gray-900 mb-2">No drafts found</h3>
           <p className="text-gray-500 mb-8 max-w-xs mx-auto">
             Whenever you stop typing, we&apos;ll save your work here.
           </p>
           <Link href="/post/new" className="btn btn-primary inline-flex gap-2">
             <PenSquare className="w-4 h-4" />
             Start writing
           </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {drafts.map((draft) => (
            <div 
              key={draft.id}
              className="group relative bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
                    Edited {formatDistanceToNow(new Date(draft.updatedAt))} ago
                  </span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-amber-600 transition-colors">
                  {draft.title || "Untitled Draft"}
                </h2>
                {draft.subtitle && (
                   <p className="text-sm text-gray-500 line-clamp-1 italic">
                     {draft.subtitle}
                   </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                 <button 
                   onClick={() => deleteDraft(draft.id)}
                   className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                   title="Delete draft"
                 >
                   <Trash2 className="w-5 h-5" />
                 </button>
                 <Link 
                   href={`/post/edit/${draft.id}`}
                   className="btn btn-primary btn-sm gap-2 rounded-xl h-12 px-6"
                 >
                   <span>Continue writing</span>
                   <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                 </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <footer className="mt-20 pt-12 border-t border-gray-100 flex items-center justify-between">
         <p className="text-sm text-gray-400 italic">
           All drafts are stored securely and visible only to you.
         </p>
         <Link href="/feed" className="text-sm font-bold flex items-center gap-2 text-gray-900 hover:gap-3 transition-all">
           Back to feed
           <ArrowRight className="w-4 h-4" />
         </Link>
      </footer>
    </div>
  );
}
