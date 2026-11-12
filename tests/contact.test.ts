import assert from "node:assert/strict";
import test from "node:test";
import { validateContact } from "../src/features/contacts/validation";

const valid = { name: "Test Sender", email: "sender@example.com", phone: "+91 98765 43210", subject: "Hello", message: "A message long enough to send.", sourcePage: "https://example.com/contact/", consent: true, website: "" };

test("contact validation requires consent and a meaningful message", () => {
  assert.equal(validateContact(valid).success, true);
  const noConsent = validateContact({ ...valid, consent: false });
  assert.equal(noConsent.success, false);
  if (!noConsent.success) assert.ok(noConsent.fields.consent);
  const shortMessage = validateContact({ ...valid, message: "short" });
  assert.equal(shortMessage.success, false);
  if (!shortMessage.success) assert.ok(shortMessage.fields.message);
});

test("contact validation rejects honeypot and unexpected fields", () => {
  assert.equal(validateContact({ ...valid, website: "spam" }).success, false);
  assert.equal(validateContact({ ...valid, admin: true }).success, false);
});

test("contact requires a phone and uses clear field errors", () => {
  const noPhone = validateContact({ ...valid, phone: "" });
  assert.equal(noPhone.success, false);
  if (!noPhone.success) assert.equal(noPhone.fields.phone, "Enter your phone number.");
  const shortName = validateContact({ ...valid, name: "A" });
  assert.equal(shortName.success, false);
  if (!shortName.success) assert.equal(shortName.fields.name, "Enter your name (at least 2 characters).");
  const invalidPhone = validateContact({ ...valid, phone: "abc" });
  assert.equal(invalidPhone.success, false);
  if (!invalidPhone.success) assert.equal(invalidPhone.fields.phone, "Enter a valid phone number.");
});
