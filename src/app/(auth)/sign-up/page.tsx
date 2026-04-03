"use client";


import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { PenLine, Eye, EyeOff, Mail, User } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong. Please try again.");
      setLoading(false);
    } else {
      // Auto sign in
      const signInRes = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (signInRes?.error) {
        setError("Account created, but automatic sign in failed. Please sign in manually.");
        setLoading(false);
      } else {
        router.push("/onboarding");
      }
    }
  };



  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--color-vellum)" }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <PenLine className="w-7 h-7" style={{ color: "var(--color-quill)" }} />
            <span style={{ fontFamily: "var(--font-serif)", fontSize: 24, fontWeight: 700 }}>
              Inkwell
            </span>
          </Link>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 26,
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            Join Inkwell
          </h1>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 15, color: "var(--color-graphite)" }}>
            Free forever. No credit card required.
          </p>
        </div>

        {/* OAuth */}
        <div className="flex flex-col gap-3 mb-6">
          <button onClick={() => signIn("google", { callbackUrl: "/onboarding" })} className="btn btn-outline w-full">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="divider flex-1 m-0" />
          <span style={{ fontSize: 13, color: "var(--color-graphite-light)", fontFamily: "var(--font-sans)" }}>or</span>
          <div className="divider flex-1 m-0" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="px-4 py-3 rounded text-sm" style={{ background: "#fce8e8", color: "var(--color-error)", border: "1px solid #f5c6c6", fontFamily: "var(--font-sans)" }}>
              {error}
            </div>
          )}

          <div>
            <label className="label">Full name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--color-graphite-light)" }} />
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Your name"
                className="input"
                style={{ paddingLeft: 40 }}
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Email address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--color-graphite-light)" }} />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com"
                className="input"
                style={{ paddingLeft: 40 }}
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="At least 8 characters"
                className="input"
                style={{ paddingRight: 44 }}
                required
                minLength={8}
              />
              <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 btn btn-ghost btn-icon p-1" style={{ color: "var(--color-graphite-light)" }}>
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-full mt-2 publish-btn" style={{ padding: "13px 20px", fontSize: 16 }}>
            {loading ? "Creating account..." : "Create free account"}
          </button>
        </form>

        <p className="text-center mt-6" style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--color-graphite-light)" }}>
          By signing up you agree to our{" "}
          <Link href="/terms" className="underline">Terms</Link> and{" "}
          <Link href="/privacy" className="underline">Privacy Policy</Link>.
        </p>

        <p className="text-center mt-4" style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--color-graphite)" }}>
          Already have an account?{" "}
          <Link href="/sign-in" className="font-semibold underline" style={{ color: "var(--color-ink)" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
