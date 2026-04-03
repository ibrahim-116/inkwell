import Link from "next/link";
import { PenLine } from "lucide-react";

export default function TermsPage() {
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
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-[var(--color-ink)] mb-8">Terms of Service</h1>
        <div className="prose prose-lg text-[var(--color-graphite)] font-sans">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl font-serif font-bold mt-10 mb-4 text-[var(--color-ink)]">1. Acceptance of Terms</h2>
          <p className="mb-6">
            By accessing or using Inkwell ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
          </p>

          <h2 className="text-2xl font-serif font-bold mt-10 mb-4 text-[var(--color-ink)]">2. Content Ownership</h2>
          <p className="mb-6">
            You retain all ownership rights to the content you create and publish on Inkwell. By posting content, you grant Inkwell a non-exclusive, worldwide, royalty-free license to distribute, display, and perform your content strictly for the purpose of operating and promoting the Platform.
          </p>

          <h2 className="text-2xl font-serif font-bold mt-10 mb-4 text-[var(--color-ink)]">3. User Conduct</h2>
          <p className="mb-6">
            You agree not to post content that is illegal, defamatory, harassing, or violates the intellectual property rights of others. We reserve the right to remove any content or suspend accounts that violate these guidelines without prior notice.
          </p>

          <h2 className="text-2xl font-serif font-bold mt-10 mb-4 text-[var(--color-ink)]">4. Service Modifications</h2>
          <p className="mb-6">
            We continuously improve our platform. We reserve the right to modify, suspend, or discontinue any part of the service at any time. We will do our best to provide notice of significant changes.
          </p>
          
          <h2 className="text-2xl font-serif font-bold mt-10 mb-4 text-[var(--color-ink)]">5. Liability Limitation</h2>
          <p className="mb-6">
            Inkwell provides the platform "as is". We are not liable for any damages or losses related to your use of the platform, including lost data or lost profits.
          </p>

          <div className="mt-16 pt-8 border-t border-[var(--color-border)]">
            <Link href="/" className="text-[var(--color-quill)] hover:underline font-medium">← Back to Home</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
