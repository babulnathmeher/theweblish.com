import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { prisma } from "../src/lib/prisma";

const base = process.env.SMOKE_BASE_URL || "http://localhost:3217";
const slug = `test-blog-${randomUUID().slice(0, 8)}`;
const contactEmail = `test-${randomUUID().slice(0, 8)}@example.com`;
const author = await prisma.user.findFirstOrThrow({ where: { role: "admin" } });
const fields = { title: "Temporary test article", slug, excerpt: "Test excerpt", content: "# Heading\n\nSafe body. <script>window.XSS_TEST=1</script> [bad](javascript:alert(1))", seoTitle: "Test SEO", seoDescription: "Test description", authorId: author.id, coverMediaId: "" };
function actionFields(html: string, marker: string) {
  const formHtml = [...html.matchAll(/<form\b[\s\S]*?<\/form>/g)].map((match) => match[0]).find((form) => form.includes(marker));
  assert.ok(formHtml, `Form missing: ${marker}`);
  const fields: Record<string, string> = {};
  for (const match of formHtml.matchAll(/<input type="hidden" name="([^"]+)"(?: value="([^"]*)")?\s*\/>/g)) {
    if (match[1].startsWith("$ACTION_")) fields[match[1]] = (match[2] ?? "").replaceAll("&quot;", '"').replaceAll("&amp;", "&");
  }
  assert.ok(Object.keys(fields).length, "Server action fields missing");
  return fields;
}
async function postForm(path: string, action: Record<string, string>, values: Record<string, string>, cookie?: string) {
  const form = new FormData();
  for (const [name, value] of Object.entries(action)) form.set(name, value);
  for (const [name, value] of Object.entries(values)) form.set(name, value);
  return fetch(base + path, { method: "POST", redirect: "manual", headers: { origin: base, ...(cookie ? { cookie } : {}) }, body: form });
}

try {
  assert.equal((await fetch(`${base}/${slug}/`)).status, 404);
  const signIn = await fetch(`${base}/api/auth/sign-in/email`, { method: "POST", headers: { "content-type": "application/json", origin: base }, body: JSON.stringify({ email: process.env.ADMIN_SEED_EMAIL, password: process.env.ADMIN_SEED_PASSWORD }) });
  assert.equal(signIn.status, 200);
  const cookie = signIn.headers.getSetCookie().map((value) => value.split(";")[0]).join("; ");
  const newPage = await fetch(`${base}/admin/blogs/new/`, { headers: { cookie } });
  assert.equal(newPage.status, 200);
  const createId = actionFields(await newPage.text(), "admin-blog-form");
  const anonymousCreate = await postForm("/admin/blogs/new/", createId, fields);
  assert.ok([302, 303, 307, 308].includes(anonymousCreate.status));
  assert.equal(await prisma.blogPost.count({ where: { slug } }), 0);
  const created = await postForm("/admin/blogs/new/", createId, fields, cookie);
  assert.ok([302, 303, 307, 308].includes(created.status), `Create returned ${created.status}`);
  const post = await prisma.blogPost.findUniqueOrThrow({ where: { slug } });
  assert.equal(post.status, "DRAFT");
  assert.equal((await fetch(`${base}/${slug}/`)).status, 404);
  assert.equal((await fetch(`${base}/admin/blogs/${post.id}/preview/`, { redirect: "manual" })).status, 307);
  assert.equal((await fetch(`${base}/admin/blogs/${post.id}/preview/`, { headers: { cookie } })).status, 200);

  const editPath = `/admin/blogs/${post.id}/edit/`;
  const editPage = await fetch(base + editPath, { headers: { cookie } });
  assert.equal(editPage.status, 200);
  const editHtml = await editPage.text();
  const editId = actionFields(editHtml, "admin-blog-form");
  const anonymousPublish = await postForm(editPath, editId, { ...fields, id: post.id, intent: "publish" });
  assert.ok([302, 303, 307, 308].includes(anonymousPublish.status));
  assert.equal((await prisma.blogPost.findUniqueOrThrow({ where: { id: post.id } })).status, "DRAFT");
  const published = await postForm(editPath, editId, { ...fields, id: post.id, intent: "publish" }, cookie);
  assert.equal(published.status, 200, `Publish returned ${published.status}`);
  assert.equal((await prisma.blogPost.findUniqueOrThrow({ where: { id: post.id } })).status, "PUBLISHED");
  const publicPage = await fetch(`${base}/${slug}/`);
  assert.equal(publicPage.status, 200);
  const publicHtml = await publicPage.text();
  assert.ok(!publicHtml.includes("<script>window.XSS_TEST"));
  assert.ok(!publicHtml.includes('href="javascript:'));
  const sitemap = await (await fetch(`${base}/sitemap.xml`)).text();
  assert.ok(sitemap.includes(`/${slug}/`));

  const unpublished = await postForm(editPath, editId, { ...fields, id: post.id, intent: "unpublish" }, cookie);
  assert.equal(unpublished.status, 200);
  assert.equal((await fetch(`${base}/${slug}/`)).status, 404);
  const freshEditHtml = await (await fetch(base + editPath, { headers: { cookie } })).text();
  const deleted = await postForm(editPath, actionFields(freshEditHtml, "admin-blog-delete"), { id: post.id, confirm: "DELETE" }, cookie);
  assert.ok([302, 303, 307, 308].includes(deleted.status));
  assert.equal(await prisma.blogPost.count({ where: { id: post.id } }), 0);
  assert.equal((await fetch(`${base}/admin/contacts/`, { redirect: "manual" })).status, 307);
  assert.equal((await fetch(`${base}/api/uploads/`, { method: "POST", headers: { origin: base } })).status, 401);
  const storageConfigured = ["S3_ENDPOINT", "S3_REGION", "S3_BUCKET", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY", "MEDIA_PUBLIC_BASE_URL"].every((name) => Boolean(process.env[name]));
  assert.equal((await fetch(`${base}/api/uploads/`, { method: "POST", headers: { origin: base, cookie } })).status, storageConfigured ? 415 : 503);
  const contactPayload = { name: "Smoke Sender", email: contactEmail, phone: "9876543210", subject: "HTTP smoke", message: "A valid message for contact smoke testing.", consent: true, sourcePage: `${base}/contact/`, website: "" };
  async function sendContact(payload: unknown) {
    return fetch(`${base}/api/contact/`, { method: "POST", headers: { origin: base, "content-type": "application/json" }, body: JSON.stringify(payload) });
  }
  assert.equal((await sendContact({ ...contactPayload, consent: false })).status, 422);
  assert.equal((await sendContact({ ...contactPayload, website: "spam" })).status, 422);
  assert.equal((await sendContact({ ...contactPayload, sourcePage: `${base}/admin/` })).status, 422);
  assert.equal((await sendContact(contactPayload)).status, 201);
  const contact = await prisma.contactMessage.findFirstOrThrow({ where: { email: contactEmail } });
  assert.ok(contact.consentAt);
  const filteredInbox = await fetch(`${base}/admin/contacts/?q=${encodeURIComponent(contactEmail)}&status=NEW&perPage=10`, { headers: { cookie } });
  assert.equal(filteredInbox.status, 200);
  const filteredHtml = await filteredInbox.text();
  assert.ok(filteredHtml.includes(`/admin/contacts/${contact.id}/`));
  assert.ok(filteredHtml.includes('<option value="10" selected="">'));
  const detailPath = `/admin/contacts/${contact.id}/`;
  assert.equal((await fetch(base + detailPath, { redirect: "manual" })).status, 307);
  const detail = await fetch(base + detailPath, { headers: { cookie } });
  assert.equal(detail.status, 200);
  const detailHtml = await detail.text();
  const noAuthStatus = await postForm(detailPath, actionFields(detailHtml, 'name="status"'), { id: contact.id, status: "READ" });
  assert.ok([302, 303, 307, 308].includes(noAuthStatus.status));
  assert.equal((await prisma.contactMessage.findUniqueOrThrow({ where: { id: contact.id } })).status, "NEW");
  const updated = await postForm(detailPath, actionFields(detailHtml, 'name="status"'), { id: contact.id, status: "READ" }, cookie);
  assert.equal(updated.status, 200);
  assert.equal((await prisma.contactMessage.findUniqueOrThrow({ where: { id: contact.id } })).status, "READ");
  const noLongerNew = await (await fetch(`${base}/admin/contacts/?q=${encodeURIComponent(contactEmail)}&status=NEW`, { headers: { cookie } })).text();
  assert.ok(!noLongerNew.includes(`/admin/contacts/${contact.id}/`));
  const note = await postForm(detailPath, actionFields(detailHtml, 'name="note"'), { id: contact.id, note: "Internal smoke note" }, cookie);
  assert.equal(note.status, 200);
  assert.equal(await prisma.contactActivity.count({ where: { contactId: contact.id } }), 2);
  console.log("HTTP smoke passed: blog visibility/actions, contact validation/inbox/actions, and upload restrictions.");
} finally {
  await prisma.blogPost.deleteMany({ where: { slug } });
  await prisma.contactMessage.deleteMany({ where: { email: contactEmail } });
  await prisma.$disconnect();
}
