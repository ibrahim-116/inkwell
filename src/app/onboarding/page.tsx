"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PenLine, Check } from "lucide-react";
import { completeOnboardingAction } from "@/actions/user.actions";

const TOPICS = [
  { slug: "technology", label: "Technology", emoji: "💻" },
  { slug: "science", label: "Science", emoji: "🔬" },
  { slug: "philosophy", label: "Philosophy", emoji: "🧠" },
  { slug: "politics", label: "Politics", emoji: "🏛️" },
  { slug: "history", label: "History", emoji: "📜" },
  { slug: "finance", label: "Finance", emoji: "📈" },
  { slug: "business", label: "Business", emoji: "💼" },
  { slug: "health", label: "Health", emoji: "🌿" },
  { slug: "gaming", label: "Gaming", emoji: "🎮" },
  { slug: "sports", label: "Sports", emoji: "⚽" },
  { slug: "anime", label: "Anime", emoji: "🎌" },
  { slug: "film", label: "Film", emoji: "🎬" },
  { slug: "music", label: "Music", emoji: "🎵" },
  { slug: "art", label: "Art", emoji: "🎨" },
  { slug: "travel", label: "Travel", emoji: "✈️" },
  { slug: "food", label: "Food", emoji: "🍜" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggle = (slug: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const handleContinue = async () => {
    if (selected.size < 3) {
      setError("Please select at least 3 topics to continue.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const result = await completeOnboardingAction(Array.from(selected));

      if (result.success) {
        router.push("/feed");
        router.refresh();
      } else {
        setError(result.error ?? "Failed to save preferences. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Onboarding action failed:", err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-vellum)" }}>
      {/* Header */}
      <header className="flex items-center gap-2 px-6 py-5">
        <PenLine className="w-6 h-6" style={{ color: "var(--color-quill)" }} />
        <span style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 700 }}>Inkwell</span>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl">
          {/* Progress */}
          <div className="flex items-center gap-2 mb-8">
            <div className="flex-1 h-1 rounded-full" style={{ background: "var(--color-border-dark)" }}>
              <div
                className="h-1 rounded-full transition-all duration-500"
                style={{
                  background: "var(--color-ink)",
                  width: `${Math.min(100, (selected.size / 3) * 100)}%`,
                }}
              />
            </div>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--color-graphite)", minWidth: 60 }}>
              {selected.size} / 3 min
            </span>
          </div>

          {/* Title */}
          <div className="mb-10">
            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(28px, 5vw, 40px)",
                fontWeight: 700,
                marginBottom: 12,
                color: "var(--color-ink)",
              }}
            >
              What are you interested in?
            </h1>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: 16, color: "var(--color-graphite)", lineHeight: 1.6 }}>
              Pick at least 3 topics. We&apos;ll build your personalised feed around them — and make it smarter with every article you read.
            </p>
          </div>

          {/* Topic Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-8">
            {TOPICS.map((topic) => {
              const isSelected = selected.has(topic.slug);
              return (
                <button
                  key={topic.slug}
                  onClick={() => toggle(topic.slug)}
                  className="relative flex flex-col items-center gap-2 p-4 rounded border transition-all cursor-pointer text-left"
                  style={{
                    background: isSelected ? "var(--color-ink)" : "var(--color-paper)",
                    borderColor: isSelected ? "var(--color-ink)" : "var(--color-border-dark)",
                    transform: isSelected ? "scale(1.02)" : "scale(1)",
                    boxShadow: isSelected ? "0 4px 16px rgba(26,26,26,0.15)" : "var(--shadow-card)",
                  }}
                >
                  {isSelected && (
                    <div
                      className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: "var(--color-quill)" }}
                    >
                      <Check className="w-3 h-3" style={{ color: "var(--color-ink)" }} />
                    </div>
                  )}
                  <span className="text-2xl">{topic.emoji}</span>
                  <span
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: 13,
                      fontWeight: 600,
                      letterSpacing: "0.03em",
                      color: isSelected ? "var(--color-vellum)" : "var(--color-ink)",
                    }}
                  >
                    {topic.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Error */}
          {error && (
            <p
              className="mb-4 text-sm text-center"
              style={{ fontFamily: "var(--font-sans)", color: "var(--color-error)" }}
            >
              {error}
            </p>
          )}

          {/* Continue */}
          <button
            onClick={handleContinue}
            disabled={loading || selected.size < 3}
            className="btn btn-primary w-full publish-btn"
            style={{ padding: "14px 24px", fontSize: 16 }}
          >
            {loading ? "Setting up your feed..." : `Continue with ${selected.size} topic${selected.size !== 1 ? "s" : ""}`}
          </button>

          {selected.size < 3 && (
            <p
              className="text-center mt-3"
              style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--color-graphite-light)" }}
            >
              Select {3 - selected.size} more topic{3 - selected.size !== 1 ? "s" : ""} to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
