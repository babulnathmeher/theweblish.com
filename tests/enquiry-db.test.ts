import "dotenv/config";
import assert from "node:assert/strict";
import { randomInt } from "node:crypto";
import test from "node:test";
import { saveEnquiry } from "../src/features/leads/service";
import { validateEnquiry } from "../src/features/leads/validation";
import { prisma } from "../src/lib/prisma";

test("development admin has a credential account", async () => {
  const email = process.env.ADMIN_SEED_EMAIL;
  assert.ok(email);
  const user = await prisma.user.findUnique({ where: { email }, include: { accounts: true } });
  assert.ok(user);
  assert.equal(user.role, "admin");
  assert.ok(user.accounts.some((account) => account.providerId === "credential" && !!account.password));
});

test("development database preserves every repeat submission", async () => {
  const phone = `+91${randomInt(6_000_000_000, 10_000_000_000)}`;
  const parsed = validateEnquiry({
    name: "Integration Test", phone, email: "", serviceInterest: "business-website",
    budgetRange: "unsure", message: "First request", consent: true,
    landingPageUrl: "http://localhost:3000/website-development/",
    utmSource: "test", utmMedium: "", utmCampaign: "", utmTerm: "", utmContent: "", website: "",
  });
  assert.equal(parsed.success, true);
  if (!parsed.success) return;
  try {
    const first = await saveEnquiry(parsed.data);
    const second = await saveEnquiry({ ...parsed.data, message: "Repeat request" });
    assert.equal(first, second);
    const lead = await prisma.lead.findUniqueOrThrow({ where: { phone }, include: { activities: { orderBy: { createdAt: "asc" } } } });
    assert.equal(lead.activities.length, 2);
    assert.equal(lead.activities[0].type, "SUBMISSION");
    assert.equal(lead.activities[1].type, "SUBMISSION");
    assert.equal((lead.activities[1].submission as { message: string }).message, "Repeat request");
  } finally {
    await prisma.lead.deleteMany({ where: { phone } });
    await prisma.$disconnect();
  }
});
