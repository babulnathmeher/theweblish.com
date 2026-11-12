# Blog cover storage

Blog covers use an S3-compatible object storage bucket. The application saves only the storage key, public URL, MIME type, name, size, and optional alt text in `Media`; no image bytes are saved in MySQL or on the app server.

Set these server-only values in the deployment secret manager or an ignored local `.env`:

```dotenv
S3_ENDPOINT="https://objects.example.com"
S3_REGION="auto"
S3_BUCKET="theweblish-media"
S3_ACCESS_KEY_ID="<storage-access-key>"
S3_SECRET_ACCESS_KEY="<storage-secret-key>"
MEDIA_PUBLIC_BASE_URL="https://media.example.com/"
```

`MEDIA_PUBLIC_BASE_URL` must map to the bucket root, including `blog-covers/` objects. Configure the bucket or its CDN for public reads of cover objects. Use a scoped write/delete key for the app, HTTPS for both URLs, and keep credentials out of `NEXT_PUBLIC_` variables. Until all values are configured, the editor shows uploads as unavailable and `/api/uploads/` returns 503 to authorized admins. Uploads require an admin session, same-origin request, PNG/JPEG/WebP signature, and a 5 MB image limit. The storage key is a random UUID under `blog-covers/`.
