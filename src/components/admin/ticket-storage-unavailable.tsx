import Link from "next/link";

export function TicketStorageUnavailable() {
  return <main className="admin-tickets-page">
    <div className="admin-page-heading"><div><p className="admin-eyebrow">CLIENT CARE / SUPPORT</p><h1>Support <em>tickets.</em></h1><p>Ticket storage is not available yet.</p></div></div>
    <section className="admin-ticket-unavailable" role="status">
      <span aria-hidden="true">!</span>
      <div><h2>Database setup is required</h2><p>The support ticket tables have not been applied to this database. An administrator needs to verify a restorable backup and complete the pending database migration before tickets can be received or managed.</p><Link href="/admin/">Return to dashboard</Link></div>
    </section>
  </main>;
}
