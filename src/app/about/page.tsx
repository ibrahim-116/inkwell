import Link from "next/link";
import { PenLine } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-vellum)" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          background: "rgba(253, 252, 251, 0.9)",
          backdropFilter: "blur(12px)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <PenLine className="w-5 h-5" style={{ color: "var(--color-quill)" }} />
            <span className="text-xl font-bold" style={{ fontFamily: "var(--font-serif)", color: "var(--color-ink)" }}>
              Inkwell
            </span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-3xl mx-auto px-6 py-16 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-[var(--color-ink)] mb-10 leading-tight">
          Read deeply.<br className="hidden md:block"/> Write clearly.
        </h1>
        
        <div className="prose prose-lg text-[var(--color-graphite)] font-sans mx-auto md:mx-0">
          <p className="text-xl mb-8 leading-relaxed">
            Inkwell was built out of a desire for a quieter, more thoughtful internet. We believe that long-form writing is oxygen for the mind.
          </p>

          <p className="mb-6">
            In an era of doom-scrolling, algorithmic echo chambers, and 15-second soundbites, the simple act of reading a well-reasoned essay has become radical. We designed our "Modern Heritage" aesthetic to mimic the focus of a printed book while leveraging the power of modern web technologies.
          </p>

          <p className="mb-6">
            <strong>For Readers:</strong> A distraction-free environment that actually learns what niches, authors, and topics matter to you, uncorrupted by clickbait.
          </p>

          <p className="mb-6">
            <strong>For Writers:</strong> A powerful, professional-grade drafting experience combined with real, organic discovery. We give you the audience and analytics you need to grow without sacrificing the integrity of your work.
          </p>

          <div className="mt-16 pt-8 border-t border-[var(--color-border)] text-left flex items-center gap-4">
            <Link href="/" className="text-[var(--color-quill)] hover:underline font-medium">← Back to Home</Link>
            <span className="text-[var(--color-border)]">|</span>
            <Link href="/sign-up" className="text-[var(--color-ink)] hover:underline font-medium">Start Writing Today</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
