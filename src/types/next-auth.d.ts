import { DefaultSession } from "next-auth";

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
