import type { Metadata } from "next";
import { requireAdmin } from "@/lib/require-admin";
import { AdminShell } from "@/components/admin/admin-shell";
import "@/app/admin.css";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await requireAdmin();
  return <AdminShell user={{ name: session.user.name || "Administrator", email: session.user.email }}>{children}</AdminShell>;
}
