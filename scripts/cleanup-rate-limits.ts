import "dotenv/config";
import { prisma } from "../src/lib/prisma";

// The active limiter uses 15-minute windows. Keeping one day of expired
// buckets leaves room for clock skew and inspection without unbounded growth.
const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
const apply = process.argv.includes("--apply");

try {
  const where = { windowStart: { lt: cutoff } };
  const count = await prisma.enquiryRateLimit.count({ where });
  if (!apply) {
    console.log(`${count} expired rate-limit buckets eligible for cleanup. Re-run with --apply to delete them.`);
  } else {
    const result = await prisma.enquiryRateLimit.deleteMany({ where });
    console.log(`Deleted ${result.count} expired rate-limit buckets.`);
  }
} finally {
  await prisma.$disconnect();
}
