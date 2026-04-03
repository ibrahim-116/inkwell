import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

/**
 * Auth config safe for Edge runtime (middleware / proxy.ts).
 * No DB calls here — only provider declarations and callbacks
 * that work without the Prisma client.
 */
export const authConfig = {
  trustHost: true,
  debug: process.env.NODE_ENV === "development",
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
} satisfies NextAuthConfig;
