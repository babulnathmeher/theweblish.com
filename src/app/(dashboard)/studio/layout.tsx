import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { StudioShell } from "@/components/studio/studio-shell";
import { requireContentStaff } from "@/lib/require-content-staff";
import "@/app/admin.css";

export const metadata: Metadata = { title: "Content studio", robots: { index: false, follow: false } };

export default async function StudioLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await requireContentStaff();
  if (session.user.role === "admin") redirect("/admin/");
  return <StudioShell user={{ name: session.user.name || "Team member", role: session.user.role as "editor" | "author" }}>{children}</StudioShell>;
}
