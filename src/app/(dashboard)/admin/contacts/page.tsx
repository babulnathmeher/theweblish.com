import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { TablePagination } from "@/components/admin/table-pagination";

const statuses = ["NEW", "READ", "REPLIED", "ARCHIVED"] as const;
const DEFAULT_PAGE_SIZE = 25;
const PAGE_SIZES = [10, 25, 50, 100];
const dateFormatter = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

export default async function ContactsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; page?: string; perPage?: string }> }) {
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
    ...(q ? { OR: [{ name: { contains: q } }, { email: { contains: q } }, { phone: { contains: q } }, { subject: { contains: q } }, { message: { contains: q } }] } : {}),
  };
  const [total, unread, active, filtered] = await Promise.all([
    prisma.contactMessage.count(),
    prisma.contactMessage.count({ where: { status: "NEW" } }),
    prisma.contactMessage.count({ where: { status: { in: ["READ", "REPLIED"] } } }),
    prisma.contactMessage.count({ where }),
  ]);
  const pages = Math.max(1, Math.ceil(filtered / pageSize));
  const page = Math.min(requestedPage, pages);
  const contacts = await prisma.contactMessage.findMany({
    where, orderBy: [{ createdAt: "desc" }, { id: "desc" }], skip: (page - 1) * pageSize, take: pageSize,
    select: { id: true, name: true, email: true, phone: true, subject: true, status: true, sourcePage: true, createdAt: true },
  });
  function href(nextStatus: string | undefined, nextPage = 1) {
    const search = new URLSearchParams();
    if (q) search.set("q", q);
    if (nextStatus) search.set("status", nextStatus);
    if (pageSize !== DEFAULT_PAGE_SIZE) search.set("perPage", String(pageSize));
    if (nextPage > 1) search.set("page", String(nextPage));
    return `/admin/contacts/${search.size ? `?${search}` : ""}`;
  }
  return <main className="admin-contacts-page">
    <div className="admin-page-heading"><div><p className="admin-eyebrow">INBOX / GENERAL CONTACT</p><h1>Contact <em>messages.</em></h1><p>Review general enquiries, update their status, and add private notes. Sales leads stay in the enquiries workspace.</p></div><Link className="admin-primary-link" href="/contact/" target="_blank" rel="noopener noreferrer">View public form <span aria-hidden="true">↗</span></Link></div>
    <div className="admin-services-stats"><div><span>ALL MESSAGES</span><strong>{total}</strong><small>Every contact submission</small></div><div><span>NEW</span><strong>{unread}</strong><small>Awaiting first review</small></div><div><span>IN CONVERSATION</span><strong>{active}</strong><small>Read or replied</small></div></div>
    <section className="admin-posts-panel" aria-labelledby="contact-manager-title"><div className="admin-posts-panel-heading"><div><span>CONTACT INBOX</span><h2 id="contact-manager-title">Manage messages</h2></div><p>{filtered} {filtered === 1 ? "message" : "messages"} found</p></div>
      <nav className="admin-post-tabs" aria-label="Filter contact messages by status"><Link href={href(undefined)} className={!status ? "is-active" : ""} aria-current={!status ? "page" : undefined}>All <span>{total}</span></Link>{statuses.map((item) => <Link key={item} href={href(item)} className={status === item ? "is-active" : ""} aria-current={status === item ? "page" : undefined}>{item.charAt(0) + item.slice(1).toLowerCase()}</Link>)}</nav>
      <form className="admin-ticket-filters" action="/admin/contacts/" method="get">{status && <input type="hidden" name="status" value={status} />}<input type="hidden" name="perPage" value={pageSize} /><label>Search sender, email, phone, subject, or message<input name="q" defaultValue={q} maxLength={100} placeholder="Search contact messages" /></label><button type="submit">Search messages</button>{q && <Link href={href(status)}>Clear search</Link>}</form>
      <div className="admin-posts-table-wrap"><table className="admin-ticket-table admin-contact-table"><caption className="sr-only">Contact messages</caption><thead><tr><th scope="col">Sender</th><th scope="col">Subject</th><th scope="col">Source</th><th scope="col">Status</th><th scope="col">Received</th><th scope="col">Action</th></tr></thead><tbody>{contacts.map((contact) => <tr key={contact.id}><td><Link className="admin-ticket-reference" href={`/admin/contacts/${contact.id}/`}>{contact.name}</Link><small>{contact.email}</small>{contact.phone && <small>{contact.phone}</small>}</td><td><strong>{contact.subject || "General message"}</strong></td><td><span className="admin-contact-source" title={contact.sourcePage || ""}>{contact.sourcePage ? (() => { try { return new URL(contact.sourcePage).pathname; } catch { return contact.sourcePage; } })() : "—"}</span></td><td><span className={`admin-ticket-status is-${contact.status.toLowerCase()}`}>{contact.status.charAt(0) + contact.status.slice(1).toLowerCase()}</span></td><td><time dateTime={contact.createdAt.toISOString()}>{dateFormatter.format(contact.createdAt)}</time></td><td><Link className="admin-ticket-open" href={`/admin/contacts/${contact.id}/`}>Open message <span aria-hidden="true">↗</span></Link></td></tr>)}{!contacts.length && <tr><td colSpan={6}><div className="admin-posts-empty"><strong>No messages found</strong><p>{total ? "Try another search or status." : "New contact messages will appear here."}</p>{total > 0 && <Link href="/admin/contacts/">Clear filters</Link>}</div></td></tr>}</tbody></table></div>
      <TablePagination path="/admin/contacts/" filters={{ ...(q ? { q } : {}), ...(status ? { status } : {}) }} page={page} perPage={pageSize} total={filtered} label="Contact messages" />
    </section>
  </main>;
}
