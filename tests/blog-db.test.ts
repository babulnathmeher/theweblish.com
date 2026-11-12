import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { prisma } from "../src/lib/prisma";
import { publishedFilter } from "../src/features/blogs/visibility";

test("database public query hides drafts and future posts", async () => {
  const author = await prisma.user.findFirstOrThrow({ where: { role: "admin" }, select: { id: true } });
  const prefix = `test-${randomUUID().slice(0, 8)}`;
  const slugs = [`${prefix}-draft`, `${prefix}-future`, `${prefix}-public`];
  try {
    await prisma.blogPost.createMany({ data: [
      { slug: slugs[0], title: "Draft", content: "Draft body", authorId: author.id, status: "DRAFT" },
      { slug: slugs[1], title: "Future", content: "Future body", authorId: author.id, status: "PUBLISHED", publishedAt: new Date(Date.now() + 86_400_000) },
      { slug: slugs[2], title: "Public", content: "Public body", authorId: author.id, status: "PUBLISHED", publishedAt: new Date(Date.now() - 60_000) },
    ] });
    const visible = await prisma.blogPost.findMany({ where: { slug: { in: slugs }, ...publishedFilter() }, select: { slug: true } });
    assert.deepEqual(visible.map((post) => post.slug), [slugs[2]]);
  } finally {
    await prisma.blogPost.deleteMany({ where: { slug: { in: slugs } } });
    await prisma.$disconnect();
  }
});
