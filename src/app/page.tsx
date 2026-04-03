"use client";

import Link from "next/link";
import { PenLine, BookOpen, Sparkles, Users, TrendingUp, Shield, Feather, Zap, Globe } from "lucide-react";
import { motion, Variants } from "framer-motion";

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

const steps = [
  {
    icon: Feather,
    title: "Draft Your Thoughts",
    description: "Use our serene, distraction-free editor to lay down your ideas. Add rich media effortlessly.",
  },
  {
    icon: Globe,
    title: "Publish to the World",
    description: "Hit publish and instantly reach a curated audience that genuinely cares about your niche.",
  },
  {
    icon: Zap,
    title: "Track Engagement",
    description: "Access beautiful, real-time analytics dashboards to see how readers interact with your work.",
  }
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

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
              href="/feed"
              className="btn btn-ghost"
              style={{ fontSize: 15, color: "var(--color-quill)", fontWeight: 600 }}
            >
              <BookOpen className="w-4 h-4" />
              Browse feed
            </Link>
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
            <Link href="/feed" className="btn btn-ghost btn-sm" style={{ color: "var(--color-quill)", fontWeight: 600 }}>
              Browse
            </Link>
            <Link href="/sign-in" className="btn btn-ghost btn-sm">
              Sign in
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 mt-16 pt-16 pb-24 text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-8 shadow-sm hover:shadow transition-shadow"
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
            className="mb-8"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(48px, 8vw, 84px)",
              lineHeight: 1.05,
              fontWeight: 700,
              color: "var(--color-ink)",
              letterSpacing: "-0.02em"
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
              fontSize: 20,
              lineHeight: 1.6,
              color: "var(--color-graphite)",
            }}
          >
            Tell us what you love. We&apos;ll surface the best long-form writing
            from fellow thinkers — then give you a canvas to share your own.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sign-up"
              className="btn btn-primary btn-lg publish-btn transform hover:scale-105 transition-transform"
            >
              <PenLine className="w-5 h-5" />
              Start writing for free
            </Link>
            <Link
              href="/feed"
              className="btn btn-outline btn-lg transform hover:scale-105 transition-all"
            >
              <BookOpen className="w-5 h-5" />
              Explore the feed
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Topic showcase */}
      <section
        className="py-16 overflow-hidden relative"
        style={{ borderTop: "1px solid var(--color-border)", borderBottom: "1px solid var(--color-border)", background: "var(--color-paper)" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none"></div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="relative z-10"
        >
          <p
            className="text-center mb-10"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "var(--color-graphite-light)",
            }}
          >
            Explore 16+ topics — from technology to philosophy
          </p>
          <div className="flex flex-wrap gap-4 justify-center max-w-4xl mx-auto px-6">
            {topics.map((topic, i) => (
              <motion.span
                key={topic.label}
                variants={{
                  hidden: { opacity: 0, scale: 0.9 },
                  visible: { opacity: 1, scale: 1, transition: { delay: i * 0.05 } }
                }}
                className="tag cursor-default hover:shadow-md transition-shadow bg-white/80 backdrop-blur-sm"
                style={{ fontSize: 14, padding: "8px 16px" }}
              >
                {topic.emoji} {topic.label}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-6 py-32 relative">
        <motion.div 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="text-center mb-20"
        >
          <span className="text-[var(--color-quill)] font-bold tracking-widest uppercase text-sm mb-4 block">The Process</span>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(32px, 5vw, 48px)",
              color: "var(--color-ink)",
              marginBottom: 16,
            }}
          >
            How Inkwell Works
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-[var(--color-graphite)] font-sans">
            A streamlined publishing experience designed to get out of your way and let your words shine.
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          {steps.map((step, idx) => (
            <motion.div key={step.title} variants={fadeUp} className="text-center relative">
              {idx !== steps.length - 1 && (
                <div className="hidden md:block absolute top-10 right-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--color-quill-light)] to-transparent transform translate-x-1/2"></div>
              )}
              <div className="w-20 h-20 mx-auto bg-white rounded-2xl shadow-sm border border-[var(--color-border)] flex items-center justify-center mb-6 relative z-10">
                <step.icon className="w-8 h-8 text-[var(--color-quill)]" />
              </div>
              <h3 className="text-xl font-serif font-bold text-[var(--color-ink)] mb-3">{step.title}</h3>
              <p className="text-[var(--color-graphite)] font-sans leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="bg-[var(--color-paper)] py-32 border-y border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="text-center mb-20"
          >
            <h2
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(32px, 5vw, 48px)",
                color: "var(--color-ink)",
                marginBottom: 16,
              }}
            >
              Everything you need to read and write better
            </h2>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 18,
                color: "var(--color-graphite)",
              }}
            >
              Built from the ground up for writers who care and readers who think.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div 
                  key={feature.title} 
                  variants={fadeUp}
                  className="card p-8 bg-white/60 backdrop-blur-sm hover:bg-white transition-colors hover:shadow-md"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-sm"
                    style={{ background: "var(--color-quill-light)" }}
                  >
                    <Icon
                      className="w-6 h-6"
                      style={{ color: "#8b6914" }}
                    />
                  </div>
                  <h3
                    className="mb-3 text-xl"
                    style={{ fontFamily: "var(--font-serif)", fontWeight: 700 }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: 16,
                      lineHeight: 1.6,
                      color: "var(--color-graphite)",
                    }}
                  >
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-32 max-w-4xl mx-auto px-6 text-center">
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           whileInView={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.8 }}
           viewport={{ once: true }}
        >
          <BookOpen className="w-12 h-12 text-[var(--color-quill)] opacity-50 mx-auto mb-8" />
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-[var(--color-ink)] leading-tight mb-8">
            &ldquo;Reading is the nourishment that lets you do interesting work.&rdquo;
          </h2>
          <p className="text-[var(--color-graphite)] font-sans uppercase tracking-widest text-sm font-bold">— Stephen King</p>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="pb-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fadeUp}
          className="mx-4 md:mx-auto max-w-5xl rounded-2xl p-14 md:p-24 text-center shadow-2xl relative overflow-hidden"
          style={{ background: "var(--color-ink)" }}
        >
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
          <h2
            className="mb-6 relative z-10"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(36px, 5vw, 56px)",
              color: "var(--color-vellum)",
              lineHeight: 1.1
            }}
          >
            Your words deserve an audience
          </h2>
          <p
            className="mb-10 mx-auto max-w-lg relative z-10"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 18,
              lineHeight: 1.7,
              color: "rgba(253,252,251,0.8)",
            }}
          >
            Join thousands of writers and readers. Free to start, free to publish,
            free to discover.
          </p>
          <Link
            href="/sign-up"
            className="btn btn-lg publish-btn scale-110 hover:scale-[1.15] transition-transform relative z-10 shadow-xl"
            style={{
              background: "var(--color-quill)",
              color: "var(--color-ink)",
              border: "none"
            }}
          >
            <PenLine className="w-5 h-5" />
            Create your account
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer
        className="border-t py-12 px-6 bg-[var(--color-paper)]"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <PenLine
                className="w-5 h-5"
                style={{ color: "var(--color-quill)" }}
              />
              <span
                style={{
                  fontFamily: "var(--font-serif)",
                  fontWeight: 700,
                  fontSize: 18,
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
          </div>
          <div className="flex gap-8">
            {["Terms", "Privacy", "About"].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase()}`}
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 15,
                  color: "var(--color-graphite)",
                  fontWeight: 500
                }}
                className="hover:text-[var(--color-ink)] hover:underline transition-colors"
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
