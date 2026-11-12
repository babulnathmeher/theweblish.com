import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { prisma } from "../src/lib/prisma";

test("an image referenced by a portfolio project cannot be removed by the media deletion query", async () => {
  const token = randomUUID();
  const media = await prisma.media.create({
    data: {
      storageKey: `test-media/${token}.png`,
      url: `https://example.com/test-media/${token}.png`,
      mimeType: "image/png",
      fileName: "temporary-test-image.png",
      sizeBytes: 1,
    },
  });
  try {
    const project = await prisma.portfolioProject.create({
      data: {
        slug: `test-media-usage-${token.slice(0, 8)}`,
        title: "Temporary media usage test",
        clientName: "Test client",
        summary: "Temporary portfolio image relation test.",
        challenge: "Temporary challenge.",
        approach: "Temporary approach.",
        coverMediaId: media.id,
      },
    });
    try {
      const result = await prisma.media.deleteMany({
        where: { id: media.id, posts: { none: {} }, portfolioProjects: { none: {} } },
      });
      assert.equal(result.count, 0);
      assert.ok(await prisma.media.findUnique({ where: { id: media.id } }));
    } finally {
      await prisma.portfolioProject.delete({ where: { id: project.id } });
    }
    const result = await prisma.media.deleteMany({
      where: { id: media.id, posts: { none: {} }, portfolioProjects: { none: {} } },
    });
    assert.equal(result.count, 1);
  } finally {
    await prisma.media.deleteMany({ where: { id: media.id } });
    await prisma.$disconnect();
  }
});
