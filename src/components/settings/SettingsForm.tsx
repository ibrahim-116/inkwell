"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { 
  User, MapPin, Link2, Check, AlertCircle, Camera, Loader2, Sparkles, AtSign, Eye, EyeOff, Globe, Map
} from "lucide-react";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UploadButton } from "@/lib/uploadthing";
import { updateUserSettings } from "@/actions/user.actions";
import { cn } from "@/lib/utils";

// Dynamically import LocationPicker to avoid SSR issues with Leaflet
const LocationPicker = dynamic(() => import("./LocationPicker"), { 
  ssr: false,
  loading: () => <div className="h-[300px] bg-vellum rounded-lg flex items-center justify-center border border-border">
    <Loader2 className="w-8 h-8 animate-spin text-quill" />
  </div>
});

interface Topic {
  id: string;
  slug: string;
  label: string;
}

interface UserSettingsFormProps {
  user: any;
  allTopics: Topic[];
}

export default function SettingsForm({ user, allTopics }: UserSettingsFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: user.name || "",
    username: user.username || "",
    bio: user.bio || "",
    location: user.location || "",
    website: user.website || "",
    avatarUrl: user.avatarUrl || null,
    latitude: user.latitude || null,
    longitude: user.longitude || null,
    showLocation: user.showLocation ?? true,
    interests: user.interests?.map((i: any) => i.topicId) || [],
  });

  const toggleInterest = (topicId: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(topicId)
        ? prev.interests.filter((id: string) => id !== topicId)
        : [...prev.interests, topicId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    startTransition(async () => {
      try {
        const result = await updateUserSettings(formData);
        if (result.success) {
          setMessage({ type: "success", text: "Settings updated successfully!" });
          router.refresh();
        }
      } catch (error: any) {
        setMessage({ type: "error", text: error.message || "Failed to update settings" });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-12 pb-24 px-4 pt-6">
      {/* Sticky Premium Header */}
      <div className="sticky top-0 z-30 bg-[var(--color-vellum)]/90 backdrop-blur-xl py-6 -mx-4 px-4 flex items-center justify-between border-b border-[var(--color-border)]">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[var(--color-ink)] tracking-tight">Settings</h1>
          <p className="text-sm text-[var(--color-graphite)] font-sans">Manage your digital heritage on Inkwell</p>
        </div>
        <Button 
          type="submit" 
          disabled={isPending}
          className="bg-[var(--color-ink)] hover:bg-black text-[var(--color-vellum)] px-8 h-12 rounded-full font-sans font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-lg"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Preserving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>

      {message && (
        <div className={cn(
          "p-5 rounded-lg flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-500 shadow-sm border",
          message.type === "success" 
            ? "bg-green-50 text-green-800 border-green-200" 
            : "bg-red-50 text-red-800 border-red-200"
        )}>
          {message.type === "success" ? <Check className="w-6 h-6 shrink-0" /> : <AlertCircle className="w-6 h-6 shrink-0" />}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      {/* Identity & Heritage Section */}
      <section className="bg-[var(--color-paper)] rounded-xl p-8 border border-[var(--color-border)] shadow-[var(--shadow-card)] space-y-10">
        <div className="flex items-center gap-4 border-b border-[var(--color-border)] pb-6">
          <div className="p-3 bg-[var(--color-quill-light)] rounded-full outline outline-1 outline-[var(--color-quill)]/20">
            <User className="w-6 h-6 text-[var(--color-quill)]" />
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold text-[var(--color-ink)]">Public Identity</h2>
            <p className="text-sm text-[var(--color-graphite)] font-sans">Manage your scholarly profile for the archives.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-12 items-start">
          {/* Avatar Curation */}
          <div className="flex flex-col items-center gap-6 shrink-0 group">
            <div className="relative">
              <div className="absolute -inset-1.5 bg-[var(--color-quill)] rounded-full blur-md opacity-0 group-hover:opacity-20 transition-opacity" />
              <Avatar className="w-40 h-40 border-8 border-[var(--color-vellum)] shadow-2xl relative z-10 transition-transform group-hover:scale-[1.02]">
                <AvatarImage src={formData.avatarUrl || ""} className="object-cover" />
                <AvatarFallback className="bg-[var(--color-quill-light)] text-[var(--color-quill)] text-4xl font-serif font-bold">
                  {formData.name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-2 right-2 z-20">
                <div className="bg-[var(--color-ink)] p-2.5 rounded-full shadow-lg border border-[var(--color-border)]">
                  <Camera className="w-5 h-5 text-[var(--color-vellum)]" />
                </div>
              </div>
            </div>
            <UploadButton
              endpoint="imageUploader"
              onClientUploadComplete={(res) => {
                if (res?.[0]) {
                  setFormData(prev => ({ ...prev, avatarUrl: res[0].url }));
                  setMessage({ type: "success", text: "Avatar uploaded! Be sure to save changes." });
                }
              }}
              onUploadError={(error: Error) => {
                setMessage({ type: "error", text: `Archive error: ${error.message}` });
              }}
              appearance={{
                button: "bg-transparent hover:bg-[var(--color-quill-light)] text-[var(--color-quill)] text-xs font-semibold h-10 px-6 rounded-full border border-[var(--color-quill)]/20 transition-all uppercase tracking-widest",
                allowedContent: "hidden",
              }}
              content={{
                button: "Revise Portrait"
              }}
            />
          </div>

          {/* Identity Scribings */}
          <div className="flex-1 space-y-8 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-widest text-[var(--color-graphite-light)]">Display Name</Label>
                <Input 
                  id="name" 
                  value={formData.name} 
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder="Your full name"
                  className="h-12 border-[var(--color-border)] focus:border-[var(--color-quill)] focus:ring-1 focus:ring-[var(--color-quill)]/20 text-lg font-serif"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="username" className="text-xs font-semibold uppercase tracking-widest text-[var(--color-graphite-light)]">Username</Label>
                <div className="relative">
                  <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-quill)]" />
                  <Input 
                    id="username" 
                    value={formData.username} 
                    onChange={e => setFormData(p => ({ ...p, username: e.target.value }))}
                    className="pl-11 h-12 border-[var(--color-border)] focus:border-[var(--color-quill)] focus:ring-1 focus:ring-[var(--color-quill)]/20 font-mono"
                    placeholder="username"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="bio" className="text-xs font-semibold uppercase tracking-widest text-[var(--color-graphite-light)]">Biographical Sketch</Label>
              <Textarea 
                id="bio"
                value={formData.bio || ""} 
                onChange={e => setFormData(p => ({ ...p, bio: e.target.value }))}
                placeholder="Compose a brief introduction..."
                className="resize-none h-32 border-[var(--color-border)] focus:border-[var(--color-quill)] focus:ring-1 focus:ring-[var(--color-quill)]/20 font-serif text-lg p-4"
                maxLength={200}
              />
              <div className="flex justify-end">
                <span className="text-[10px] font-mono p-1 px-2 bg-vellum border border-border rounded text-[var(--color-graphite-light)]">
                  {formData.bio?.length || 0}/200
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cartographic & Social Details */}
      <section className="bg-[var(--color-paper)] rounded-xl p-8 border border-[var(--color-border)] shadow-[var(--shadow-card)] space-y-10">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[var(--color-quill-light)] rounded-full outline outline-1 outline-[var(--color-quill)]/20">
              <Globe className="w-6 h-6 text-[var(--color-quill)]" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold text-[var(--color-ink)]">Cartography & Ties</h2>
              <p className="text-sm text-[var(--color-graphite)] font-sans">Locate your presence and point to your works.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-vellum border border-border rounded-full hover:border-quill transition-colors cursor-pointer group"
               onClick={() => setFormData(p => ({ ...p, showLocation: !p.showLocation }))}>
            {formData.showLocation ? (
              <Eye className="w-4 h-4 text-quill" />
            ) : (
              <EyeOff className="w-4 h-4 text-graphite-light" />
            )}
            <span className={cn(
              "text-xs font-bold uppercase tracking-tighter transition-colors",
              formData.showLocation ? "text-ink" : "text-graphite-light"
            )}>
              {formData.showLocation ? "Public" : "Private"}
            </span>
          </div>
        </div>

        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="location" className="text-xs font-semibold uppercase tracking-widest text-[var(--color-graphite-light)]">Display Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-quill)]" />
                  <Input 
                    id="location" 
                    value={formData.location || ""} 
                    onChange={e => setFormData(p => ({ ...p, location: e.target.value }))}
                    className="pl-11 h-12 border-[var(--color-border)] text-lg font-serif"
                    placeholder="e.g. Oxford, United Kingdom"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="website" className="text-xs font-semibold uppercase tracking-widest text-[var(--color-graphite-light)]">Personal Website</Label>
                <div className="relative">
                  <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-quill)]" />
                  <Input 
                    id="website" 
                    value={formData.website || ""} 
                    onChange={e => setFormData(p => ({ ...p, website: e.target.value }))}
                    className="pl-11 h-12 border-[var(--color-border)] font-mono text-sm"
                    placeholder="https://yourwork.com"
                  />
                </div>
              </div>
              
              {!formData.showLocation && (
                <div className="p-4 bg-[var(--color-quill-light)]/50 rounded border border-dashed border-[var(--color-quill)]/30 flex items-start gap-3">
                  <EyeOff className="w-5 h-5 text-[var(--color-quill)] shrink-0" />
                  <p className="text-xs text-[var(--color-graphite)] font-serif leading-relaxed">
                    Your location coordinates will still be used to refine your content recommendations but will be **hidden from your public profile**.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-semibold uppercase tracking-widest text-[var(--color-graphite-light)] flex items-center gap-2">
                <Map className="w-3 h-3" /> Pin Precise Location
              </Label>
              <LocationPicker 
                initialLat={formData.latitude}
                initialLng={formData.longitude}
                onLocationSelect={(lat, lng, address) => {
                  setFormData(p => ({ 
                    ...p, 
                    latitude: lat, 
                    longitude: lng,
                    location: p.location || address.split(",").slice(0, 2).join(",") // Suggest as display text if empty
                  }));
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Intrinsic Interests Section */}
      <section className="bg-[var(--color-vellum)] rounded-xl p-8 border border-[var(--color-border)] shadow-[var(--shadow-card)] space-y-10 mb-10">
        <div className="flex items-center gap-4 border-b border-[var(--color-border)] pb-6">
          <div className="p-3 bg-[var(--color-quill-light)] rounded-full outline outline-1 outline-[var(--color-quill)]/20">
            <Sparkles className="w-6 h-6 text-[var(--color-quill)]" />
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold text-[var(--color-ink)]">Intellectual Pursuits</h2>
            <p className="text-sm text-[var(--color-graphite)] font-sans">Refine the library to your specific curiosities.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          {allTopics.map((topic) => {
            const isSelected = formData.interests.includes(topic.id);
            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => toggleInterest(topic.id)}
                className={cn(
                  "px-8 py-3.5 rounded-full text-sm font-bold transition-all duration-300 border font-sans tracking-wide uppercase",
                  isSelected 
                    ? "bg-[var(--color-ink)] text-[var(--color-vellum)] border-[var(--color-ink)] shadow-xl scale-105" 
                    : "bg-white text-[var(--color-graphite)] border-[var(--color-border)] hover:border-[var(--color-quill)] hover:text-[var(--color-ink)] hover:bg-[var(--color-quill-light)]/20"
                )}
              >
                {topic.label}
              </button>
            );
          })}
        </div>
      </section>
    </form>
  );
}
