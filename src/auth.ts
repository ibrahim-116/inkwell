import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import argon2 from "argon2";

/**
 * Full NextAuth configuration — runs only in Node.js runtime.
 * Uses PrismaAdapter with database sessions so Google OAuth
 * account linking works correctly without JWT/adapter conflicts.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  debug: process.env.NODE_ENV === "development",

  // ── Adapter & session strategy ────────────────────────────────────
  // PrismaAdapter requires "database" strategy. JWT + PrismaAdapter
  // is the root cause of OAuthAccountNotLinked errors.
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "database",
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
        };
      },
    }),
  ],

  // ── Callbacks ─────────────────────────────────────────────────────
  callbacks: {
    /**
     * signIn callback: called after OAuth provider returns.
     * For Google users, ensure a username is set since our schema
     * requires it but Google doesn't provide one.
     */
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (!existingUser) {
            // New Google user — generate a unique username from their name/email
            const base = (user.name ?? user.email.split("@")[0])
              .toLowerCase()
              .replace(/[^a-z0-9]/g, "")
              .slice(0, 20);

            let username = base;
            let attempt = 0;
            while (true) {
              const taken = await prisma.user.findUnique({ where: { username } });
              if (!taken) break;
              attempt++;
              username = `${base}${attempt}`;
            }

            // The adapter will create the User record — patch in the username
            // by updating immediately after creation using the upsert pattern.
            // We store the intended username on the user object so the adapter
            // picks it up if it reads custom fields (varies by adapter version).
            (user as any).username = username;
          } else {
            // Returning Google user — carry their username forward
            (user as any).username = existingUser.username;
            (user as any).onboardingCompleted = existingUser.onboardingCompleted;
          }
        } catch (err) {
          console.error("[auth] signIn Google callback error:", err);
          return false;
        }
      }
      return true;
    },

    /**
     * session callback: enrich the session object with
     * app-specific fields from the DB user record.
     */
    async session({ session, user }) {
      if (session.user && user) {
        // user here is the full DB user record (database session strategy)
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            username: true,
            role: true,
            onboardingCompleted: true,
            emailVerified: true,
            avatarUrl: true,
          },
        });

        session.user.id = user.id;
        session.user.username = dbUser?.username ?? null;
        session.user.role = dbUser?.role ?? "USER";
        session.user.onboardingCompleted = dbUser?.onboardingCompleted ?? false;
        session.user.emailVerified = dbUser?.emailVerified ?? null;
        if (dbUser?.avatarUrl) session.user.image = dbUser.avatarUrl;
      }
      return session;
    },
  },

  // ── Events ────────────────────────────────────────────────────────
  events: {
    /**
     * After createUser: patch in the username that we pre-computed
     * in the signIn callback. The PrismaAdapter creates the User
     * but doesn't know about our custom username field.
     */
    async createUser({ user }) {
      if (!(user as any).username) {
        // Fallback: derive username from email
        const base = (user.email ?? "user")
          .split("@")[0]
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "")
          .slice(0, 20);

        let username = base;
        let attempt = 0;
        while (true) {
          const taken = await prisma.user.findUnique({ where: { username } });
          if (!taken) break;
          attempt++;
          username = `${base}${attempt}`;
        }

        (user as any).username = username;
      }

      await prisma.user.update({
        where: { id: user.id! },
        data: {
          username: (user as any).username,
          avatarUrl: user.image ?? null,
        },
      });
    },
  },
});
