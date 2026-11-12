import { notifyLead } from "@/lib/email";
import { consumeEnquiryRateLimit } from "@/lib/rate-limit";
import { saveEnquiry } from "@/features/leads/service";
import { validateEnquiry } from "@/features/leads/validation";

export const runtime = "nodejs";
const MAX_BODY_BYTES = 8192;

async function readLimitedBody(request: Request): Promise<string | null> {
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
  if (!origin || origin !== new URL(request.url).origin) {
    return Response.json({ error: "Invalid request origin." }, { status: 403 });
  }
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return Response.json({ error: "Send JSON." }, { status: 415 });
  }
  const length = Number(request.headers.get("content-length") || 0);
  if (length > MAX_BODY_BYTES) return Response.json({ error: "Request is too large." }, { status: 413 });
  const body = await readLimitedBody(request);
  if (body === null) return Response.json({ error: "Request is too large." }, { status: 413 });
  let payload: unknown;
  try { payload = JSON.parse(body); } catch { return Response.json({ error: "Invalid JSON." }, { status: 400 }); }
  const result = validateEnquiry(payload);
  if (!result.success) return Response.json({ error: "Check the form fields.", fields: result.fields }, { status: 422 });

  const source = new URL(result.data.landingPageUrl);
  if (source.origin !== origin || source.pathname !== "/website-development/" || source.username || source.password) {
    return Response.json({ error: "Invalid landing page URL." }, { status: 422 });
  }

  try {
    if (!await consumeEnquiryRateLimit(`phone:${result.data.phone}`)) {
      return Response.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }
    // Trust this header only when the deployment proxy is configured to overwrite it.
    const ip = process.env.TRUST_PROXY_IP_HEADER === "true" ? request.headers.get("x-real-ip") : null;
    if (ip && !await consumeEnquiryRateLimit(`ip:${ip}`)) {
      return Response.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }
    const leadId = await saveEnquiry(result.data);
    try { await notifyLead(leadId, result.data); }
    catch { console.error("Lead notification failed"); }
    return Response.json({ success: true, message: "Thank you. Your enquiry has been received." }, { status: 201 });
  } catch {
    console.error("Enquiry persistence failed");
    return Response.json({ error: "We could not receive your enquiry right now. Please try again later." }, { status: 503 });
  }
}
