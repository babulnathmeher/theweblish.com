import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { contentRole } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Authentication required." }, { status: 401 });
  if (!contentRole(session)) return Response.json({ error: "Access denied." }, { status: 403 });
  const params = new URL(request.url).searchParams;
  const page = Number(params.get("page") || "1");
  const query = (params.get("q") || "").trim();
  if (!Number.isSafeInteger(page) || page < 1 || page > 10000 || query.length > 100) return Response.json({ error: "Invalid search." }, { status: 400 });
  const where = query ? { fileName: { contains: query } } : {};
  try {
    const [items, total] = await Promise.all([
      prisma.media.findMany({ where, select: { id: true, fileName: true, url: true, altText: true }, orderBy: { createdAt: "desc" }, skip: (page - 1) * 24, take: 24 }),
      prisma.media.count({ where }),
    ]);
    return Response.json({ items, total, page, pages: Math.ceil(total / 24) }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    console.error("Media library query failed");
    return Response.json({ error: "Could not load the media library." }, { status: 503 });
  }
}
