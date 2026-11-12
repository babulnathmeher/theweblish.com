import { validateContact } from "@/features/contacts/validation";
import { prisma } from "@/lib/prisma";
import { consumeEnquiryRateLimit } from "@/lib/rate-limit";
import { notifyContact } from "@/lib/email";

export const runtime = "nodejs";
const MAX_BODY_BYTES = 8192;

async function readBody(request: Request): Promise<string | null> {
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) { await reader.cancel(); return null; }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  return new TextDecoder().decode(Buffer.concat(chunks));
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return Response.json({ error: "Send JSON." }, { status: 415 });
  if (Number(request.headers.get("content-length") || 0) > MAX_BODY_BYTES) return Response.json({ error: "Request is too large." }, { status: 413 });
  const body = await readBody(request);
  if (body === null) return Response.json({ error: "Request is too large." }, { status: 413 });
  let payload: unknown;
  try { payload = JSON.parse(body); } catch { return Response.json({ error: "Invalid JSON." }, { status: 400 }); }
  const result = validateContact(payload);
  if (!result.success) return Response.json({ error: "Check the form fields.", fields: result.fields }, { status: 422 });
  const source = new URL(result.data.sourcePage);
  if (source.origin !== origin || source.pathname !== "/contact/" || source.username || source.password) {
    return Response.json({ error: "Invalid source page." }, { status: 422 });
  }
  try {
    if (!await consumeEnquiryRateLimit(`contact:email:${result.data.email.toLowerCase()}`)) return Response.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    const ip = process.env.TRUST_PROXY_IP_HEADER === "true" ? request.headers.get("x-real-ip") : null;
    if (ip && !await consumeEnquiryRateLimit(`contact:ip:${ip}`)) return Response.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    const contact = await prisma.contactMessage.create({ data: {
      name: result.data.name, email: result.data.email.toLowerCase(), phone: result.data.phone,
      subject: result.data.subject || null, message: result.data.message,
      sourcePage: result.data.sourcePage, consentAt: new Date(),
    }, select: { id: true } });
    try { await notifyContact(contact.id, result.data); }
    catch { console.error("Contact notification failed"); }
    return Response.json({ success: true, message: "Thank you. Your message has been received." }, { status: 201 });
  } catch {
    console.error("Contact persistence failed");
    return Response.json({ error: "We could not receive your message right now. Please try again later." }, { status: 503 });
  }
}
