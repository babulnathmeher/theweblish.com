import Link from "next/link";
import { serviceNavigation } from "@/config/navigation";
import { servicePages } from "@/config/service-pages";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { isCoreServiceSlug, servicePath } from "@/features/services/validation";
import { serviceCmsEnabled } from "@/features/services/config";

type ManagedRow = { id: string; slug: string; title: string; summary: string; status: "DRAFT" | "PUBLISHED"; indexable: boolean; updatedAt: Date };

export default async function ServicesPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 100) : "";
  const status = params.status === "DRAFT" || params.status === "PUBLISHED" ? params.status : "";
  let managed: ManagedRow[] = [];
  let databaseAvailable = serviceCmsEnabled();
  if (databaseAvailable) {
    try {
      managed = await prisma.service.findMany({ orderBy: { updatedAt: "desc" }, take: 200, select: { id: true, slug: true, title: true, summary: true, status: true, indexable: true, updatedAt: true } });
    } catch {
      databaseAvailable = false;
    }
  }
  const core = serviceNavigation.filter((service) => isCoreServiceSlug(service.href.slice(1, -1)));
  const bySlug = new Map(managed.map((service) => [service.slug, service]));
  const filtered = managed.filter((service) => (!status || service.status === status) && (!q || `${service.title} ${service.slug} ${service.summary}`.toLowerCase().includes(q.toLowerCase())));
  const published = managed.filter((service) => service.status === "PUBLISHED").length;
  const drafts = managed.length - published;
  const publicCount = core.length + managed.filter((service) => service.status === "PUBLISHED" && !isCoreServiceSlug(service.slug)).length;

  return <main className="admin-services-page"><div className="admin-page-heading"><div><p className="admin-eyebrow">CONTENT / SERVICES</p><h1>Services <em>workspace.</em></h1><p>Shape the services people see, while keeping drafts private until they are ready.</p></div><Link href="/admin/services/new/" className="admin-primary-link">Create new service <span aria-hidden="true">↗</span></Link></div>
    {!databaseAvailable && <p className="admin-info-banner" role="status">Service editing is waiting for the service database migration and activation. The existing public service pages remain available.</p>}
    <div className="admin-services-stats"><div><span>PUBLIC SERVICES</span><strong>{databaseAvailable ? publicCount : core.length}</strong><small>Established pages and published additions</small></div><div><span>PUBLISHED UPDATES</span><strong>{databaseAvailable ? published : "—"}</strong><small>Managed content currently live</small></div><div><span>DRAFTS</span><strong>{databaseAvailable ? drafts : "—"}</strong><small>Visible only to admins</small></div></div>
    <section className="admin-services-section" aria-labelledby="managed-services-title"><div className="admin-panel-head"><div><p className="admin-eyebrow">YOUR WORKSPACE</p><h2 id="managed-services-title">Managed services</h2></div><span className="admin-services-count">{databaseAvailable ? managed.length : "—"} total</span></div>
      <form action="/admin/services/" className="admin-services-filter"><label><span>Search services</span><input name="q" defaultValue={q} maxLength={100} placeholder="Search by name or URL" /></label><label><span>Status</span><select name="status" defaultValue={status}><option value="">All statuses</option><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option></select></label><button type="submit">Apply filters ↗</button></form>
      {filtered.length ? <div className="admin-managed-list">{filtered.map((service) => <article className="admin-managed-row" key={service.id}><div className="admin-managed-symbol">{service.title.charAt(0).toUpperCase()}</div><div className="admin-managed-detail"><div><h3>{service.title}</h3><span className={`admin-service-status ${service.status === "PUBLISHED" ? "is-published" : ""}`}>{service.status === "PUBLISHED" ? "Published" : "Draft"}</span></div><p>{servicePath(service.slug)} · Updated {service.updatedAt.toLocaleDateString("en-IN")}</p></div><div className="admin-managed-actions"><Link href={`/admin/services/${service.id}/edit/`}>Edit service ↗</Link><Link href={`/admin/services/${service.id}/preview/`}>Preview</Link></div></article>)}</div> : <div className="admin-services-empty"><span aria-hidden="true">✳</span><h3>{q || status ? "No matching services" : "Your service drafts start here"}</h3><p>{q || status ? "Try a different search or status filter." : "Create a new service or customize one of the established pages below."}</p>{!q && !status && <Link href="/admin/services/new/">Create a service ↗</Link>}</div>}
      {managed.length === 200 && <p className="admin-services-limit">Showing the 200 most recently updated services.</p>}
    </section>
    <section className="admin-services-section" aria-labelledby="core-services-title"><div className="admin-panel-head"><div><p className="admin-eyebrow">ESTABLISHED PAGES</p><h2 id="core-services-title">Core services</h2></div><span className="admin-services-count">{core.length} preserved URLs</span></div><p className="admin-services-intro">These pages retain their current URLs. A published update changes the service copy while the original page structure stays available.</p><div className="admin-core-grid">{core.map((service, index) => { const slug = service.href.slice(1, -1); const custom = bySlug.get(slug); const content = servicePages[slug as keyof typeof servicePages]; return <article className="admin-core-card" key={slug}><div><span>{String(index + 1).padStart(2, "0")} / CORE SERVICE</span><span className={`admin-service-status ${custom?.status === "PUBLISHED" ? "is-published" : ""}`}>{custom ? custom.status === "PUBLISHED" ? "Managed live" : "Draft update" : "Original page"}</span></div><h3>{custom?.title || content.title}</h3><p>{custom?.summary || content.intro}</p><div><Link href={custom ? `/admin/services/${custom.id}/edit/` : `/admin/services/new/?legacy=${slug}`}>{custom ? "Manage content ↗" : "Customize page ↗"}</Link><Link href={service.href} target="_blank" rel="noopener noreferrer">View page ↗</Link></div></article>; })}</div></section>
    <p className="admin-services-footnote">The website-development quote page uses its own landing-page layout and is managed separately.</p>
  </main>;
}
