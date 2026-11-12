import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { prisma } from "../src/lib/prisma";

const base = process.env.SMOKE_BASE_URL || "http://localhost:3220";
const slug = `test-portfolio-${randomUUID().slice(0, 8)}`;
let projectId = "";

function actionFields(html: string) {
  const formHtml = [...html.matchAll(/<form\b[\s\S]*?<\/form>/g)].map((match) => match[0]).find((form) => form.includes("admin-portfolio-editor"));
  assert.ok(formHtml, "Portfolio editor form missing");
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

const fields = {
  title: "Temporary portfolio smoke project", slug, clientName: "Test client", industry: "Test",
  services: "Design and development", projectUrl: "", summary: "A project summary for the temporary HTTP smoke test.",
  challenge: "The test client needed a clear website to explain its work.",
  approach: "The team created a reviewed structure and developed the site.",
  outcome: "", coverMediaId: "", seoTitle: "", seoDescription: "",
};

try {
  assert.equal((await fetch(`${base}/admin/portfolio/`, { redirect: "manual" })).status, 307);
  assert.equal((await fetch(`${base}/admin/portfolio/new/`, { redirect: "manual" })).status, 307);
  const signIn = await fetch(`${base}/api/auth/sign-in/email`, { method: "POST", headers: { "content-type": "application/json", origin: base }, body: JSON.stringify({ email: process.env.ADMIN_SEED_EMAIL, password: process.env.ADMIN_SEED_PASSWORD }) });
  assert.equal(signIn.status, 200, "Development administrator sign-in failed");
  const cookie = signIn.headers.getSetCookie().map((value) => value.split(";")[0]).join("; ");
  const existingMedia = await prisma.media.findFirst({ select: { id: true } });
  if (existingMedia) fields.coverMediaId = existingMedia.id;
  const newPage = await fetch(`${base}/admin/portfolio/new/`, { headers: { cookie } });
  assert.equal(newPage.status, 200);
  const createAction = actionFields(await newPage.text());
  const anonymousCreate = await postForm("/admin/portfolio/new/", createAction, fields);
  assert.ok([302, 303, 307, 308].includes(anonymousCreate.status));
  assert.equal(await prisma.portfolioProject.count({ where: { slug } }), 0);
  const created = await postForm("/admin/portfolio/new/", createAction, fields, cookie);
  assert.ok([302, 303, 307, 308].includes(created.status), `Create returned ${created.status}`);
  const project = await prisma.portfolioProject.findUniqueOrThrow({ where: { slug } });
  projectId = project.id;
  assert.equal(project.status, "DRAFT");
  assert.equal(project.coverMediaId, fields.coverMediaId || null);
  assert.ok(!(await (await fetch(`${base}/our-clients/`)).text()).includes(fields.title));

  const editPath = `/admin/portfolio/${projectId}/edit/`;
  assert.equal((await fetch(base + editPath, { redirect: "manual" })).status, 307);
  const editHtml = await (await fetch(base + editPath, { headers: { cookie } })).text();
  const editAction = actionFields(editHtml);
  const anonymousPublish = await postForm(editPath, editAction, { ...fields, id: projectId, intent: "publish", publicationApproved: "on" });
  assert.ok([302, 303, 307, 308].includes(anonymousPublish.status));
  assert.equal((await prisma.portfolioProject.findUniqueOrThrow({ where: { id: projectId } })).status, "DRAFT");
  await postForm(editPath, editAction, { ...fields, id: projectId, intent: "publish", publicationApproved: "on" }, cookie);
  assert.equal((await prisma.portfolioProject.findUniqueOrThrow({ where: { id: projectId } })).status, "PUBLISHED");
  const publicHtml = await (await fetch(`${base}/our-clients/`)).text();
  assert.ok(publicHtml.includes(fields.title));
  assert.ok(publicHtml.includes("noindex"));
  await postForm(editPath, editAction, { ...fields, id: projectId, intent: "unpublish" }, cookie);
  assert.equal((await prisma.portfolioProject.findUniqueOrThrow({ where: { id: projectId } })).status, "DRAFT");
  assert.ok(!(await (await fetch(`${base}/our-clients/`)).text()).includes(fields.title));
  console.log("Portfolio HTTP smoke passed: admin creation, anonymous denial, draft privacy, publication, and unpublishing.");
} finally {
  if (projectId) await prisma.portfolioProject.deleteMany({ where: { id: projectId } });
  await prisma.$disconnect();
}
