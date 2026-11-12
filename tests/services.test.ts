import assert from "node:assert/strict";
import test from "node:test";
import { canUseServiceSlug, publishedServiceWhere, servicePath, validateServiceInput } from "../src/features/services/validation";

function input(slug = "conversion-strategy") {
  const data = new FormData();
  data.set("title", "Conversion strategy");
  data.set("slug", slug);
  data.set("eyebrow", "Strategy");
  data.set("summary", "A focused plan for understanding and improving the customer journey.");
  data.set("content", "## What we discuss\n\nWe review the current journey, the audience, and the next steps that are worth testing.");
  data.set("category", "Websites");
  data.set("icon", "layout");
  return data;
}

test("new service slugs cannot take established or reserved paths", () => {
  assert.equal(canUseServiceSlug("contact"), false);
  assert.equal(canUseServiceSlug("website-development"), false);
  assert.equal(canUseServiceSlug("web-design-company-in-bhubaneswar"), false);
  assert.equal(canUseServiceSlug("how-to-create-seo-friendly-website"), false);
  assert.equal(canUseServiceSlug("../admin"), false);
  assert.equal(canUseServiceSlug("conversion-strategy"), true);
  assert.equal(canUseServiceSlug("web-design-company-in-bhubaneswar", "web-design-company-in-bhubaneswar"), true);
  assert.equal(canUseServiceSlug("contact", "web-design-company-in-bhubaneswar"), false);
});

test("service input is validated before a draft can be saved", () => {
  assert.equal(validateServiceInput(input()).success, true);
  const short = input();
  short.set("summary", "Too short");
  const result = validateServiceInput(short);
  assert.equal(result.success, false);
  if (!result.success) assert.equal(result.fields.summary, "Add a useful service summary.");
  const badIcon = input();
  badIcon.set("icon", "script");
  assert.equal(validateServiceInput(badIcon).success, false);
});

test("published service filter excludes drafts and future publication times", () => {
  const now = new Date("2026-10-10T00:00:00Z");
  assert.deepEqual(publishedServiceWhere(now), { status: "PUBLISHED", publishedAt: { lte: now } });
  assert.equal(servicePath("web-design-company-in-bhubaneswar"), "/web-design-company-in-bhubaneswar/");
  assert.equal(servicePath("conversion-strategy"), "/digital-solution/conversion-strategy/");
});
