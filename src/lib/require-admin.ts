import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { hasAdminAccess } from "@/lib/authorization";

export async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/admin/login/");
  if (!hasAdminAccess(session)) redirect("/admin/login/?denied=1");
  return session;
}
