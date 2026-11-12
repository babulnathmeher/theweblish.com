# External service setup and verification

Reviewed 2026-10-16. The ignored development `.env` has S3-compatible storage settings. An authenticated temporary PNG upload, public read of the exact bytes, invalid-file denial, anonymous denial, and cleanup passed against the development app and object store. SMTP is unconfigured; notification delivery has not been verified. These development results do not establish staging or production readiness.

## Object storage

Create an S3-compatible bucket with public read access through an HTTPS bucket URL or CDN for `blog-covers/`. Give the application key only the bucket/object permissions needed to put and delete blog covers. Keep the bucket private for writes. Set these server-side variables in an ignored development `.env` or the staging secret manager:

```dotenv
S3_ENDPOINT="https://objects.example.com"
S3_REGION="auto"
S3_BUCKET="theweblish-media"
S3_ACCESS_KEY_ID="<scoped-key-id>"
S3_SECRET_ACCESS_KEY="<scoped-secret>"
MEDIA_PUBLIC_BASE_URL="https://media.example.com/"
```

Use the actual provider endpoint and region; `auto` is only an example supported by some providers. The public base URL must point to the bucket root. Uploads are disabled for admins until all six values are valid; anonymous uploads return 401. The app accepts PNG, JPEG, and WebP images up to 5 MB, checks file signatures, creates random keys, and stores metadata in `Media`. See [media-storage.md](media-storage.md).

Staging verification: sign in as an admin, upload a small approved image in the blog editor, confirm a `201` response and `Media` row, open the returned image URL without a session and verify its content type and bytes, and render a draft preview using the cover. POST to `/api/uploads/` without a session and require `401`; try a non-image and an oversized image as admin and require rejection. Remove test objects and metadata through a controlled cleanup after the test. Record the environment, object key, date, and result without logging credentials.

## Email

Use a verified sending domain and test recipient addresses. Configure:

```dotenv
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="<smtp-user>"
SMTP_PASSWORD="<smtp-secret>"
MAIL_FROM="The Weblish <notifications@example.com>"
LEAD_NOTIFICATION_TO="leads-test@example.com"
CONTACT_NOTIFICATION_TO="contacts-test@example.com"
```

Port 465 uses implicit TLS; other ports require STARTTLS. Configure all common SMTP settings and the relevant recipient for each notification. In development, an unconfigured contact notifier logs that it skipped delivery. This does not mean mail was sent.

Staging verification: submit one valid enquiry and one contact form, confirm persisted IDs and actual arrival at each test inbox, including sender and message. Then use deliberately invalid staging SMTP credentials, submit unique valid records, and confirm the API still succeeds and both records exist while the server logs only a generic notification failure. Restore valid credentials. Never print SMTP secrets, form content, or raw transport errors in shared logs.

Storage still needs scoped staging credentials and a rendered-cover check. Email awaits SMTP configuration and a delivery/failure-persistence test in staging.
