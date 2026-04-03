import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import argon2 from "argon2";

/**
 * Full NextAuth v5 configuration — Node.js runtime only.
 *
 * Strategy: JWT (cookie-based, no Session table needed).
 * PrismaAdapter is kept for OAuth account linking (Account table)
 * and user creation, but does NOT manage session records.
 *
 * The username field is @unique and required in our schema.
 * Google does not provide a username, so we generate one in
 * the createUser event before the record is committed.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  debug: process.env.NODE_ENV === "development",

  // ── Adapter ───────────────────────────────────────────────────────
  // Used for OAuth account linking (Account table) and user creation.
  // Credentials provider bypasses adapter entirely.
  adapter: PrismaAdapter(prisma) as any,

  // ── Session — JWT, not database ───────────────────────────────────
  // Database strategy requires Session.user (lowercase) relation, but
  // our schema uses Session.User (capitalized). JWT avoids that lookup.
  session: {
    strategy: "jwt",
    maxAge: 60 * 24 * 60 * 60, // 60 days
    updateAge: 24 * 60 * 60,   // 24 hours
  },

  // ── Pages ─────────────────────────────────────────────────────────
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },

  // ── Providers ─────────────────────────────────────────────────────
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      // Allow linking Google to an existing email/password account
      allowDangerousEmailAccountLinking: true,
    }),

    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.passwordHash) return null;

        const isValid = await argon2.verify(
          user.passwordHash,
          credentials.password as string
        );

        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.avatarUrl,
          username: user.username,
          role: user.role,
          onboardingCompleted: user.onboardingCompleted,
          emailVerified: user.emailVerified,
        };
      },
    }),
  ],

  // ── Callbacks ─────────────────────────────────────────────────────
  callbacks: {
    /**
     * jwt — runs when token is created/updated.
     * On first sign-in (user object present), hydrate token with
     * app-specific fields from the DB.
     */
    async jwt({ token, user, trigger, session }) {
      if (user) {
        // First sign-in: load full user record to get custom fields
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id! },
          select: {
            username: true,
            role: true,
            onboardingCompleted: true,
            emailVerified: true,
            avatarUrl: true,
          },
        });

        token.id = user.id!;
        token.username = dbUser?.username ?? null;
        token.role = dbUser?.role ?? "USER";
        token.onboardingCompleted = dbUser?.onboardingCompleted ?? false;
        token.emailVerified = dbUser?.emailVerified ?? null;
        if (dbUser?.avatarUrl) token.picture = dbUser.avatarUrl;
      }

      // Session update (e.g. after onboarding completion)
      if (trigger === "update" && session) {
        token.username = session.username ?? token.username;
        token.onboardingCompleted = session.onboardingCompleted ?? token.onboardingCompleted;
        token.emailVerified = session.emailVerified ?? token.emailVerified;
      }

      return token;
    },

    /**
     * session — maps JWT token fields onto the session object
     * that server components receive via auth().
     */
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string | null;
        session.user.role = token.role as string;
        session.user.onboardingCompleted = token.onboardingCompleted as boolean;
        session.user.emailVerified = token.emailVerified as Date | null;
      }
      return session;
    },
  },

  // ── Events ────────────────────────────────────────────────────────
  events: {
    /**
     * createUser fires after PrismaAdapter inserts the User row.
     * At that point the user has no username (Google doesn't provide one
     * and our schema requires @unique username). We generate one here.
     */
    async createUser({ user }) {
      if (!user.email) return;

      // Check if username already patched (e.g. credentials path)
      const existing = await prisma.user.findUnique({
        where: { id: user.id! },
        select: { username: true },
      });
      if (existing?.username) return;

      // Generate unique username from name or email prefix
      const base = (user.name ?? user.email.split("@")[0])
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "")
        .slice(0, 20) || "user";

      let username = base;
      let attempt = 0;
      while (true) {
        const taken = await prisma.user.findUnique({ where: { username } });
        if (!taken) break;
        attempt++;
        username = `${base}${attempt}`;
      }

      await prisma.user.update({
        where: { id: user.id! },
        data: {
          username,
          avatarUrl: user.image ?? null,
        },
      });
    },
  },
});
