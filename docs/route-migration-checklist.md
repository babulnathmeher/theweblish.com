# Route migration checklist

Audit state: `docs/route-map.md`, `docs/reference-audit.md`, `docs/reference/page-catalog.md`, and captured assets are absent. Old URLs below come only from the supplied brief and have not been verified against the original site. No additional canonical URLs or redirect sources can be confirmed.

| Old URL (brief, unverified) | Intended new URL | Page type | Content source | Implementation status | Redirect requirement |
| --- | --- | --- | --- | --- | --- |
| `/` | `/` | Home | Not supplied | Designed layout; noindex pending reviewed content | None verified |
| `/about-us/` | `/about-us/` | Site page | Not supplied | Designed layout; noindex pending reviewed content | None verified |
| `/our-clients/` | `/our-clients/` | Site page | Not supplied | Designed layout; noindex pending reviewed content | None verified |
| `/customer-satisfaction/` | `/customer-satisfaction/` | Site page | Not supplied | Designed layout; noindex pending reviewed content | None verified |
| `/digital-solution/` | `/digital-solution/` | Site page | Not supplied | Designed layout; noindex pending reviewed content | None verified |
| `/contact/` | `/contact/` | Site page | New contact form; original page content not supplied | Designed page and functional form; noindex pending reviewed content | None verified |
| `/blog/` | `/blog/` | Blog index | Published database articles only; original articles not supplied | Designed published-only listing; noindex while empty | None verified |
| `/web-design-company-in-bhubaneswar/` | `/web-design-company-in-bhubaneswar/` | Site page | Not supplied | Designed layout; noindex pending reviewed content | None verified |
| `/landing-page-design/` | `/landing-page-design/` | Site page | Not supplied | Designed layout; noindex pending reviewed content | None verified |
| `/logo-design/` | `/logo-design/` | Site page | Not supplied | Designed layout; noindex pending reviewed content | None verified |
| `/web-development-company-in-bhubaneswar/` | `/web-development-company-in-bhubaneswar/` | Site page | Not supplied | Designed layout; noindex pending reviewed content | None verified |
| `/wordpress-development-company-in-bhubaneswar/` | `/wordpress-development-company-in-bhubaneswar/` | Site page | Not supplied | Designed layout; noindex pending reviewed content | None verified |
| `/seo-company-in-bhubaneswar/` | `/seo-company-in-bhubaneswar/` | Site page | Not supplied | Designed layout; noindex pending reviewed content | None verified |
| `/marketing-company-in-bhubaneswar/` | `/marketing-company-in-bhubaneswar/` | Site page | Not supplied | Designed layout; noindex pending reviewed content | None verified |
| `/facebook-marketing/` | `/facebook-marketing/` | Site page | Not supplied | Designed layout; noindex pending reviewed content | None verified |
| `/google-analytics/` | `/google-analytics/` | Site page | Not supplied | Designed layout; noindex pending reviewed content | None verified |
| `/website-development/` | `/website-development/` | Ad landing page | Not supplied | Designed landing page and functional enquiry form; noindex pending reviewed content | None verified |
| `/how-to-increase-leads-from-landing-pages/` | `/how-to-increase-leads-from-landing-pages/` | Blog article | Not supplied | 404 until a published post is imported | None verified |
| `/how-to-create-seo-friendly-website/` | `/how-to-create-seo-friendly-website/` | Blog article | Not supplied | 404 until a published post is imported | None verified |
| `/how-to-get-traffic-on-your-website/` | `/how-to-get-traffic-on-your-website/` | Blog article | Not supplied | 404 until a published post is imported | None verified |
| `/best-web-design-company-in-bhubaneswar/` | `/best-web-design-company-in-bhubaneswar/` | Blog article | Not supplied | 404 until a published post is imported | None verified |
| `/the-ultimate-guide-to-website-design-trends/` | `/the-ultimate-guide-to-website-design-trends/` | Blog article | Not supplied | 404 until a published post is imported | None verified |
| `/ever-wondered-how-websites-work/` | `/ever-wondered-how-websites-work/` | Blog article | Not supplied | 404 until a published post is imported | None verified |
| `/how-to-choose-a-perfect-domain-name-for-your-brand/` | `/how-to-choose-a-perfect-domain-name-for-your-brand/` | Blog article | Not supplied | 404 until a published post is imported | None verified |

## Reconciliation remaining

- Supply `docs/route-map.md`, `docs/reference-audit.md`, and `docs/reference/page-catalog.md` (or equivalent exports) plus captured assets. These are needed to confirm canonical URLs, missing pages, content sources, and `/index.php/...` or other legacy redirects.
- Add folders only for confirmed audited paths. Add explicit permanent redirects only after old and destination URLs are verified.
- `trailingSlash: true` canonicalizes directory paths with `/`. Placeholder pages remain noindex until reviewed content is published.

