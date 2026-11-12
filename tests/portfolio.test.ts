import assert from "node:assert/strict";
import test from "node:test";
import { validatePortfolioInput } from "../src/features/portfolio/validation";
import { publishedPortfolioWhere } from "../src/features/portfolio/visibility";

function fields(overrides: Record<string, string> = {}) {
  const form = new FormData();
  for (const [key, value] of Object.entries({
    title: "Verified client project", slug: "verified-client-project", clientName: "Approved Client",
    summary: "A verified project summary with enough useful context.",
    challenge: "The client needed an accessible site for its audience.",
    approach: "We designed and developed the approved website scope.",
    publicationApproved: "on", ...overrides,
  })) form.set(key, value);
  return form;
}

test("case studies save as drafts with partial story content", () => {
  const result = validatePortfolioInput(fields({ clientName: "", summary: "", challenge: "", approach: "", publicationApproved: "" }));
  assert.equal(result.success, true);
});

test("publishing needs substantive content and explicit approval", () => {
  const result = validatePortfolioInput(fields({ challenge: "", publicationApproved: "" }), "publish");
  assert.equal(result.success, false);
  if (!result.success) {
    assert.ok(result.fields.challenge);
    assert.ok(result.fields.publicationApproved);
  }
});

test("reserved slugs and unsafe project URLs are rejected", () => {
  assert.equal(validatePortfolioInput(fields({ slug: "contact" })).success, false);
  assert.equal(validatePortfolioInput(fields({ projectUrl: "javascript:alert(1)" })).success, false);
});

test("public portfolio query requires published, approved, and due records", () => {
  const now = new Date("2026-10-12T00:00:00Z");
  assert.deepEqual(publishedPortfolioWhere(now), { status: "PUBLISHED", approvedAt: { not: null }, publishedAt: { lte: now } });
});
