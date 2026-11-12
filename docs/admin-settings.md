# Admin settings and release signals

`/admin/settings/` requires an administrator session. The page queries the current database, reports whether site/auth origins match, and shows only whether authentication, object storage, SMTP, the service editor, and staging noindex are configured. It never renders database URLs, API keys, passwords, or SMTP credentials. "Configured" means a value is present and locally valid; it does **not** mean external delivery, backup restoration, access restrictions, or launch approval passed.

The publication counters reflect records currently visible under the application filters. They do not establish editorial approval. The release gates on the page point to work that must be verified in staging and recorded in [launch-readiness.md](launch-readiness.md) and [release-checklist.md](release-checklist.md). Server configuration remains in the host secret manager; the admin page cannot edit environment variables or bypass noindex protections.

An administrator can change their own password from the settings page. Better Auth checks the current password and updates its hashed credential; the form requests revocation of other sessions. The current session stays active. Passwords are not logged or returned in page data. After changing a bootstrap password, remove or update the ignored local `ADMIN_SEED_PASSWORD` because the seed verification and local smoke scripts use that value. Rotate any password that was shared outside the secret manager.

The contact inbox at `/admin/contacts/` uses status tabs, text search, page-size selection, and paginated results. Its detail page retains status and internal-note actions. Both pages still require an administrator session and keep general messages separate from sales leads and support tickets.
