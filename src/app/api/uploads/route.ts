import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { contentRole } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { mediaStorage, storageConfig } from "@/features/media/storage";
import { MAX_IMAGE_BYTES, validateImage } from "@/features/media/validation";

export const runtime = "nodejs";
const MAX_REQUEST_BYTES = MAX_IMAGE_BYTES + 64 * 1024;

async function readBody(request: Request): Promise<Uint8Array | null> {
  if (!request.body) return null;
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_REQUEST_BYTES) { await reader.cancel(); return null; }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  return Buffer.concat(chunks);
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Authentication required." }, { status: 401 });
  if (!contentRole(session) || session.user.role === "author") return Response.json({ error: "Access denied." }, { status: 403 });
  const config = storageConfig();
  if (!config) return Response.json({ error: "Media storage is not configured." }, { status: 503 });
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().startsWith("multipart/form-data;")) return Response.json({ error: "Send multipart form data." }, { status: 415 });
  if (Number(request.headers.get("content-length") || 0) > MAX_REQUEST_BYTES) return Response.json({ error: "Image is too large." }, { status: 413 });
  const body = await readBody(request);
  if (!body) return Response.json({ error: "Image is too large." }, { status: 413 });
  let form: FormData;
  try { form = await new Request(request.url, { method: "POST", headers: { "content-type": contentType }, body: Uint8Array.from(body).buffer }).formData(); }
  catch { return Response.json({ error: "Invalid upload." }, { status: 400 }); }
  const file = form.get("file");
  const altText = String(form.get("altText") || "").trim();
  if (!(file instanceof File) || file.name.length > 255 || altText.length > 255) return Response.json({ error: "Invalid image fields." }, { status: 422 });
  const bytes = new Uint8Array(await file.arrayBuffer());
  const validated = validateImage(bytes, file.type);
  if (!validated.ok) return Response.json({ error: validated.error }, { status: 422 });
  const storage = mediaStorage(config);
  let uploaded: { key: string; url: string };
  try { uploaded = await storage.put(bytes, validated.mimeType, validated.extension); }
  catch { console.error("Media upload failed"); return Response.json({ error: "Could not upload image." }, { status: 503 }); }
  try {
    const media = await prisma.media.create({ data: { storageKey: uploaded.key, url: uploaded.url, mimeType: validated.mimeType, fileName: file.name, altText: altText || null, sizeBytes: bytes.length }, select: { id: true, url: true, fileName: true, altText: true } });
    return Response.json({ media }, { status: 201 });
  } catch {
    console.error("Media metadata persistence failed");
    try { await storage.delete(uploaded.key); } catch { console.error("Media cleanup failed"); }
    return Response.json({ error: "Could not save image metadata." }, { status: 503 });
  }
}
