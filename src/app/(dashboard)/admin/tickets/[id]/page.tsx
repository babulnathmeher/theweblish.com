import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { addTicketNote, updateTicketStatus } from "@/features/tickets/actions";
import { TicketStorageUnavailable } from "@/components/admin/ticket-storage-unavailable";
import { isMissingTicketTable } from "@/features/tickets/database-error";

const statuses = ["OPEN", "IN_PROGRESS", "WAITING_ON_CLIENT", "RESOLVED", "CLOSED"] as const;

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  let ticket;
  try {
    ticket = await prisma.supportTicket.findUnique({ where: { id }, include: { activities: { orderBy: { createdAt: "desc" }, take: 100, include: { actor: { select: { name: true } } } } } });
  } catch (error) {
    if (isMissingTicketTable(error)) return <TicketStorageUnavailable />;
    throw error;
  }
  if (!ticket) notFound();
  return <main className="admin-ticket-detail">
    <Link className="admin-ticket-back" href="/admin/tickets/">← Back to support tickets</Link>
    <div className="admin-page-heading"><div><p className="admin-eyebrow">CLIENT CARE / TICKET DETAIL</p><h1>{ticket.reference}</h1><p>{ticket.subject}</p></div><span className={`admin-ticket-status is-${ticket.status.toLowerCase()}`}>{ticket.status.replaceAll("_", " ")}</span></div>
    <div className="admin-ticket-detail-grid">
      <div className="admin-ticket-main-column">
        <section className="admin-ticket-card" aria-labelledby="reported-issue"><div className="admin-ticket-card-heading"><span>01 / REQUEST</span><h2 id="reported-issue">Reported issue</h2></div><p className="admin-ticket-description">{ticket.description}</p><dl className="admin-ticket-facts"><div><dt>Issue type</dt><dd>{ticket.category}</dd></div><div><dt>Website</dt><dd><a href={ticket.websiteUrl} target="_blank" rel="noopener noreferrer">{ticket.websiteUrl} ↗</a></dd></div><div><dt>Source page</dt><dd>{ticket.sourcePage}</dd></div></dl></section>
        <section className="admin-ticket-card" aria-labelledby="ticket-activity"><div className="admin-ticket-card-heading"><span>02 / HISTORY</span><h2 id="ticket-activity">Activity &amp; internal notes</h2></div><ol className="admin-ticket-timeline">{ticket.activities.map((activity) => <li key={activity.id}><span className="admin-ticket-timeline-dot" aria-hidden="true" /><div><strong>{activity.type === "NOTE" ? "Internal note" : "Status changed"}</strong><time dateTime={activity.createdAt.toISOString()}>{activity.createdAt.toLocaleString("en-IN")}</time><p>By {activity.actor.name}</p>{activity.note && <p className="admin-ticket-note">{activity.note}</p>}{activity.type === "STATUS_CHANGE" && <p>{activity.fromStatus?.replaceAll("_", " ")} → {activity.toStatus?.replaceAll("_", " ")}</p>}</div></li>)}{!ticket.activities.length && <li><p>No internal activity yet.</p></li>}</ol></section>
      </div>
      <aside className="admin-ticket-side-column">
        <section className="admin-ticket-card" aria-labelledby="ticket-client"><div className="admin-ticket-card-heading"><span>CLIENT</span><h2 id="ticket-client">Contact details</h2></div><dl className="admin-ticket-facts"><div><dt>Name</dt><dd>{ticket.name}</dd></div><div><dt>Email</dt><dd><a href={`mailto:${ticket.email}`}>{ticket.email}</a></dd></div><div><dt>Phone</dt><dd>{ticket.phone || "—"}</dd></div><div><dt>Received</dt><dd>{ticket.createdAt.toLocaleString("en-IN")}</dd></div><div><dt>Consent recorded</dt><dd>{ticket.consentAt.toLocaleString("en-IN")}</dd></div></dl></section>
        <section className="admin-ticket-card" aria-labelledby="ticket-workflow"><div className="admin-ticket-card-heading"><span>WORKFLOW</span><h2 id="ticket-workflow">Update ticket</h2></div><form action={updateTicketStatus} className="admin-ticket-action-form"><input type="hidden" name="id" value={ticket.id} /><label>Status<select name="status" required defaultValue={ticket.status}>{statuses.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}</select></label><button type="submit">Save status</button></form><form action={addTicketNote} className="admin-ticket-action-form admin-ticket-note-form"><input type="hidden" name="id" value={ticket.id} /><label>Internal note<textarea name="note" required maxLength={2000} rows={5} placeholder="Record the investigation, next step, or resolution." /></label><button type="submit">Add note</button></form><p className="admin-ticket-private-note">Internal notes stay in the admin panel.</p></section>
      </aside>
    </div>
  </main>;
}
