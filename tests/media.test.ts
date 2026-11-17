import assert from "node:assert/strict";
import test from "node:test";
import { MAX_IMAGE_BYTES, validateImage } from "../src/features/media/validation";
import { trustedRequestOrigin } from "../src/lib/request-origin";

test("upload validation requires an allowed type and matching file signature", () => {
  const png = Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10, 0]);
  assert.deepEqual(validateImage(png, "image/png"), { ok: true, extension: "png", mimeType: "image/png" });
  assert.equal(validateImage(png, "image/jpeg").ok, false);
  assert.equal(validateImage(Uint8Array.from([60, 115, 99, 114, 105, 112, 116, 62]), "image/png").ok, false);
});

test("upload validation rejects empty and oversized files", () => {
  assert.equal(validateImage(new Uint8Array(), "image/png").ok, false);
  assert.equal(validateImage(new Uint8Array(MAX_IMAGE_BYTES + 1), "image/png").ok, false);
});

test("origin validation trusts configured public origins behind a reverse proxy", () => {
  const request = new Request("http://internal-host:3000/api/uploads", { headers: { origin: "https://theweblish.com" } });
  const environment = { NEXT_PUBLIC_SITE_URL: "https://theweblish.com", BETTER_AUTH_URL: "https://theweblish.com", NODE_ENV: "production" };
  assert.equal(trustedRequestOrigin(request, environment), "https://theweblish.com");
  assert.equal(trustedRequestOrigin(new Request(request.url, { headers: { origin: "https://evil.example" } }), environment), null);
  assert.equal(trustedRequestOrigin(new Request(request.url), environment), null);
});
