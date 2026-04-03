import { DefaultSession } from "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string | null;
      role: string;
      onboardingCompleted: boolean;
      emailVerified: Date | null;
    } & DefaultSession["user"];
  }

  interface User {
    username?: string | null;
    role?: string;
    onboardingCompleted?: boolean;
    emailVerified?: Date | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string | null;
    role: string;
    onboardingCompleted: boolean;
    emailVerified: Date | null;
  }
}
