import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { hasAdminAccess } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { mediaStorage, storageConfig } from "@/features/media/storage";

export const runtime = "nodejs";

async function readSmallJson(request: Request): Promise<unknown> {
  if (!request.body) throw new Error("Missing body");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 2048) { await reader.cancel(); throw new Error("Body too large"); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Authentication required." }, { status: 401 });
  if (!hasAdminAccess(session)) return Response.json({ error: "Access denied." }, { status: 403 });
  if (request.headers.get("origin") !== new URL(request.url).origin) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return Response.json({ error: "Send JSON data." }, { status: 415 });
  const { id } = await params;
  if (!id || id.length > 64) return Response.json({ error: "Invalid image." }, { status: 400 });
  let body: unknown;
  try { body = await readSmallJson(request); }
  catch { return Response.json({ error: "Invalid image details." }, { status: 400 }); }
  if (!body || typeof body !== "object" || !("altText" in body) || typeof body.altText !== "string") {
    return Response.json({ error: "Enter valid alternative text." }, { status: 422 });
  }
  const altText = body.altText.trim();
  if (altText.length > 255) return Response.json({ error: "Alternative text must be 255 characters or fewer." }, { status: 422 });
  try {
    const media = await prisma.media.update({ where: { id }, data: { altText: altText || null }, select: { id: true, altText: true } });
    return Response.json({ media }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2025") return Response.json({ error: "Image not found." }, { status: 404 });
    console.error("Media details update failed");
    return Response.json({ error: "Could not save image details." }, { status: 503 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Authentication required." }, { status: 401 });
  if (!hasAdminAccess(session)) return Response.json({ error: "Access denied." }, { status: 403 });
  if (request.headers.get("origin") !== new URL(request.url).origin) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  const { id } = await params;
  if (!id || id.length > 64) return Response.json({ error: "Invalid image." }, { status: 400 });
  const config = storageConfig();
  if (!config) return Response.json({ error: "Object storage must be configured before an image can be deleted." }, { status: 503 });

  try {
    const media = await prisma.media.findUnique({ where: { id }, select: { storageKey: true, _count: { select: { posts: true, portfolioProjects: true } } } });
    if (!media) return Response.json({ error: "Image not found." }, { status: 404 });
    if (media._count.posts > 0 || media._count.portfolioProjects > 0) {
      return Response.json({ error: "Remove this image from every blog post and portfolio project before deleting it." }, { status: 409 });
    }

    // The relation condition closes the gap between checking usage and deleting metadata.
    const deleted = await prisma.media.deleteMany({ where: { id, posts: { none: {} }, portfolioProjects: { none: {} } } });
    if (!deleted.count) return Response.json({ error: "This image is now in use. Remove it from its posts or portfolio projects first." }, { status: 409 });

    try {
      await mediaStorage(config).delete(media.storageKey);
    } catch {
      console.error("Media object cleanup failed", { mediaId: id, storageKey: media.storageKey });
      return Response.json({ deleted: true, warning: "Image removed from the library, but storage cleanup needs attention." }, { headers: { "Cache-Control": "no-store" } });
    }
    return Response.json({ deleted: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    console.error("Media deletion failed");
    return Response.json({ error: "Could not delete the image. Please try again." }, { status: 503 });
  }
}
