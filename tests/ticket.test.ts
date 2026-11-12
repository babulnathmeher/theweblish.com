import assert from "node:assert/strict";
import test from "node:test";
import { validateTicket } from "../src/features/tickets/validation";
import { createTicketReference } from "../src/features/tickets/reference";

const valid = {
  name: "Client Name", email: "client@example.com", phone: "+91 98765 43210", websiteUrl: "https://example.com/problem",
  category: "Website issue", subject: "Page fails to load", description: "The page shows an error after I submit the form.",
  sourcePage: "https://example.com/support/", consent: true, website: "",
};

test("support ticket validation requires a useful issue and consent", () => {
  assert.equal(validateTicket(valid).success, true);
  const noConsent = validateTicket({ ...valid, consent: false });
  assert.equal(noConsent.success, false);
  if (!noConsent.success) assert.ok(noConsent.fields.consent);
  const shortDescription = validateTicket({ ...valid, description: "Broken" });
  assert.equal(shortDescription.success, false);
  if (!shortDescription.success) assert.ok(shortDescription.fields.description);
});

test("support ticket validation rejects spam, extra fields, and unsafe URLs", () => {
  assert.equal(validateTicket({ ...valid, website: "bot" }).success, false);
  assert.equal(validateTicket({ ...valid, role: "admin" }).success, false);
  assert.equal(validateTicket({ ...valid, websiteUrl: "javascript:alert(1)" }).success, false);
});

test("support tickets require phone and website URL with readable errors", () => {
  const noPhone = validateTicket({ ...valid, phone: "" });
  assert.equal(noPhone.success, false);
  if (!noPhone.success) assert.equal(noPhone.fields.phone, "Enter your phone number.");
  const noUrl = validateTicket({ ...valid, websiteUrl: "" });
  assert.equal(noUrl.success, false);
  if (!noUrl.success) assert.equal(noUrl.fields.websiteUrl, "Enter your website URL.");
  const invalidPhone = validateTicket({ ...valid, phone: "abc" });
  assert.equal(invalidPhone.success, false);
  if (!invalidPhone.success) assert.equal(invalidPhone.fields.phone, "Enter a valid phone number.");
  const shortName = validateTicket({ ...valid, name: "A" });
  assert.equal(shortName.success, false);
  if (!shortName.success) assert.equal(shortName.fields.name, "Enter your name (at least 2 characters).");
});

test("support references are printable and different", () => {
  const first = createTicketReference();
  const second = createTicketReference();
  assert.match(first, /^TW-[A-F0-9]{16}$/);
  assert.notEqual(first, second);
});
