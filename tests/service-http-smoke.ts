import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { prisma } from "../src/lib/prisma";

const base = process.env.SMOKE_BASE_URL || "http://localhost:3000";
const slug = `test-service-${randomUUID().slice(0, 8)}`;
const publicPath = `/digital-solution/${slug}/`;

function actionFields(html: string, marker: string) {
  const form = [...html.matchAll(/<form\b[\s\S]*?<\/form>/g)].map((match) => match[0]).find((item) => item.includes(marker));
  assert.ok(form, `Form missing: ${marker}`);
  const fields: Record<string, string> = {};
  for (const match of form.matchAll(/<input type="hidden" name="([^"]+)"(?: value="([^"]*)")?\s*\/>/g)) {
    if (match[1].startsWith("$ACTION_")) fields[match[1]] = (match[2] ?? "").replaceAll("&quot;", '"').replaceAll("&amp;", "&");
  }
  assert.ok(Object.keys(fields).length, "Server action fields missing");
  return fields;
}

async function postForm(path: string, action: Record<string, string>, values: Record<string, string>, cookie?: string) {
  const form = new FormData();
  for (const [key, value] of Object.entries(action)) form.set(key, value);
  for (const [key, value] of Object.entries(values)) form.set(key, value);
  return fetch(base + path, { method: "POST", redirect: "manual", headers: { origin: base, ...(cookie ? { cookie } : {}) }, body: form });
}

const fields = {
  title: "Temporary service smoke test", slug, eyebrow: "Test service", category: "Websites", icon: "browser",
  summary: "A temporary service used to verify the administrator saving workflow.",
  content: "## Test scope\n\nThis temporary description verifies that service drafts can be saved and published safely.",
  seoTitle: "", seoDescription: "", intent: "save",
};

try {
  assert.equal((await fetch(base + publicPath)).status, 404);
  assert.equal((await fetch(`${base}/admin/services/new/`, { redirect: "manual" })).status, 307);
  const signIn = await fetch(`${base}/api/auth/sign-in/email`, {
    method: "POST", headers: { "content-type": "application/json", origin: base },
    body: JSON.stringify({ email: process.env.ADMIN_SEED_EMAIL, password: process.env.ADMIN_SEED_PASSWORD }),
  });
  assert.equal(signIn.status, 200, "Development administrator sign-in failed");
  const cookie = signIn.headers.getSetCookie().map((value) => value.split(";")[0]).join("; ");
  const newPage = await fetch(`${base}/admin/services/new/`, { headers: { cookie } });
  assert.equal(newPage.status, 200);
  const newHtml = await newPage.text();
  assert.ok(!newHtml.includes("Saving is unavailable until the service migration"), "Service CMS remains disabled");
  const createAction = actionFields(newHtml, "admin-service-editor");
  const denied = await postForm("/admin/services/new/", createAction, fields);
  assert.ok([302, 303, 307, 308].includes(denied.status), "Anonymous creation must redirect");
  assert.equal(await prisma.service.count({ where: { slug } }), 0);

  const created = await postForm("/admin/services/new/", createAction, fields, cookie);
  assert.ok([302, 303, 307, 308].includes(created.status), `Creation returned ${created.status}`);
  const service = await prisma.service.findUniqueOrThrow({ where: { slug } });
  assert.equal(service.status, "DRAFT");
  assert.equal((await fetch(base + publicPath)).status, 404, "Draft must remain private");

  const editPath = `/admin/services/${service.id}/edit/`;
  const editPage = await fetch(base + editPath, { headers: { cookie } });
  assert.equal(editPage.status, 200);
  const editAction = actionFields(await editPage.text(), "admin-service-editor");
  const published = await postForm(editPath, editAction, { ...fields, id: service.id, intent: "publish" }, cookie);
  assert.ok([302, 303, 307, 308].includes(published.status), `Publication returned ${published.status}`);
  assert.equal((await prisma.service.findUniqueOrThrow({ where: { id: service.id } })).status, "PUBLISHED");
  assert.equal((await fetch(base + publicPath)).status, 200);

  const unpublished = await postForm(editPath, editAction, { ...fields, id: service.id, intent: "unpublish" }, cookie);
  assert.ok([302, 303, 307, 308].includes(unpublished.status), `Unpublish returned ${unpublished.status}`);
  assert.equal((await fetch(base + publicPath)).status, 404);

  const freshEdit = await (await fetch(base + editPath, { headers: { cookie } })).text();
  const deleted = await postForm(editPath, actionFields(freshEdit, 'name="confirm"'), { id: service.id, confirm: "DELETE" }, cookie);
  assert.ok([302, 303, 307, 308].includes(deleted.status), `Deletion returned ${deleted.status}`);
  assert.equal(await prisma.service.count({ where: { slug } }), 0);
  console.log("Service HTTP smoke passed: authorized save, draft privacy, publication, unpublishing, deletion, and anonymous denial.");
} finally {
  await prisma.service.deleteMany({ where: { slug } });
  await prisma.$disconnect();
}
