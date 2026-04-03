import Link from "next/link";
import { PenLine, BookOpen, Sparkles, Users, TrendingUp, Shield } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "Personalised for You",
    description:
      "Tell us your interests and get a feed that evolves with your reading habits. The more you read, the smarter it gets.",
  },
  {
    icon: PenLine,
    title: "Write Without Limits",
    description:
      "A distraction-free writing canvas with a powerful editor. Rich text, images, code blocks, and more — all in one place.",
  },
  {
    icon: BookOpen,
    title: "Long-Form First",
    description:
      "Built for writers and readers who care about depth. No clickbait, no noise — just thoughtful long-form content.",
  },
  {
    icon: Users,
    title: "Real Community",
    description:
      "Follow writers you love, join conversations in the comments, and share ideas with a curious global audience.",
  },
  {
    icon: TrendingUp,
    title: "Grow Your Audience",
    description:
      "Every post is discoverable through topic tags and the personalised feed. Real reach without the algorithm mystery.",
  },
  {
    icon: Shield,
    title: "Safe & Trusted",
    description:
      "Harassment-free spaces with robust reporting tools and a responsive moderation team.",
  },
];

const topics = [
  { label: "Technology", emoji: "💻" },
  { label: "Science", emoji: "🔬" },
  { label: "Philosophy", emoji: "🧠" },
  { label: "Politics", emoji: "🏛️" },
  { label: "Finance", emoji: "📈" },
  { label: "Gaming", emoji: "🎮" },
  { label: "Sports", emoji: "⚽" },
  { label: "Film", emoji: "🎬" },
  { label: "Music", emoji: "🎵" },
  { label: "Health", emoji: "🌿" },
  { label: "Art", emoji: "🎨" },
  { label: "Travel", emoji: "✈️" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--color-vellum)" }}>
      {/* Nav */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          background: "rgba(253, 252, 251, 0.9)",
          backdropFilter: "blur(12px)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PenLine
              className="w-6 h-6"
              style={{ color: "var(--color-quill)" }}
            />
            <span
              className="text-xl font-bold"
              style={{ fontFamily: "var(--font-serif)", color: "var(--color-ink)" }}
            >
              Inkwell
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/sign-in"
              className="btn btn-ghost"
              style={{ fontSize: 15 }}
            >
              Sign in
            </Link>
            <Link href="/sign-up" className="btn btn-primary btn-sm">
              Start writing
            </Link>
          </nav>
          <div className="flex md:hidden items-center gap-3">
            <Link href="/sign-in" className="btn btn-ghost btn-sm">
              Sign in
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-8"
          style={{
            background: "var(--color-quill-light)",
            color: "#8b6914",
            border: "1px solid #e8d5b3",
          }}
        >
          <Sparkles className="w-4 h-4" />
          <span style={{ fontFamily: "var(--font-sans)", fontWeight: 500 }}>
            Interest-driven content discovery
          </span>
        </div>

        <h1
          className="mb-6"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(40px, 6vw, 72px)",
            lineHeight: 1.1,
            fontWeight: 700,
            color: "var(--color-ink)",
          }}
        >
          Where great writing
          <br />
          <span style={{ color: "var(--color-quill)" }}>finds its audience</span>
        </h1>

        <p
          className="mx-auto mb-10 max-w-xl"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 18,
            lineHeight: 1.7,
            color: "var(--color-graphite)",
          }}
        >
          Tell us what you love. We&apos;ll surface the best long-form writing
          from fellow thinkers — then give you a canvas to share your own.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/sign-up"
            className="btn btn-primary btn-lg publish-btn"
          >
            <PenLine className="w-5 h-5" />
            Start writing for free
          </Link>
          <Link href="/feed" className="btn btn-outline btn-lg">
            <BookOpen className="w-5 h-5" />
            Explore the feed
          </Link>
        </div>
      </section>

      {/* Topic showcase */}
      <section
        className="py-14 overflow-hidden"
        style={{ borderTop: "1px solid var(--color-border)", borderBottom: "1px solid var(--color-border)", background: "var(--color-paper)" }}
      >
        <p
          className="text-center mb-8"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--color-graphite-light)",
          }}
        >
          Explore 16+ topics — from technology to philosophy
        </p>
        <div className="flex flex-wrap gap-3 justify-center max-w-3xl mx-auto px-6">
          {topics.map((topic) => (
            <span
              key={topic.label}
              className="tag cursor-default"
              style={{ fontSize: 13 }}
            >
              {topic.emoji} {topic.label}
            </span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(28px, 4vw, 42px)",
              color: "var(--color-ink)",
              marginBottom: 12,
            }}
          >
            Everything you need to read and write better
          </h2>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 16,
              color: "var(--color-graphite)",
            }}
          >
            Built from the ground up for writers who care and readers who think.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="card p-6">
                <div
                  className="w-10 h-10 rounded flex items-center justify-center mb-4"
                  style={{ background: "var(--color-quill-light)" }}
                >
                  <Icon
                    className="w-5 h-5"
                    style={{ color: "#8b6914" }}
                  />
                </div>
                <h3
                  className="mb-2 text-lg"
                  style={{ fontFamily: "var(--font-serif)", fontWeight: 600 }}
                >
                  {feature.title}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 15,
                    lineHeight: 1.6,
                    color: "var(--color-graphite)",
                  }}
                >
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section
        className="mx-4 mb-16 rounded-lg p-12 md:p-20 text-center"
        style={{ background: "var(--color-ink)" }}
      >
        <h2
          className="mb-4"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(28px, 4vw, 48px)",
            color: "var(--color-vellum)",
          }}
        >
          Your words deserve an audience
        </h2>
        <p
          className="mb-8 mx-auto max-w-md"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 17,
            lineHeight: 1.7,
            color: "rgba(253,252,251,0.7)",
          }}
        >
          Join thousands of writers and readers. Free to start, free to publish,
          free to discover.
        </p>
        <Link
          href="/sign-up"
          className="btn btn-lg publish-btn"
          style={{
            background: "var(--color-quill)",
            color: "var(--color-ink)",
          }}
        >
          <PenLine className="w-5 h-5" />
          Create your account
        </Link>
      </section>

      {/* Footer */}
      <footer
        className="border-t py-10 px-6"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <PenLine
              className="w-5 h-5"
              style={{ color: "var(--color-quill)" }}
            />
            <span
              style={{
                fontFamily: "var(--font-serif)",
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              Inkwell
            </span>
          </div>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 14,
              color: "var(--color-graphite-light)",
            }}
          >
            © 2025 Inkwell. Read deeply. Write clearly.
          </p>
          <div className="flex gap-6">
            {["Terms", "Privacy", "About"].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase()}`}
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 14,
                  color: "var(--color-graphite)",
                }}
                className="hover:underline"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
