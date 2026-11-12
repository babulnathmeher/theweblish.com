import "dotenv/config";
import { verifyPassword } from "better-auth/crypto";
import { auth } from "../src/lib/auth";
import { prisma } from "../src/lib/prisma";

async function main() {
  const email = process.env.ADMIN_SEED_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_SEED_PASSWORD;
  if (!email || !password || password.length < 12 || password.length > 128) {
    throw new Error("Set ADMIN_SEED_EMAIL and a 12–128 character ADMIN_SEED_PASSWORD in an ignored local .env file.");
  }
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true, role: true } });
  if (existing) {
    if (existing.role !== "admin") throw new Error("Seed email already exists without admin role.");
    const credential = await prisma.account.findFirst({
      where: { userId: existing.id, providerId: "credential" },
      select: { password: true },
    });
    if (!credential?.password || credential.password === password || !await verifyPassword({ hash: credential.password, password })) {
      throw new Error("Existing admin credential does not match the seed password; no changes made.");
    }
    console.log("Development administrator and hashed credential verified; no changes made.");
    return;
  }
  await auth.api.createUser({ body: { email, password, name: "Development Admin", role: "admin" } });
  console.log("Development administrator created. Password remains only in the ignored local environment file.");
}

main().finally(() => prisma.$disconnect());
