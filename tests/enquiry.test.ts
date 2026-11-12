import assert from "node:assert/strict";
import test from "node:test";
import { persistEnquiry, type EnquiryRepository } from "../src/features/leads/persistence";
import { normalizeIndianPhone, validateEnquiry } from "../src/features/leads/validation";
import { hasAdminAccess } from "../src/lib/authorization";

const valid = {
  name: "Test Customer", phone: "98765 43210", email: "customer@example.com",
  serviceInterest: "business-website", budgetRange: "25000-50000", message: "Please call me.",
  consent: true, landingPageUrl: "https://example.com/website-development/?utm_source=ad",
  utmSource: "ad", utmMedium: "", utmCampaign: "", utmTerm: "", utmContent: "", website: "",
};

test("normalizes Indian mobile formats without truncating numbers beginning with 91", () => {
  assert.equal(normalizeIndianPhone("+91 98765 43210"), "+919876543210");
  assert.equal(normalizeIndianPhone("09876543210"), "+919876543210");
  assert.equal(normalizeIndianPhone("9123456789"), "+919123456789");
  assert.equal(normalizeIndianPhone("1234567890"), null);
});

test("validates consent and rejects spam honeypot or malformed input", () => {
  assert.equal(validateEnquiry(valid).success, true);
  assert.equal(validateEnquiry({ ...valid, consent: false }).success, false);
  assert.equal(validateEnquiry({ ...valid, website: "spam" }).success, false);
  assert.equal(validateEnquiry({ ...valid, phone: "1111111111" }).success, false);
});

test("enquiry validation uses a readable name error", () => {
  const result = validateEnquiry({ ...valid, name: "A" });
  assert.equal(result.success, false);
  if (!result.success) assert.equal(result.fields.name, "Enter your name (at least 2 characters).");
});

test("repeat phone enquiries retain one lead and an activity for every submission", async () => {
  const leads = new Map<string, string>();
  const activities: string[] = [];
  const repository: EnquiryRepository = {
    async upsertByPhone(input) {
      let id = leads.get(input.phone);
      if (!id) { id = `lead-${leads.size + 1}`; leads.set(input.phone, id); }
      return { id };
    },
    async appendSubmission(id) { activities.push(id); },
  };
  const parsed = validateEnquiry(valid);
  assert.equal(parsed.success, true);
  if (!parsed.success) return;
  const transaction = async (work: (repo: EnquiryRepository) => Promise<string>) => work(repository);
  const first = await persistEnquiry(parsed.data, transaction);
  const repeat = await persistEnquiry({ ...parsed.data, message: "Second request" }, transaction);
  assert.equal(first, repeat);
  assert.equal(leads.size, 1);
  assert.deepEqual(activities, [first, first]);
});

test("admin authorization denies missing sessions and editor sessions", () => {
  assert.equal(hasAdminAccess(null), false);
  assert.equal(hasAdminAccess({ user: { role: "editor" } }), false);
  assert.equal(hasAdminAccess({ user: { role: "admin" } }), true);
});
