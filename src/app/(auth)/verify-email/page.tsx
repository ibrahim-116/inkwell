"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { PenLine, CheckCircle2, XCircle, Loader2 } from "lucide-react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !email) {
      setStatus("error");
      setError("Invalid verification link.");
      return;
    }

    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, email }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStatus("success");
          setTimeout(() => router.push("/onboarding"), 2500);
        } else {
          setStatus("error");
          setError(data.error ?? "Verification failed.");
        }
      })
      .catch(() => {
        setStatus("error");
        setError("Something went wrong. Please try again.");
      });
  }, [token, email, router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--color-vellum)" }}>
      <div className="w-full max-w-sm text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-10">
          <PenLine className="w-6 h-6" style={{ color: "var(--color-quill)" }} />
          <span style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 700 }}>Inkwell</span>
        </Link>

        {status === "loading" && (
          <>
            <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin" style={{ color: "var(--color-quill)" }} />
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
              Verifying your email...
            </h1>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 className="w-14 h-14 mx-auto mb-4" style={{ color: "#22c55e" }} />
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
              Email verified!
            </h1>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: 15, color: "var(--color-graphite)", marginBottom: 24 }}>
              Redirecting you to choose your interests...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="w-14 h-14 mx-auto mb-4" style={{ color: "var(--color-error)" }} />
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
              Verification failed
            </h1>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: 15, color: "var(--color-graphite)", marginBottom: 24 }}>
              {error}
            </p>
            <Link href="/sign-in" className="btn btn-primary w-full">
              Back to sign in
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
