import Link from "next/link";
import { TablePagination } from "@/components/admin/table-pagination";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

const statuses = ["NEW", "CONTACTED", "QUALIFIED", "CLOSED"] as const;
const DEFAULT_PAGE_SIZE = 25;
const PAGE_SIZES = [10, 25, 50, 100];
const dateFormatter = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

function sourceLabel(sourcePage: string, utmSource: string | null) {
  if (utmSource) return utmSource;
  try { return new URL(sourcePage).pathname; } catch { return sourcePage; }
}

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; page?: string; perPage?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 100) : "";
  const status = statuses.find((value) => value === params.status);
  const requestedSize = Number(params.perPage);
  const pageSize = PAGE_SIZES.includes(requestedSize) ? requestedSize : DEFAULT_PAGE_SIZE;
  const requested = Number(params.page || 1);
  const requestedPage = Number.isSafeInteger(requested) && requested > 0 ? Math.min(requested, 10000) : 1;
  const where = {
    ...(status ? { status } : {}),
    ...(q ? { OR: [
      { name: { contains: q } }, { phone: { contains: q } }, { email: { contains: q } },
      { serviceInterest: { contains: q } }, { sourcePage: { contains: q } }, { utmSource: { contains: q } },
    ] } : {}),
  };
  const [total, newCount, active, filtered] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { status: "NEW" } }),
    prisma.lead.count({ where: { status: { in: ["CONTACTED", "QUALIFIED"] } } }),
    prisma.lead.count({ where }),
  ]);
  const pages = Math.max(1, Math.ceil(filtered / pageSize));
  const page = Math.min(requestedPage, pages);
  const leads = await prisma.lead.findMany({
    where, orderBy: [{ updatedAt: "desc" }, { id: "desc" }], skip: (page - 1) * pageSize, take: pageSize,
    select: { id: true, name: true, phone: true, email: true, status: true, serviceInterest: true, budgetRange: true, sourcePage: true, utmSource: true, updatedAt: true },
  });

  function href(nextStatus: string | undefined) {
    const search = new URLSearchParams();
    if (q) search.set("q", q);
    if (nextStatus) search.set("status", nextStatus);
    if (pageSize !== DEFAULT_PAGE_SIZE) search.set("perPage", String(pageSize));
    return `/admin/leads/${search.size ? `?${search}` : ""}`;
  }

  return <main className="admin-leads-page">
    <div className="admin-page-heading"><div><p className="admin-eyebrow">INBOX / SALES ENQUIRIES</p><h1>Sales <em>leads.</em></h1><p>Review website enquiries, follow up, and keep an internal activity record.</p></div><Link className="admin-primary-link" href="/website-development/" target="_blank" rel="noopener noreferrer">View enquiry form <span aria-hidden="true">↗</span></Link></div>
    <div className="admin-services-stats"><div><span>ALL LEADS</span><strong>{total}</strong><small>Every unique prospect</small></div><div><span>NEW</span><strong>{newCount}</strong><small>Awaiting first review</small></div><div><span>IN PROGRESS</span><strong>{active}</strong><small>Contacted or qualified</small></div></div>
    <section className="admin-posts-panel" aria-labelledby="lead-manager-title">
      <div className="admin-posts-panel-heading"><div><span>ENQUIRY INBOX</span><h2 id="lead-manager-title">Manage leads</h2></div><p>{filtered} {filtered === 1 ? "lead" : "leads"} found</p></div>
      <nav className="admin-post-tabs" aria-label="Filter leads by status"><Link href={href(undefined)} className={!status ? "is-active" : ""} aria-current={!status ? "page" : undefined}>All <span>{total}</span></Link>{statuses.map((item) => <Link key={item} href={href(item)} className={status === item ? "is-active" : ""} aria-current={status === item ? "page" : undefined}>{item.charAt(0) + item.slice(1).toLowerCase()}</Link>)}</nav>
      <form className="admin-ticket-filters" action="/admin/leads/" method="get">{status && <input type="hidden" name="status" value={status} />}<input type="hidden" name="perPage" value={pageSize} /><label>Search name, phone, email, service, or source<input name="q" defaultValue={q} maxLength={100} placeholder="Search leads" /></label><button type="submit">Search leads</button>{q && <Link href={href(status)}>Clear search</Link>}</form>
      <div className="admin-posts-table-wrap"><table className="admin-ticket-table admin-lead-table"><caption className="sr-only">Sales leads</caption><thead><tr><th scope="col">Prospect</th><th scope="col">Phone</th><th scope="col">Interest</th><th scope="col">Source</th><th scope="col">Status</th><th scope="col">Updated</th><th scope="col">Action</th></tr></thead><tbody>{leads.map((lead) => <tr key={lead.id}><td><Link className="admin-ticket-reference" href={`/admin/leads/${lead.id}/`}>{lead.name}</Link>{lead.email && <small>{lead.email}</small>}</td><td>{lead.phone}</td><td><strong>{lead.serviceInterest || "—"}</strong>{lead.budgetRange && <small>{lead.budgetRange}</small>}</td><td><span className="admin-contact-source" title={lead.utmSource || lead.sourcePage}>{sourceLabel(lead.sourcePage, lead.utmSource)}</span></td><td><span className={`admin-ticket-status is-${lead.status.toLowerCase()}`}>{lead.status.charAt(0) + lead.status.slice(1).toLowerCase()}</span></td><td><time dateTime={lead.updatedAt.toISOString()}>{dateFormatter.format(lead.updatedAt)}</time></td><td><Link className="admin-ticket-open" href={`/admin/leads/${lead.id}/`}>Open lead <span aria-hidden="true">↗</span></Link></td></tr>)}{!leads.length && <tr><td colSpan={7}><div className="admin-posts-empty"><strong>No leads found</strong><p>{total ? "Try another search or status." : "New website enquiries will appear here."}</p>{total > 0 && <Link href="/admin/leads/">Clear filters</Link>}</div></td></tr>}</tbody></table></div>
      <TablePagination path="/admin/leads/" filters={{ ...(q ? { q } : {}), ...(status ? { status } : {}) }} page={page} perPage={pageSize} total={filtered} label="Leads" />
    </section>
  </main>;
}
