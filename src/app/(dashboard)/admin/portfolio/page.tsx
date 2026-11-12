/* eslint-disable @next/next/no-img-element -- Media URLs come from configured object storage. */
import Link from "next/link";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export default async function PortfolioPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; page?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 100) : "";
  const status: "DRAFT" | "PUBLISHED" | "" = params.status === "DRAFT" || params.status === "PUBLISHED" ? params.status : "";
  const requestedPage = Number(params.page);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? Math.min(requestedPage, 100000) : 1;
  const perPage = 20;
  const where: Prisma.PortfolioProjectWhereInput = { ...(status ? { status } : {}), ...(q ? { OR: [
    { title: { contains: q } }, { clientName: { contains: q } }, { slug: { contains: q } },
  ] } : {}) };
  let available = true;
  let total = 0;
  let published = 0;
  let drafts = 0;
  let projects: { id: string; title: string; slug: string; clientName: string; status: "DRAFT" | "PUBLISHED"; updatedAt: Date; coverMedia: { url: string; altText: string | null } | null }[] = [];
  try {
    [total, published, drafts, projects] = await Promise.all([
      prisma.portfolioProject.count({ where }),
      prisma.portfolioProject.count({ where: { status: "PUBLISHED" } }),
      prisma.portfolioProject.count({ where: { status: "DRAFT" } }),
      prisma.portfolioProject.findMany({ where, orderBy: { updatedAt: "desc" }, skip: (page - 1) * perPage, take: perPage, include: { coverMedia: { select: { url: true, altText: true } } } }),
    ]);
  } catch {
    available = false;
  }
  const pages = Math.max(1, Math.ceil(total / perPage));
  const url = (nextPage: number) => `/admin/portfolio/?${new URLSearchParams({ ...(q ? { q } : {}), ...(status ? { status } : {}), page: String(nextPage) })}`;

  return <main className="admin-portfolio-page"><div className="admin-page-heading"><div><p className="admin-eyebrow">CONTENT / PORTFOLIO</p><h1>Client work, <em>with context.</em></h1><p>Prepare accurate case studies, review them privately, and publish only approved stories.</p></div>{available && <Link href="/admin/portfolio/new/" className="admin-primary-link">New case study <span aria-hidden="true">↗</span></Link>}</div>
    {!available && <p className="admin-info-banner" role="status">Portfolio editing is waiting for the checked-in database migration. Existing website pages remain available.</p>}
    <div className="admin-portfolio-stats"><div><span>ALL CASE STUDIES</span><strong>{available ? published + drafts : "—"}</strong><small>Managed project records</small></div><div><span>PUBLISHED</span><strong>{available ? published : "—"}</strong><small>Approved client stories</small></div><div><span>PRIVATE DRAFTS</span><strong>{available ? drafts : "—"}</strong><small>Only visible to administrators</small></div></div>
    <section className="admin-portfolio-panel" aria-labelledby="portfolio-list-title"><div className="admin-panel-head"><div><p className="admin-eyebrow">PROJECT LIBRARY</p><h2 id="portfolio-list-title">Manage case studies</h2></div><span className="admin-services-count">{available ? total : "—"} matching</span></div>
      <form action="/admin/portfolio/" method="get" className="admin-portfolio-filters"><label>Search projects<input name="q" defaultValue={q} maxLength={100} placeholder="Title, client, or slug" /></label><label>Status<select name="status" defaultValue={status}><option value="">All statuses</option><option value="DRAFT">Drafts</option><option value="PUBLISHED">Published</option></select></label><button type="submit">Apply filters</button></form>
      {available && (projects.length ? <div className="admin-portfolio-table-wrap"><table className="admin-portfolio-table"><caption className="sr-only">Portfolio case studies</caption><thead><tr><th scope="col">Project</th><th scope="col">Client</th><th scope="col">Status</th><th scope="col">Updated</th><th scope="col">Actions</th></tr></thead><tbody>{projects.map((project) => <tr key={project.id}><td><div className="admin-portfolio-project-cell"><span className="admin-portfolio-thumb">{project.coverMedia ? <img src={project.coverMedia.url} alt={project.coverMedia.altText || ""} /> : <span aria-hidden="true">TW</span>}</span><span><Link href={`/admin/portfolio/${project.id}/edit/`}>{project.title}</Link><small>/{project.slug}/</small></span></div></td><td>{project.clientName || <span className="admin-portfolio-muted">Not added</span>}</td><td><span className={`admin-post-status ${project.status === "PUBLISHED" ? "is-live" : "is-draft"}`}><span aria-hidden="true" />{project.status === "PUBLISHED" ? "Published" : "Draft"}</span></td><td><time dateTime={project.updatedAt.toISOString()}>{project.updatedAt.toLocaleDateString("en-IN")}</time></td><td><div className="admin-portfolio-row-actions"><Link href={`/admin/portfolio/${project.id}/edit/`}>Edit</Link><Link href={`/admin/portfolio/${project.id}/preview/`} target="_blank" rel="noopener noreferrer">Preview ↗</Link></div></td></tr>)}</tbody></table></div> : <div className="admin-services-empty"><span aria-hidden="true">◇</span><h3>{q || status ? "No matching case studies" : "Start with a real project"}</h3><p>{q || status ? "Try another search or status." : "Create a draft using approved project details. Nothing is published automatically."}</p>{!q && !status && <Link href="/admin/portfolio/new/">Create a case study ↗</Link>}</div>)}
      {available && total > perPage && <nav className="admin-portfolio-pagination" aria-label="Portfolio pages"><span>Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total}</span><div>{page > 1 && <Link href={url(page - 1)}>Previous</Link>}{page < pages && <Link href={url(page + 1)}>Next</Link>}</div></nav>}
    </section>
  </main>;
}
