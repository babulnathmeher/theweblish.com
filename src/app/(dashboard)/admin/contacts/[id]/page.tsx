import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { addContactNote, updateContactStatus } from "@/features/contacts/actions";

const statuses = ["NEW", "READ", "REPLIED", "ARCHIVED"] as const;

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!id || id.length > 64) notFound();
  const contact = await prisma.contactMessage.findUnique({ where: { id }, include: { activities: { orderBy: { createdAt: "desc" }, take: 100, include: { actor: { select: { name: true } } } } } });
  if (!contact) notFound();
  return <main className="admin-ticket-detail admin-contact-detail">
    <Link className="admin-ticket-back" href="/admin/contacts/">← Back to contact inbox</Link>
    <div className="admin-page-heading"><div><p className="admin-eyebrow">INBOX / CONTACT DETAIL</p><h1>{contact.name}</h1><p>{contact.subject || "General message"}</p></div><span className={`admin-ticket-status is-${contact.status.toLowerCase()}`}>{contact.status.charAt(0) + contact.status.slice(1).toLowerCase()}</span></div>
    <div className="admin-ticket-detail-grid"><div className="admin-ticket-main-column">
      <section className="admin-ticket-card" aria-labelledby="contact-message"><div className="admin-ticket-card-heading"><span>01 / MESSAGE</span><h2 id="contact-message">Submitted message</h2></div><p className="admin-ticket-description">{contact.message}</p><dl className="admin-ticket-facts"><div><dt>Subject</dt><dd>{contact.subject || "General message"}</dd></div><div><dt>Source page</dt><dd>{contact.sourcePage || "—"}</dd></div></dl></section>
      <section className="admin-ticket-card" aria-labelledby="contact-activity"><div className="admin-ticket-card-heading"><span>02 / HISTORY</span><h2 id="contact-activity">Activity &amp; internal notes</h2></div><ol className="admin-ticket-timeline">{contact.activities.map((activity) => <li key={activity.id}><span className="admin-ticket-timeline-dot" aria-hidden="true" /><div><strong>{activity.type === "NOTE" ? "Internal note" : "Status changed"}</strong><time dateTime={activity.createdAt.toISOString()}>{activity.createdAt.toLocaleString("en-IN")}</time><p>By {activity.actor.name}</p>{activity.note && <p className="admin-ticket-note">{activity.note}</p>}{activity.type === "STATUS_CHANGE" && <p>{activity.fromStatus} → {activity.toStatus}</p>}</div></li>)}{!contact.activities.length && <li><p>No internal activity yet.</p></li>}</ol></section>
    </div><aside className="admin-ticket-side-column">
      <section className="admin-ticket-card" aria-labelledby="contact-sender"><div className="admin-ticket-card-heading"><span>SENDER</span><h2 id="contact-sender">Contact details</h2></div><dl className="admin-ticket-facts"><div><dt>Name</dt><dd>{contact.name}</dd></div><div><dt>Email</dt><dd><a href={`mailto:${contact.email}`}>{contact.email}</a></dd></div><div><dt>Phone</dt><dd>{contact.phone || "—"}</dd></div><div><dt>Received</dt><dd><time dateTime={contact.createdAt.toISOString()}>{contact.createdAt.toLocaleString("en-IN")}</time></dd></div><div><dt>Consent recorded</dt><dd>{contact.consentAt?.toLocaleString("en-IN") || "—"}</dd></div></dl></section>
      <section className="admin-ticket-card" aria-labelledby="contact-workflow"><div className="admin-ticket-card-heading"><span>WORKFLOW</span><h2 id="contact-workflow">Update message</h2></div><form action={updateContactStatus} className="admin-ticket-action-form"><input type="hidden" name="id" value={contact.id} /><label>Status<select name="status" required defaultValue={contact.status}>{statuses.map((status) => <option key={status} value={status}>{status.charAt(0) + status.slice(1).toLowerCase()}</option>)}</select></label><button type="submit">Save status</button></form><form action={addContactNote} className="admin-ticket-action-form admin-ticket-note-form"><input type="hidden" name="id" value={contact.id} /><label>Internal note<textarea name="note" required maxLength={2000} rows={5} placeholder="Record a follow-up or next step." /></label><button type="submit">Add note</button></form><p className="admin-ticket-private-note">Internal notes stay in the admin panel.</p></section>
    </aside></div>
  </main>;
}
