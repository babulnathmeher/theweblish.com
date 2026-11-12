import "server-only";
import { createHmac } from "node:crypto";
import { prisma } from "@/lib/prisma";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export async function consumeEnquiryRateLimit(identity: string): Promise<boolean> {
  const secret = process.env.ENQUIRY_HASH_SECRET;
  if (!secret || secret.length < 32) throw new Error("ENQUIRY_HASH_SECRET must be configured.");
  const key = createHmac("sha256", secret).update(identity).digest("hex");
  const now = new Date();
  const cutoff = new Date(now.getTime() - WINDOW_MS);

  // One atomic SQL statement keeps limits consistent across app instances.
  await prisma.$executeRaw`
    INSERT INTO EnquiryRateLimit (\`key\`, windowStart, \`count\`, updatedAt)
    VALUES (${key}, ${now}, 1, ${now})
    ON DUPLICATE KEY UPDATE
      \`count\` = IF(windowStart < ${cutoff}, 1, \`count\` + 1),
      windowStart = IF(windowStart < ${cutoff}, ${now}, windowStart),
      updatedAt = ${now}
  `;
  const bucket = await prisma.enquiryRateLimit.findUniqueOrThrow({ where: { key } });
  return bucket.count <= MAX_ATTEMPTS;
}
