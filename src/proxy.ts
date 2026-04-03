import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const publicPaths = [
    "/sign-in",
    "/sign-up",
    "/",
    "/feed",
    "/about",
    "/terms",
    "/privacy",
    "/topics",
  ];

  const isPublicRoute =
    publicPaths.includes(nextUrl.pathname) ||
    nextUrl.pathname.startsWith("/post/") ||
    nextUrl.pathname.startsWith("/profile/") ||
    nextUrl.pathname.startsWith("/search") ||
    nextUrl.pathname.startsWith("/api/auth") ||     // NextAuth API routes always public
    nextUrl.pathname.startsWith("/api/uploadthing");

  const isOnboardingRoute = nextUrl.pathname === "/onboarding";

  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/sign-in", nextUrl));
  }

  if (isLoggedIn) {
    const onboardingCompleted = (req.auth?.user as any)?.onboardingCompleted;

    if (!onboardingCompleted && !isOnboardingRoute && !isPublicRoute) {
      return NextResponse.redirect(new URL("/onboarding", nextUrl));
    }

    if (onboardingCompleted && isOnboardingRoute) {
      return NextResponse.redirect(new URL("/feed", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
