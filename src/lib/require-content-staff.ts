import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { contentRole } from "@/lib/authorization";

export async function requireContentStaff() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/admin/login/");
  if (!contentRole(session)) redirect("/admin/login/?denied=1");
  return session;
}
