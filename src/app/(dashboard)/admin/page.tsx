import { requireAdmin } from "@/lib/require-admin";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export default async function Page() {
  await requireAdmin();
  return <AdminDashboard />;
}
