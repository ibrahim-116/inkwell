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
    nextUrl.pathname.startsWith("/post/") ||        // individual post pages
    nextUrl.pathname.startsWith("/profile/") ||     // author profiles
    nextUrl.pathname.startsWith("/search") ||       // search page
    nextUrl.pathname.startsWith("/api/uploadthing"); // upload API

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
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};
