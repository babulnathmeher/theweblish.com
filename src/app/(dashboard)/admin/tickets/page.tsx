import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { TablePagination } from "@/components/admin/table-pagination";
import { TicketStorageUnavailable } from "@/components/admin/ticket-storage-unavailable";
import { isMissingTicketTable } from "@/features/tickets/database-error";

const statuses = ["OPEN", "IN_PROGRESS", "WAITING_ON_CLIENT", "RESOLVED", "CLOSED"] as const;
const DEFAULT_PAGE_SIZE = 25;
const PAGE_SIZES = [10, 25, 50, 100];
const dateFormatter = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; page?: string; perPage?: string }> }) {
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
    ...(q ? { OR: [{ reference: { contains: q } }, { name: { contains: q } }, { email: { contains: q } }, { subject: { contains: q } }] } : {}),
  };
  let ticketData;
  try {
    const [total, open, active, filtered] = await Promise.all([
      prisma.supportTicket.count(),
      prisma.supportTicket.count({ where: { status: "OPEN" } }),
      prisma.supportTicket.count({ where: { status: { in: ["IN_PROGRESS", "WAITING_ON_CLIENT"] } } }),
      prisma.supportTicket.count({ where }),
    ]);
    const pages = Math.max(1, Math.ceil(filtered / pageSize));
    const page = Math.min(requestedPage, pages);
    const tickets = await prisma.supportTicket.findMany({
      where, orderBy: [{ createdAt: "desc" }, { id: "desc" }], skip: (page - 1) * pageSize, take: pageSize,
      select: { id: true, reference: true, name: true, email: true, category: true, subject: true, status: true, createdAt: true },
    });
    ticketData = { total, open, active, filtered, page, tickets };
  } catch (error) {
    if (isMissingTicketTable(error)) return <TicketStorageUnavailable />;
    throw error;
  }
  const { total, open, active, filtered, page, tickets } = ticketData;
  function href(nextStatus: string | undefined, nextPage = 1) {
    const search = new URLSearchParams();
    if (q) search.set("q", q);
    if (nextStatus) search.set("status", nextStatus);
    if (pageSize !== DEFAULT_PAGE_SIZE) search.set("perPage", String(pageSize));
    if (nextPage > 1) search.set("page", String(nextPage));
    return `/admin/tickets/${search.size ? `?${search}` : ""}`;
  }

  return <main className="admin-tickets-page">
    <div className="admin-page-heading"><div><p className="admin-eyebrow">CLIENT CARE / SUPPORT</p><h1>Support <em>tickets.</em></h1><p>Review reported issues, update progress, and keep an internal activity record.</p></div><Link className="admin-primary-link" href="/support/" target="_blank" rel="noopener noreferrer">View public form <span aria-hidden="true">↗</span></Link></div>
    <div className="admin-services-stats"><div><span>ALL TICKETS</span><strong>{total}</strong><small>Every client request</small></div><div><span>NEEDS TRIAGE</span><strong>{open}</strong><small>New and unassigned</small></div><div><span>IN PROGRESS</span><strong>{active}</strong><small>In progress or awaiting client</small></div></div>
    <section className="admin-posts-panel" aria-labelledby="ticket-manager-title">
      <div className="admin-posts-panel-heading"><div><span>SUPPORT INBOX</span><h2 id="ticket-manager-title">Manage requests</h2></div><p>{filtered} {filtered === 1 ? "ticket" : "tickets"} found</p></div>
      <nav className="admin-post-tabs" aria-label="Filter tickets by status"><Link href={href(undefined)} className={!status ? "is-active" : ""} aria-current={!status ? "page" : undefined}>All <span>{total}</span></Link>{statuses.map((item) => <Link key={item} href={href(item)} className={status === item ? "is-active" : ""} aria-current={status === item ? "page" : undefined}>{item.replaceAll("_", " ")}</Link>)}</nav>
      <form className="admin-ticket-filters" action="/admin/tickets/" method="get">{status && <input type="hidden" name="status" value={status} />}<input type="hidden" name="perPage" value={pageSize} /><label>Search reference, client, or issue<input name="q" defaultValue={q} maxLength={100} placeholder="Search tickets" /></label><button type="submit">Search tickets</button>{q && <Link href={href(status)}>Clear search</Link>}</form>
      <div className="admin-posts-table-wrap"><table className="admin-ticket-table"><caption className="sr-only">Support tickets</caption><thead><tr><th scope="col">Reference</th><th scope="col">Issue</th><th scope="col">Client</th><th scope="col">Status</th><th scope="col">Received</th><th scope="col">Action</th></tr></thead><tbody>
        {tickets.map((ticket) => <tr key={ticket.id}><td><Link className="admin-ticket-reference" href={`/admin/tickets/${ticket.id}/`}>{ticket.reference}</Link></td><td><strong>{ticket.subject}</strong><small>{ticket.category}</small></td><td><strong>{ticket.name}</strong><small>{ticket.email}</small></td><td><span className={`admin-ticket-status is-${ticket.status.toLowerCase()}`}>{ticket.status.replaceAll("_", " ")}</span></td><td><time dateTime={ticket.createdAt.toISOString()}>{dateFormatter.format(ticket.createdAt)}</time></td><td><Link className="admin-ticket-open" href={`/admin/tickets/${ticket.id}/`}>Open ticket <span aria-hidden="true">↗</span></Link></td></tr>)}
        {!tickets.length && <tr><td colSpan={6}><div className="admin-posts-empty"><strong>No tickets found</strong><p>{total ? "Try a different search or status." : "Submitted support requests will appear here."}</p>{total > 0 && <Link href="/admin/tickets/">Clear filters</Link>}</div></td></tr>}
      </tbody></table></div>
      <TablePagination path="/admin/tickets/" filters={{ ...(q ? { q } : {}), ...(status ? { status } : {}) }} page={page} perPage={pageSize} total={filtered} label="Tickets" />
    </section>
  </main>;
}
