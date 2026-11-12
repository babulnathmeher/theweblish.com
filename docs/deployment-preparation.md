# Node hosting preparation

No production host or hosting configuration has been selected. These are provider-neutral requirements and steps; they do not authorize deployment.

## Required host capabilities

- Persistent Node.js process compatible with the installed Next.js release, HTTPS reverse proxy, stable public origin, build and runtime logs, and a secret manager. Run `npm ci`, `npm run build`, then `npm run start` in an environment with the required secrets. Check the selected host's supported Node version against Next.js and Prisma before building.
- Network access to a healthy MySQL/MariaDB server with private routing and TLS where supported. Set connection limits from the full fleet: Prisma's current pool limit is **5 per application process**, plus migration, admin, monitoring, and surge headroom. Test the provider's server limit and scale settings; one process's setting is not the total. Monitor active connections and pool waits.
- S3-compatible durable media and HTTPS public reads. The app filesystem is not persistent media storage.
- A single migration job that can use a separate privileged `DATABASE_URL`; the runtime uses the restricted app account. Back up and test migration compatibility before the job. Never run production migrations from a developer workstation or every app replica.
- Shared MySQL rate-limit tables are already used by enquiries and contacts. Keep every app instance on the same database, set `TRUST_PROXY_IP_HEADER=true` only if a trusted proxy overwrites `X-Real-IP`, and schedule `npm run db:cleanup-rate-limits -- --apply` daily from one job with the restricted runtime database account. The command deletes only buckets whose window started more than 24 hours ago; preview with `npm run db:cleanup-rate-limits`. Test cross-instance behavior before scaling.
- Request, error, and uptime monitoring with a response owner and alert channel. `/api/health/` checks database reachability and returns `200` or generic `503`; it never reveals connection details. The selected monitor should request it over HTTPS and alert on persistent failures. Keep credentials and submitted form data out of logs.

## Environment and URLs

Use [.env.example](../.env.example) as the variable inventory, with real values stored only in the host secret manager. Required at runtime: `DATABASE_URL` (restricted app user), `BETTER_AUTH_URL` (exact public HTTPS origin), `BETTER_AUTH_SECRET`, `ENQUIRY_HASH_SECRET`, and `NEXT_PUBLIC_SITE_URL` (canonical HTTPS site origin). The `NEXT_PUBLIC_` value is public and must be correct **at build time**; do not put secrets under that prefix. Configure SMTP and S3 values only after their separate checks in [external-services.md](external-services.md). Seed credentials are bootstrap-only and should not be present in a long-running app environment.

Set `STAGING_NOINDEX=true` for staging **at build and runtime**. It adds an `X-Robots-Tag: noindex, nofollow` response header and disallows crawlers in `robots.txt`; staging should also have access control at the host or proxy. Verify the header on a public page and `/robots.txt` from an unauthenticated client. Production must use `STAGING_NOINDEX=false` only after the content/route release gates pass; marketing pages currently retain their own noindex state until reviewed. Preserve `trailingSlash: true` and the existing canonical paths. Do not introduce redirects without an audited source URL.

## Staging rehearsal

1. Restore a verified backup into staging, record its source and hash, and compare representative rows. Use restricted app and separate migration users. Verify network/TLS, account grants, connection headroom, and `prisma migrate status`.
2. Build with staging values, run the checked-in migrations once with the migration account, start the app with the restricted account, then run [release-checklist.md](release-checklist.md). Run a one-instance and multi-instance rate-limit test if scaling is planned.
3. Record the deployed commit and migration set, health URL status, request/error log location, alert recipient, and rollback artifact. Rehearse a rollback in staging before production approval.

The ignored local `.env` currently points to passwordless root on a damaged local MariaDB. It is not a deployable configuration and must not be copied to a shared host.
