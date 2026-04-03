"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Editor from "@/components/editor/Editor";
import { PenLine, ImageIcon, ChevronLeft, Globe, Lock, Save, Rocket, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { UploadButton } from "@/lib/uploadthing";
import Image from "next/image";

const TOPICS = [
  { id: "cmngfcwky0000w1e494x72u5e", slug: "technology", label: "Technology" },
  { id: "cmngfcwky0001w1e4qckuzy4g", slug: "science", label: "Science" },
  { id: "cmngfcwkz0002w1e4ew4em3sy", slug: "philosophy", label: "Philosophy" },
  { id: "cmngfcwkz0003w1e4bw344qww", slug: "politics", label: "Politics" },
  { id: "cmngfcwl10005w1e4i30az0fd", slug: "finance", label: "Finance" },
  { id: "cmngfcwl5000dw1e42wf3pigg", slug: "art", label: "Art" },
  { id: "cmngfcwl6000ew1e4rxaqa271", slug: "travel", label: "Travel" },
];

interface PostEditorProps {
  initialData?: {
    id: string;
    title: string;
    subtitle?: string;
    bodyJson: unknown;
    tags: { topicId: string }[];
    coverImageUrl: string | null;
  }
}

export default function PostEditor({ initialData }: PostEditorProps) {
  const router = useRouter();
  const [postId, setPostId] = useState<string | null>(initialData?.id || null);
  const [title, setTitle] = useState(initialData?.title || "");
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || "");
  const [content, setContent] = useState<unknown>(initialData?.bodyJson || null);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(
    initialData?.tags.map(t => t.topicId) || []
  );
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(initialData?.coverImageUrl || null);
  
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(initialData ? new Date() : null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const debouncedTitle = useDebounce(title, 2000);
  const debouncedSubtitle = useDebounce(subtitle, 2000);
  const debouncedContent = useDebounce(content, 2000);
  const debouncedTopics = useDebounce(selectedTopics, 2000);
  const debouncedCoverImage = useDebounce(coverImageUrl, 2000);

  const toggleTopic = (id: string) => {
    setSelectedTopics(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleSave = useCallback(async (finalStatus: "DRAFT" | "PUBLISHED", isAutoSave = false) => {
    // Only save if we have at least a title
    if (!title.trim() && !content) return;

    if (!isAutoSave) setIsPublishing(true);
    else setIsSaving(true);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: postId,
          title,
          subtitle,
          content,
          topics: selectedTopics,
          coverImageUrl,
          status: finalStatus,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setPostId(data.id);
        setLastSaved(new Date());
        
        if (!isAutoSave) {
          router.push(finalStatus === "PUBLISHED" ? `/post/${data.slug}` : "/drafts");
          router.refresh();
        }
      }
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
       if (!isAutoSave) setIsPublishing(false);
       setIsSaving(false);
    }
  }, [postId, title, subtitle, content, selectedTopics, coverImageUrl, router]);

  // Auto-save effect
  useEffect(() => {
    // Only auto-save if we have something to save
    const hasChanges = debouncedTitle || debouncedContent || debouncedSubtitle || (debouncedTopics.length > 0) || debouncedCoverImage;
    
    if (hasChanges) {
       // Avoid double saving immediately on mount if initialData exists AND we haven't saved yet
       // This prevents an unnecessary save on first load
       if (initialData && !lastSaved) {
         setLastSaved(new Date()); // Mark as "saved" initially
         return;
       }
       handleSave("DRAFT", true);
    }
  }, [debouncedTitle, debouncedSubtitle, debouncedContent, debouncedTopics, debouncedCoverImage, handleSave, initialData]);

  return (
    <div className="min-h-screen pb-40">
      {/* Editor Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b mb-12">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/feed" className="btn btn-ghost btn-sm p-2 hover:bg-gray-100 rounded-full">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-500">{initialData ? "Editing" : "Draft in"}</span>
              <span className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <PenLine className="w-3.5 h-3.5 text-amber-600" />
                Personal Writing
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Status</span>
              <div className="flex items-center gap-1.5">
                {isSaving ? (
                  <>
                    <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                    <span className="text-xs font-medium text-amber-700">Saving...</span>
                  </>
                ) : lastSaved ? (
                  <>
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    <span className="text-xs font-medium text-green-700">Saved at {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </>
                ) : (
                  <span className="text-xs font-medium text-gray-400 italic">Not saved yet</span>
                )}
              </div>
            </div>

            <div className="divider-v w-px h-8 bg-gray-100 hidden sm:block" />

            <div className="flex items-center gap-3">
              <button 
                onClick={() => handleSave("DRAFT")}
                disabled={isPublishing || isSaving}
                className="btn btn-ghost btn-sm gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save draft</span>
              </button>
              <button 
                onClick={() => handleSave("PUBLISHED")}
                disabled={isPublishing || !title || !content}
                className="btn btn-primary btn-sm gap-2 publish-btn"
              >
                <Rocket className="w-4 h-4" />
                <span>{isPublishing ? "Publishing..." : "Publish now"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6">
        {/* Title Group */}
        <div className="mb-12">
          <textarea
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent border-none focus:ring-0 p-0 text-5xl md:text-6xl font-bold placeholder:text-gray-300 resize-none min-h-[80px]"
            style={{ fontFamily: "var(--font-serif)", color: "var(--color-ink)", lineHeight: 1.1 }}
          />
          <textarea
            placeholder="Subtitle (optional)"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="w-full bg-transparent border-none focus:ring-0 p-0 text-xl font-medium placeholder:text-gray-300 resize-none min-h-[40px] mt-4"
            style={{ fontFamily: "var(--font-sans)", color: "var(--color-graphite)", lineHeight: 1.5 }}
          />
        </div>

        {/* Feature Image Upload */}
        <div className="mb-12">
          {uploadError && (
             <div className="mb-4 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-between text-rose-800 text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
                   <X className="w-4 h-4 text-rose-600" />
                 </div>
                 <span>{uploadError}</span>
               </div>
               <button 
                 onClick={() => setUploadError(null)}
                 className="text-rose-600 hover:text-rose-800 font-bold px-3 py-1 bg-white rounded-lg shadow-sm"
               >
                 Dismiss
               </button>
             </div>
          )}

          {coverImageUrl ? (
            <div className="relative group w-full aspect-[21/9] rounded-xl overflow-hidden shadow-lg border">
              <Image 
                src={coverImageUrl} 
                alt="Featured Image" 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-700" 
                unoptimized // Use unoptimized if uploadthing URLs are tricky with next/image optimization sometimes
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                <button 
                  onClick={() => setCoverImageUrl(null)}
                  className="bg-white/90 hover:bg-white text-rose-600 font-bold px-6 py-2 rounded-full shadow-xl flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all"
                >
                  <X className="w-4 h-4" />
                  Remove Image
                </button>
              </div>
            </div>
          ) : (
             <div className="w-full aspect-[21/9] bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-4 text-gray-400 hover:bg-gray-100 hover:border-gray-300 transition-all group p-8">
                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <ImageIcon className="w-7 h-7 text-gray-300" />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-sm font-bold text-gray-600">Featured Media</span>
                  <span className="text-xs font-medium text-gray-400">Add a stunning cover to your story (Max 4MB)</span>
                </div>
                <UploadButton
                  endpoint="imageUploader"
                  onClientUploadComplete={(res) => {
                    if (res?.[0]) {
                      setCoverImageUrl(res[0].url);
                      setUploadError(null);
                    }
                  }}
                  onUploadError={(error: Error) => {
                    console.error("Upload Error:", error);
                    setUploadError(error.message.includes("limit") ? "Image is too large. Max size is 4MB." : "Failed to upload image. Please try again.");
                  }}
                  appearance={{
                    button: "publish-btn h-10 px-6 font-bold text-sm bg-gray-900 cursor-pointer",
                    allowedContent: "hidden"
                  }}
                />
             </div>
          )}
        </div>

        {/* Tiptap Editor */}
        <Editor 
          initialContent={initialData?.bodyJson}
          onChange={setContent} 
          placeholder="Write your masterpiece..."
        />

        {/* AI Assist Floating Bar (Premium UX touch) */}
        <div className="mt-12 p-1 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl overflow-hidden shadow-lg shadow-amber-200/50 group">
           <div className="bg-white rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-amber-100 rounded-lg">
                    <Sparkles className="w-4 h-4 text-amber-700" />
                 </div>
                 <div>
                    <h4 className="text-sm font-bold text-gray-900">AI Writing Assistant</h4>
                    <p className="text-xs text-gray-500 font-medium">Need help with a title or transition?</p>
                 </div>
              </div>
              <button className="btn btn-sm btn-ghost hover:bg-amber-50 text-amber-700 font-bold">
                 Try AI Polish
              </button>
           </div>
        </div>

        {/* Topic Selection */}
        <div className="mt-20 pt-12 border-t border-gray-100">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Visibility & Topics
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Tag your post with up to 5 topics to help people discover it.
          </p>
          <div className="flex flex-wrap gap-2">
            {TOPICS.map((topic) => (
              <button
                key={topic.slug}
                onClick={() => toggleTopic(topic.id)}
                className={cn(
                   "tag px-4 py-2",
                   selectedTopics.includes(topic.id) && "active bg-gray-900 text-white border-gray-900"
                )}
              >
                {topic.label}
              </button>
            ))}
          </div>
          
          <div className="mt-12 p-6 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-4">
             <div className="p-2 bg-amber-100 rounded-lg">
                <Lock className="w-5 h-5 text-amber-700" />
             </div>
             <div>
                <h4 className="font-bold text-amber-900 mb-1">Writer Trust System</h4>
                <p className="text-sm text-amber-800 leading-relaxed">
                   Inkwell automatically secures your drafts in the cloud. Your content is never shared or indexed until you explicitly hit Publish.
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
