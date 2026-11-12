import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { addLeadNote, updateLeadStatus } from "@/features/leads/actions";

const statuses = ["NEW", "CONTACTED", "QUALIFIED", "CLOSED"] as const;

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!id || id.length > 64) notFound();
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: { activities: { orderBy: { createdAt: "desc" }, take: 100, include: { actor: { select: { name: true } } } } },
  });
  if (!lead) notFound();
  return <main className="admin-ticket-detail admin-lead-detail">
    <Link className="admin-ticket-back" href="/admin/leads/">← Back to leads</Link>
    <div className="admin-page-heading"><div><p className="admin-eyebrow">INBOX / LEAD DETAIL</p><h1>{lead.name}</h1><p>{lead.serviceInterest || "Website enquiry"}</p></div><span className={`admin-ticket-status is-${lead.status.toLowerCase()}`}>{lead.status.charAt(0) + lead.status.slice(1).toLowerCase()}</span></div>
    <div className="admin-ticket-detail-grid"><div className="admin-ticket-main-column">
      <section className="admin-ticket-card" aria-labelledby="lead-message"><div className="admin-ticket-card-heading"><span>01 / ENQUIRY</span><h2 id="lead-message">Project request</h2></div><p className="admin-ticket-description">{lead.message || "No message provided."}</p><dl className="admin-ticket-facts"><div><dt>Service interest</dt><dd>{lead.serviceInterest || "—"}</dd></div><div><dt>Budget range</dt><dd>{lead.budgetRange || "—"}</dd></div><div><dt>Source page</dt><dd>{lead.sourcePage}</dd></div><div><dt>UTM source</dt><dd>{lead.utmSource || "—"}</dd></div><div><dt>UTM medium</dt><dd>{lead.utmMedium || "—"}</dd></div><div><dt>UTM campaign</dt><dd>{lead.utmCampaign || "—"}</dd></div><div><dt>UTM term</dt><dd>{lead.utmTerm || "—"}</dd></div><div><dt>UTM content</dt><dd>{lead.utmContent || "—"}</dd></div></dl></section>
      <section className="admin-ticket-card" aria-labelledby="lead-activity"><div className="admin-ticket-card-heading"><span>02 / HISTORY</span><h2 id="lead-activity">Activity &amp; internal notes</h2></div><ol className="admin-ticket-timeline">{lead.activities.map((activity) => <li key={activity.id}><span className="admin-ticket-timeline-dot" aria-hidden="true" /><div><strong>{activity.type === "NOTE" ? "Internal note" : activity.type === "STATUS_CHANGE" ? "Status changed" : "Enquiry submitted"}</strong><time dateTime={activity.createdAt.toISOString()}>{activity.createdAt.toLocaleString("en-IN")}</time>{activity.actor && <p>By {activity.actor.name}</p>}{activity.note && <p className="admin-ticket-note">{activity.note}</p>}{activity.type === "STATUS_CHANGE" && <p>{activity.fromStatus} → {activity.toStatus}</p>}{activity.type === "SUBMISSION" && activity.submission != null && <details className="admin-lead-submission"><summary>View submitted details</summary><pre>{JSON.stringify(activity.submission, null, 2)}</pre></details>}</div></li>)}{!lead.activities.length && <li><p>No activity yet.</p></li>}</ol></section>
    </div><aside className="admin-ticket-side-column">
      <section className="admin-ticket-card" aria-labelledby="lead-contact"><div className="admin-ticket-card-heading"><span>PROSPECT</span><h2 id="lead-contact">Contact details</h2></div><dl className="admin-ticket-facts"><div><dt>Name</dt><dd>{lead.name}</dd></div><div><dt>Phone</dt><dd>{lead.phone}</dd></div><div><dt>Email</dt><dd>{lead.email ? <a href={`mailto:${lead.email}`}>{lead.email}</a> : "—"}</dd></div><div><dt>Received</dt><dd><time dateTime={lead.createdAt.toISOString()}>{lead.createdAt.toLocaleString("en-IN")}</time></dd></div><div><dt>Updated</dt><dd><time dateTime={lead.updatedAt.toISOString()}>{lead.updatedAt.toLocaleString("en-IN")}</time></dd></div><div><dt>Consent recorded</dt><dd>{lead.consentAt?.toLocaleString("en-IN") || "—"}</dd></div></dl></section>
      <section className="admin-ticket-card" aria-labelledby="lead-workflow"><div className="admin-ticket-card-heading"><span>WORKFLOW</span><h2 id="lead-workflow">Update lead</h2></div><form action={updateLeadStatus} className="admin-ticket-action-form"><input type="hidden" name="id" value={lead.id} /><label>Status<select name="status" required defaultValue={lead.status}>{statuses.map((status) => <option key={status} value={status}>{status.charAt(0) + status.slice(1).toLowerCase()}</option>)}</select></label><button type="submit">Save status</button></form><form action={addLeadNote} className="admin-ticket-action-form admin-ticket-note-form"><input type="hidden" name="id" value={lead.id} /><label>Internal note<textarea name="note" required maxLength={2000} rows={5} placeholder="Record a follow-up or next step." /></label><button type="submit">Add note</button></form><p className="admin-ticket-private-note">Internal notes stay in the admin panel.</p></section>
    </aside></div>
  </main>;
}
