import Link from "next/link";
import { notFound } from "next/navigation";
import { ServiceEditor } from "@/components/admin/service-editor";
import { deleteService, updateService } from "@/features/services/actions";
import { isCoreServiceSlug } from "@/features/services/validation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export default async function EditServicePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ result?: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!id || id.length > 64) notFound();
  let service;
  try {
    service = await prisma.service.findUnique({ where: { id } });
  } catch {
    return <main><div className="admin-page-heading"><div><p className="admin-eyebrow">SERVICES / EDIT</p><h1>Service unavailable</h1></div></div><p className="admin-info-banner">The service database is unavailable. No changes were made.</p><Link href="/admin/services/">← All services</Link></main>;
  }
  if (!service) notFound();
  const result = (await searchParams).result;
  const resultMessage = result === "publish" ? "Service published." : result === "unpublish" ? "Service unpublished." : result === "save" ? "Changes saved." : "";
  return <main className="admin-service-edit-page"><div className="admin-page-heading"><div><p className="admin-eyebrow">SERVICES / EDIT</p><h1>Edit <em>{service.title}.</em></h1><p>Review the public preview before publishing changes.</p></div><Link href="/admin/services/" className="admin-service-back">← All services</Link></div>{resultMessage && <p role="status" className="admin-service-result">{resultMessage}</p>}<ServiceEditor action={updateService} values={service} legacySlug={isCoreServiceSlug(service.slug) ? service.slug : undefined} /><details className="admin-service-danger"><summary>Delete service</summary><div><h2>Delete this managed service?</h2><p>Deleting a core service update restores its original code-managed content. Deleting a new service removes its public page. This cannot be undone.</p><form action={deleteService}><input type="hidden" name="id" value={service.id} /><label>Type DELETE to confirm<input name="confirm" pattern="DELETE" required autoComplete="off" /></label><button type="submit">Delete permanently</button></form></div></details></main>;
}
