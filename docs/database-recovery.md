# MariaDB recovery and least-privilege accounts

## Isolated development restore — 2026-10-13

The original XAMPP MariaDB database was read through a consistent `mysqldump` export. The ignored export is `.npm-cache/db-backups/2026-10-13-pre-portfolio/theweblish_dev.sql` (SHA-256 `2C95A2906DC519E1540DB195D12E2941FB8F1826CA4C91DD15054B19A13DEC3B`). It was restored into a newly initialized MariaDB data directory at `.npm-cache/db-backups/2026-10-13-pre-portfolio/restore-mariadb`, listening on `127.0.0.1:3317`. Counts for users, sessions, accounts, posts, media, leads, contacts, activities, rate counters, and migration records matched the source immediately after restore. This verifies the logical export and isolated restore for the application data checked; it does not repair or certify the original XAMPP data directory.

The checked-in support-ticket, service, and portfolio migrations were applied **only to this isolated restore**. `prisma migrate status`, database regression tests, and the portfolio HTTP create/publish/unpublish smoke test passed there. The ignored local `.env` now points to port 3317. Start this isolated server after a reboot with `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/start-isolated-mariadb.ps1`, then restart the Next.js development server. Keep the original port 3306 data directory unchanged while its Aria and InnoDB errors await qualified review. Both the logical export and restored data directory contain sensitive records and must remain ignored and access restricted. The local passwordless root connection is still development-only and must not be used in shared deployment configuration.

Reviewed 2026-10-05. Local XAMPP MariaDB is stopped; port 3306 is closed. A prior `GRANT` failed with an Aria checksum error in the server's system tables. The MariaDB error log also reports InnoDB log-sequence mismatches involving pages ahead of the redo log. This may indicate more than an isolated privilege-table fault. Do not restart in recovery mode or run `aria_chk`, `REPAIR`, `innodb_force_recovery`, `migrate dev`, or schema changes on the original datadir until a qualified DBA reviews the logs and a restorable backup exists. Do not delete files or reset data.

## Safety snapshot already taken

While `mysqld` was stopped, a cold copy of the **entire** `C:\xampp\mysql\data` directory was saved to ignored local `D:\NextJs_projects\theweblish\.npm-cache\db-backups\2026-10-05-xampp-cold`. The adjacent `.sha256.txt` manifest records per-file hashes. All 957 source and snapshot files matched by relative path, byte count, and SHA-256 (206,653,004 bytes total). The copy contains other local databases and credentials-related server files; treat it as sensitive, keep it off Git, and restrict access. This proves copy fidelity only. **It has not been restored or shown to be logically consistent.** The original datadir was not modified.

## Recovery gate

1. Preserve the original datadir and error log. Copy the cold snapshot again to an isolated recovery machine or directory under DBA control; work only on that copy.
2. Diagnose the Aria system tables and InnoDB redo mismatch. If recovery mode is needed, use it only to extract data from the copy. Record the chosen mode and any tables or rows that cannot be read.
3. Export a consistent logical backup of `theweblish_dev` from the recovered copy, including schema and rows. Save a hash and secure storage location. Do not call the cold copy a verified backup until an isolated restore succeeds.
4. Restore the export into a **separate** test schema/server. Run `prisma migrate status`, compare table counts and representative users, sessions, leads, lead activities, contacts, contact activities, posts, and media rows; run the DB and HTTP regression tests there. Do not overwrite the original or production database.
5. Only after recovery and restore verification, decide whether to rebuild the local MariaDB installation from the validated export. Retain the source and backup until reviewed.

## Restricted accounts (not created)

The current ignored development `.env` uses local passwordless root because the failed `GRANT` prevented account creation. **Do not carry that URL into shared staging or production settings.** On a healthy server, a DBA should create unique users and random passwords in the secret manager, limited to the specific database and allowed application hosts. Use a production-specific schema name rather than the local example below.

```sql
-- Replace schema, host, names, and passwords before execution on a healthy server.
CREATE USER 'weblish_app'@'<app-host>' IDENTIFIED BY '<random-app-secret>';
GRANT SELECT, INSERT, UPDATE, DELETE ON `theweblish_dev`.* TO 'weblish_app'@'<app-host>';

CREATE USER 'weblish_migrate'@'<migration-host>' IDENTIFIED BY '<different-random-secret>';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, DROP, INDEX, REFERENCES
  ON `theweblish_dev`.* TO 'weblish_migrate'@'<migration-host>';
```

Use the app user's `DATABASE_URL` only at runtime. Supply the migration user's URL to a single controlled `npm run db:deploy` job, then remove it from the application runtime. `prisma migrate deploy` applies checked-in migrations; never run `migrate dev` against staging or production. Verify both users with `SHOW GRANTS`, then run normal auth, lead, contact, blog, and media metadata operations as the restricted app user. Confirm it cannot create/drop tables or access another schema. The grant set may need adjustment for provider-specific migration SQL; review the checked-in migrations first. This account verification is pending a healthy database.
