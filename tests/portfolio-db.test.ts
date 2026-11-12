import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { prisma } from "../src/lib/prisma";
import { publishedPortfolioWhere } from "../src/features/portfolio/visibility";

test("portfolio drafts, publication, and unpublishing persist correctly", async () => {
  const admin = await prisma.user.findFirstOrThrow({ where: { role: "admin" }, select: { id: true } });
  const slug = `test-portfolio-${randomUUID().slice(0, 8)}`;
  let id = "";
  try {
    const draft = await prisma.portfolioProject.create({ data: {
      slug, title: "Test client project", clientName: "Test client", summary: "A project summary used for the database test.",
      challenge: "The client needed a clear and accessible project website.",
      approach: "The team planned and developed the approved project scope.",
    } });
    id = draft.id;
    assert.equal(draft.status, "DRAFT");
    assert.equal(await prisma.portfolioProject.count({ where: { id, ...publishedPortfolioWhere() } }), 0);
    const published = await prisma.portfolioProject.update({ where: { id }, data: {
      status: "PUBLISHED", publishedAt: new Date(Date.now() - 1000), approvedAt: new Date(), approvedById: admin.id,
    } });
    assert.equal(published.approvedById, admin.id);
    assert.equal(await prisma.portfolioProject.count({ where: { id, ...publishedPortfolioWhere() } }), 1);
    await prisma.portfolioProject.update({ where: { id }, data: { status: "DRAFT", publishedAt: null, approvedAt: null, approvedById: null } });
    assert.equal(await prisma.portfolioProject.count({ where: { id, ...publishedPortfolioWhere() } }), 0);
  } finally {
    if (id) await prisma.portfolioProject.delete({ where: { id } });
    await prisma.$disconnect();
  }
});
