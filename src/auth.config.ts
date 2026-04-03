import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

export const authConfig = {
  trustHost: true,
  debug: process.env.NODE_ENV === "development",
  session: { 
    strategy: "jwt",
    maxAge: 60 * 24 * 60 * 60, // 60 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id!;
        token.username = user.username;
        token.role = user.role;
        token.emailVerified = user.emailVerified;
        token.onboardingCompleted = user.onboardingCompleted;
      }
      if (trigger === "update" && session) {
        token.username = session.username ?? token.username;
        token.emailVerified = session.emailVerified ?? token.emailVerified;
        token.onboardingCompleted = session.onboardingCompleted ?? token.onboardingCompleted;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.role = token.role;
        session.user.emailVerified = token.emailVerified;
        session.user.onboardingCompleted = token.onboardingCompleted;
      }
      return session;
    },

  },
} satisfies NextAuthConfig;
