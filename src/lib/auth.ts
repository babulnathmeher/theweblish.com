import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  appName: "The Weblish",
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, { provider: "mysql" }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 12,
    maxPasswordLength: 128,
  },
  plugins: [admin({ defaultRole: "author", adminRoles: ["admin"] })],
  session: { expiresIn: 60 * 60 * 8, updateAge: 60 * 30 },
  rateLimit: { enabled: true },
  advanced: { skipTrailingSlashes: true },
});
