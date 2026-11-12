import Link from "next/link";
import { redirect } from "next/navigation";
import { ServiceEditor, type ServiceEditorValues } from "@/components/admin/service-editor";
import { servicePages } from "@/config/service-pages";
import { serviceVisuals } from "@/config/service-visuals";
import { createService } from "@/features/services/actions";
import { isCoreServiceSlug } from "@/features/services/validation";
import { serviceCmsEnabled } from "@/features/services/config";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export default async function NewServicePage({ searchParams }: { searchParams: Promise<{ legacy?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const legacySlug = typeof params.legacy === "string" && isCoreServiceSlug(params.legacy) ? params.legacy : undefined;
  if (legacySlug && serviceCmsEnabled()) {
    let existingId: string | undefined;
    try {
      const existing = await prisma.service.findUnique({ where: { slug: legacySlug }, select: { id: true } });
      existingId = existing?.id;
    } catch { /* The editor shows a save error until the migration is available. */ }
    if (existingId) redirect(`/admin/services/${existingId}/edit/`);
  }
  const core = legacySlug ? servicePages[legacySlug] : null;
  const visual = legacySlug ? serviceVisuals[legacySlug] : null;
  const values: ServiceEditorValues | undefined = core && visual ? { title: core.title, slug: legacySlug!, eyebrow: core.eyebrow, summary: core.intro, content: core.topics.map(([title, description]) => `## ${title}\n\n${description}`).join("\n\n"), category: visual.category, icon: visual.icon, seoTitle: null, seoDescription: null, indexable: false } : undefined;
  return <main className="admin-service-edit-page"><div className="admin-page-heading"><div><p className="admin-eyebrow">SERVICES / {legacySlug ? "CUSTOMIZE PAGE" : "NEW SERVICE"}</p><h1>{legacySlug ? "Customize a service." : "Create a service."}</h1><p>{legacySlug ? "The established URL stays the same. Your draft will not replace the public page until you publish it." : "Start with a draft, review the preview, then publish when the content is ready."}</p></div><Link href="/admin/services/" className="admin-service-back">← All services</Link></div>{!serviceCmsEnabled() && <p className="admin-info-banner">Saving is unavailable until the service migration has been applied and `SERVICE_CMS_ENABLED` is enabled on a healthy database.</p>}<ServiceEditor action={createService} values={values} legacySlug={legacySlug} /></main>;
}
