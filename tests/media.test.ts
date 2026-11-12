import assert from "node:assert/strict";
import test from "node:test";
import { MAX_IMAGE_BYTES, validateImage } from "../src/features/media/validation";

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
