# The Weblish foundation and implementation plan

## Inspection record

At setup, this workspace contained no files, Git metadata, package manager lockfile, `AGENTS.md`, or route audit. The requested route names below are provisional until the original site or an audit is supplied. There is no verified `/index.php/...` redirect mapping, so `src/config/legacy-redirects.ts` is empty. Do not infer more slugs from page titles. See `docs/route-migration-checklist.md` for the route-by-route status.

## URL policy

Next.js uses `trailingSlash: true`, so `/about-us` redirects to `/about-us/`. Route group names never appear in URLs. Unreviewed marketing pages remain noindex placeholders and are absent from the sitemap. The blog listing and root-level articles show only published database content. Admin, API, drafts, and unavailable blog articles have no sitemap entries. Set `NEXT_PUBLIC_SITE_URL` to the final canonical origin before launch, then add reviewed marketing pages to the sitemap.

## Route inventory

The requested public routes are `/`, `/about-us/`, `/our-clients/`, `/customer-satisfaction/`, `/digital-solution/`, `/contact/`, `/blog/`, `/web-design-company-in-bhubaneswar/`, `/landing-page-design/`, `/logo-design/`, `/web-development-company-in-bhubaneswar/`, `/wordpress-development-company-in-bhubaneswar/`, `/seo-company-in-bhubaneswar/`, `/marketing-company-in-bhubaneswar/`, `/facebook-marketing/`, `/google-analytics/`, and `/website-development/`. Contact, blog, and the website-development enquiry flow are functional; the other public pages await approved content.

Requested root-level article slugs to preserve when content is imported: `how-to-increase-leads-from-landing-pages`, `how-to-create-seo-friendly-website`, `how-to-get-traffic-on-your-website`, `best-web-design-company-in-bhubaneswar`, `the-ultimate-guide-to-website-design-trends`, `ever-wondered-how-websites-work`, `how-to-choose-a-perfect-domain-name-for-your-brand`. They currently return 404; no post content was supplied. These slugs are reserved from the editor pending original-content import.

Admin login, leads, blog management, and the contact inbox are implemented. The settings route remains a protected placeholder. Media upload code is available only when an object storage provider is configured. See `docs/development-setup.md` for the development database and auth setup.

## Database setup

Prisma ORM 7 is pinned in this project. Three checked-in migrations have been applied to local `theweblish_dev`. Local configuration is in ignored `.env`; see `docs/development-setup.md`. For another development database, run `npm run db:validate`, `npm run db:generate`, and `npm run db:deploy` with its own `DATABASE_URL`.

## Next phases

1. Obtain the route audit and original content. Confirm every canonical slug and legacy redirect, then replace placeholders with reviewed pages. Build the `/website-development/` ad page from approved copy and assets.
2. Import the seven original articles after the content is supplied and approved. Verify the imported slugs, metadata, and article sitemap entries.
3. Configure an S3-compatible provider for cover uploads and test it with scoped credentials.
4. Configure production secrets, restricted database credentials, database backups, monitoring, and deployment. Test redirects and SEO output against the original site before launch.
