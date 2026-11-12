import "dotenv/config";
import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { verifyPassword } from "better-auth/crypto";
import { auth } from "../src/lib/auth";
import { prisma } from "../src/lib/prisma";

const base = process.env.SMOKE_BASE_URL || "http://localhost:3000";
const email = `test-settings-${randomUUID().slice(0, 8)}@example.com`;
const firstPassword = `${randomBytes(20).toString("base64url")}A1!`;
const secondPassword = `${randomBytes(20).toString("base64url")}B2!`;

async function signIn(password: string) {
  return fetch(`${base}/api/auth/sign-in/email`, {
    method: "POST", headers: { "content-type": "application/json", origin: base },
    body: JSON.stringify({ email, password }),
  });
}

function cookie(response: Response) {
  return response.headers.getSetCookie().map((value) => value.split(";")[0]).join("; ");
}

try {
  assert.equal((await fetch(`${base}/admin/settings/`, { redirect: "manual" })).status, 307);
  const anonymousChange = await fetch(`${base}/api/auth/change-password`, {
    method: "POST", headers: { "content-type": "application/json", origin: base },
    body: JSON.stringify({ currentPassword: firstPassword, newPassword: secondPassword }),
  });
  assert.equal(anonymousChange.status, 401);

  await auth.api.createUser({ body: { email, password: firstPassword, name: "Temporary settings test", role: "admin" } });
  const primary = await signIn(firstPassword);
  assert.equal(primary.status, 200);
  const primaryCookie = cookie(primary);
  const user = await prisma.user.findUniqueOrThrow({ where: { email }, select: { id: true } });
  const otherToken = randomUUID();
  await prisma.session.create({ data: { userId: user.id, token: otherToken, expiresAt: new Date(Date.now() + 60 * 60 * 1000) } });
  assert.equal((await fetch(`${base}/admin/settings/`, { headers: { cookie: primaryCookie } })).status, 200);

  const changed = await fetch(`${base}/api/auth/change-password`, {
    method: "POST", headers: { "content-type": "application/json", origin: base, cookie: primaryCookie },
    body: JSON.stringify({ currentPassword: firstPassword, newPassword: secondPassword, revokeOtherSessions: true }),
  });
  assert.equal(changed.status, 200, `Password change returned ${changed.status}`);
  const credential = await prisma.account.findFirstOrThrow({ where: { userId: user.id, providerId: "credential" }, select: { password: true } });
  assert.ok(credential.password);
  assert.equal(await verifyPassword({ hash: credential.password, password: firstPassword }), false);
  assert.equal(await verifyPassword({ hash: credential.password, password: secondPassword }), true);
  assert.equal(await prisma.session.count({ where: { token: otherToken } }), 0);
  assert.equal((await fetch(`${base}/admin/settings/`, { headers: { cookie: primaryCookie } })).status, 200);
  console.log("Settings HTTP smoke passed: admin access, password rotation, old-password denial, and other-session revocation.");
} finally {
  await prisma.user.deleteMany({ where: { email } });
  await prisma.$disconnect();
}
