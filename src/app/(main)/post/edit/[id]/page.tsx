"use client";

import { useEffect, useState } from "react";
import PostEditor from "@/components/editor/PostEditor";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const [initialData, setInitialData] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/posts/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setInitialData(data);
        } else {
          setError("Failed to load draft. It might have been deleted or published.");
        }
      } catch (err) {
        console.error("Draft load error:", err);
        setError("An error occurred while loading the draft.");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
       fetchPost();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
           <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
           <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Restoring your draft...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
        <p className="text-gray-600 mb-8 max-w-md">{error}</p>
        <button onClick={() => router.push("/drafts")} className="btn btn-primary">
          Back to drafts
        </button>
      </div>
    );
  }

  return <PostEditor initialData={initialData as any} />;
}
