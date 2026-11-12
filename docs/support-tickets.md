# Support tickets

The footer's **Raise a ticket** link opens `/support/`. Clients can submit an issue without an account. Name, email, phone, website URL, issue type, subject, description, and contact consent are required. It rejects oversized bodies, invalid origins, an unexpected source page, and a honeypot value; the existing MySQL rate limiter applies by email and optionally by trusted proxy IP.

A successful database insert returns a random `TW-...` reference for the client to keep. There is no public status lookup, attachment upload, automatic email, or response-time promise. Admins can search tickets, change status, and add internal notes at `/admin/tickets/`. Every admin read and action calls `requireAdmin` before database access.

The `SupportTicket` and `TicketActivity` tables are defined in `prisma/migrations/20261009000000_support_tickets/`. The migration was applied to the isolated restored development database on port 3317 on 2026-10-13; it was not applied to the original XAMPP data directory on port 3306. See [database-recovery.md](database-recovery.md). Ticket submission and admin status/note flows still need an end-to-end check on this restored database. Do not run this against production as part of local verification.

Until that migration is applied, `/support/` can render and validate input, but a valid submission returns a generic 503 and no reference. The success state is shown only after persistence.
