import "dotenv/config";
import assert from "node:assert/strict";
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { prisma } from "../src/lib/prisma";

const base = process.env.SMOKE_BASE_URL || "http://localhost:3000";
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9l8J8AAAAASUVORK5CYII=", "base64");
let mediaId = "";
let storageKey = "";
let cookie = "";

try {
  assert.ok(process.env.ADMIN_SEED_EMAIL && process.env.ADMIN_SEED_PASSWORD, "Development admin credentials are required.");
  assert.ok(["S3_ENDPOINT", "S3_REGION", "S3_BUCKET", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY", "MEDIA_PUBLIC_BASE_URL"].every((name) => Boolean(process.env[name])), "Object storage configuration is incomplete.");

  const anonymous = await fetch(`${base}/api/uploads/`, { method: "POST", headers: { origin: base } });
  assert.equal(anonymous.status, 401, "Anonymous upload must be denied.");

  const signIn = await fetch(`${base}/api/auth/sign-in/email`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: base },
    body: JSON.stringify({ email: process.env.ADMIN_SEED_EMAIL, password: process.env.ADMIN_SEED_PASSWORD }),
  });
  assert.equal(signIn.status, 200, "Development admin sign-in failed.");
  cookie = signIn.headers.getSetCookie().map((value) => value.split(";")[0]).join("; ");

  const invalid = new FormData();
  invalid.set("file", new File(["not an image"], "invalid.png", { type: "image/png" }));
  const rejected = await fetch(`${base}/api/uploads/`, { method: "POST", headers: { origin: base, cookie }, body: invalid });
  assert.equal(rejected.status, 422, "Invalid image bytes must be rejected.");

  const form = new FormData();
  form.set("file", new File([png], "temporary-storage-smoke.png", { type: "image/png" }));
  form.set("altText", "Temporary storage smoke test");
  const uploaded = await fetch(`${base}/api/uploads/`, { method: "POST", headers: { origin: base, cookie }, body: form });
  assert.equal(uploaded.status, 201, `Authorized upload returned ${uploaded.status}.`);
  const result = await uploaded.json();
  mediaId = result.media?.id || "";
  assert.ok(mediaId, "Upload did not return a media ID.");
  const media = await prisma.media.findUniqueOrThrow({ where: { id: mediaId }, select: { storageKey: true, url: true, mimeType: true } });
  storageKey = media.storageKey;
  assert.equal(media.mimeType, "image/png");
  const publicImage = await fetch(media.url);
  assert.equal(publicImage.status, 200, `Public image returned ${publicImage.status}.`);
  assert.match(publicImage.headers.get("content-type") || "", /^image\/png/i);
  assert.deepEqual(Buffer.from(await publicImage.arrayBuffer()), png);
  console.log("Storage smoke passed: anonymous denial, invalid-file rejection, authorized upload, metadata, and public image bytes.");
} finally {
  if (mediaId && cookie) {
    const removed = await fetch(`${base}/api/admin/media/${mediaId}/`, { method: "DELETE", headers: { origin: base, cookie } }).catch(() => null);
    const result = await removed?.json().catch(() => null);
    if (!removed?.ok || result?.warning) {
      // If the API cleanup failed, retry the test object directly and remove only its test metadata.
      if (storageKey) {
        try {
          const client = new S3Client({
            region: process.env.S3_REGION!,
            endpoint: process.env.S3_ENDPOINT!,
            forcePathStyle: true,
            credentials: { accessKeyId: process.env.S3_ACCESS_KEY_ID!, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY! },
          });
          await client.send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: storageKey }));
          await prisma.media.deleteMany({ where: { id: mediaId, posts: { none: {} }, portfolioProjects: { none: {} } } });
        } catch {
          console.error(`Temporary media cleanup needs manual review: media ID ${mediaId}.`);
        }
      }
    }
  }
  await prisma.$disconnect();
}
