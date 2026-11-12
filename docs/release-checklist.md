# Release checks and recovery plan

Current status (2026-10-13): preparation only. A development logical export was restored and checked in an isolated MariaDB instance, but the original MariaDB data directory remains unrepaired. There is no staging host, deployment backup and restore rehearsal, or approved portfolio content set. A build pass alone does not clear this checklist.

## Before a staging rehearsal

| Check | Required evidence | Current status |
| --- | --- | --- |
| Database backup and isolated restore | Logical export hash, separate test database, table/row comparison, login and data checks | Development export and isolated restore passed representative counts and login; staging restore drill and original database repair remain pending |
| Route and content review | Complete original audit, exact canonical URLs/verified redirects, approved page and article content | Pending original audit and assets |
| Staging indexing | Host access control, `STAGING_NOINDEX=true`, `X-Robots-Tag` on public responses, `robots.txt` disallow | Local production build verified header and robots; no staging run or host access control |
| Monitoring | HTTPS `/api/health/` check, error capture, alert recipient, on-call owner, redacted logs | Local offline database returned generic 503; service and alerts pending |
| External services | Admin upload, anonymous denial, public image; lead/contact mail arrival and failure-persistence tests | Development object-storage upload/public-read/denial passed 2026-10-16; staging storage and SMTP delivery/failure checks pending |

## Staging acceptance

- Record build commit, `npm run lint`, `npm run typecheck`, `npm run test`, `npm run db:validate`, `prisma migrate status`, `npm run test:db`, `npm run build`, and HTTP smoke results. A failing gate must be resolved or documented before approval.
- Check every audited canonical URL and verified redirect, including trailing slashes and direct 404 for unknown/draft/unpublished article slugs. Compare HTML canonical tags and `sitemap.xml` with the approved indexable pages and published articles. Five of the seven reserved legacy URLs currently serve published posts; verify their source and approval before launch. The other two must remain 404 until reviewed originals are imported.
- Submit valid and invalid website enquiries and contacts. Check response, stored rows, repeat enquiry activity, source/UTM fields, status and notes in protected admin views, rate limits, and SMTP failure independence. Use unique test identities and record IDs for cleanup.
- Check anonymous and non-admin access directly to each admin page, mutation, API route, and upload route. Sign in with a seeded staging admin and verify logout/session expiration.
- Upload and render an approved cover through configured object storage. Verify file type/size denial, anonymous upload denial, storage key and metadata, and public image accessibility.
- Check desktop/mobile navigation and forms. Test `/api/health/` with the DB available and with a controlled staging database outage; verify uptime and error alerts reach the designated owner. Review logs for credentials and personal data.

## Rollback and restoration rehearsal

Record the last working application artifact and matching schema migration set before changes. Stop new writes for a data restore. If a release changes code only, redeploy the last working artifact and verify compatibility with the current schema. If a migration is incompatible, do **not** assume a code rollback is enough: use a reviewed forward migration or restore the verified pre-migration backup into a separate database, validate it, then switch application traffic to the recovered database under a documented recovery window. A restore can lose writes made after the backup; reconcile them before reopening writes. Rehearse this on staging, including auth, leads, contacts, articles, media metadata, and rate counters. Record timing, data loss window, and decision owner.

Do not deploy, change DNS, remove noindex globally, or run production migrations as part of these preparation checks.
