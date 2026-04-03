import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./src/lib/prisma";

const config = {
  providers: [],
  adapter: PrismaAdapter(prisma),
} as any;

const result = NextAuth(config);
console.log("NextAuth Result Keys:", Object.keys(result));
if (result.handlers) {
  console.log("Handlers Keys:", Object.keys(result.handlers));
} else {
  console.log("Handlers property is MISSING!");
}
