import Link from "next/link";
import { PenLine } from "lucide-react";

export default function PrivacyPage() {
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
      <main className="flex-1 max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-[var(--color-ink)] mb-8">Privacy Policy</h1>
        <div className="prose prose-lg text-[var(--color-graphite)] font-sans">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl font-serif font-bold mt-10 mb-4 text-[var(--color-ink)]">Our Commitment to Privacy</h2>
          <p className="mb-6">
            At Inkwell, we believe you should be in control of your data. We do not sell your personal information to third parties, and we only collect data that helps us make the reading and writing experience better for you.
          </p>

          <h2 className="text-2xl font-serif font-bold mt-10 mb-4 text-[var(--color-ink)]">Information We Collect</h2>
          <p className="mb-6">
            <strong>Account Information:</strong> When you sign up, we collect basic information such as your name, email address, and profile picture (if authenticated through an OAuth provider).<br/><br/>
            <strong>Reading History & Analytics:</strong> We track what articles you read, how long you spend on them, and the topics you engage with. This helps us personalize your feed and provide engagement metrics to our creators.
          </p>

          <h2 className="text-2xl font-serif font-bold mt-10 mb-4 text-[var(--color-ink)]">How We Use Your Data</h2>
          <p className="mb-6">
            Your data is used to provide core platform functionality: authenticating your account, delivering a customized content feed, calculating reading analytics, and communicating platform updates.
          </p>

          <h2 className="text-2xl font-serif font-bold mt-10 mb-4 text-[var(--color-ink)]">Data Security</h2>
          <p className="mb-6">
            We use industry-standard security protocols to protect your information, including encryption at rest and in transit.
          </p>

          <div className="mt-16 pt-8 border-t border-[var(--color-border)]">
            <Link href="/" className="text-[var(--color-quill)] hover:underline font-medium">← Back to Home</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
