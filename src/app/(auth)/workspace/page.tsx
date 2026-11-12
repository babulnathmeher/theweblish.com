import { redirect } from "next/navigation";
import { requireContentStaff } from "@/lib/require-content-staff";

export default async function WorkspaceEntryPage() {
  const session = await requireContentStaff();
  redirect(session.user.role === "admin" ? "/admin/" : "/studio/");
}
