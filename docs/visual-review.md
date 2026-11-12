# Public design review

Screenshots were captured from the local production build with Chrome headless. They show the current noindex layouts before original brand and portfolio assets are supplied.

| View | Screenshot |
| --- | --- |
| Home at 1440 × 900 | [Desktop home](previews/home-desktop.png) |
| Home at 390 × 844 | [Mobile home](previews/home-mobile.png) |
| Website landing at 390 × 844 | [Mobile website page](previews/website-mobile.png) |
| Contact form at 390 × 844 | [Mobile contact form](previews/contact-form-mobile.png) |

All 17 public routes were checked at 320, 390, 768, and 1440 pixels. Each rendered one main landmark and one page heading with no horizontal overflow. The mobile menu opened with `aria-expanded=true`. Both redesigned forms were submitted through a 390-pixel browser viewport and persisted to the development database. The temporary test records were then removed.

For a live preview, set the local `.env` as described in [development-setup.md](development-setup.md), run `npm run dev`, and open `/`, `/website-development/`, `/contact/`, and `/blog/` at the localhost origin shown by Next.js. The audit files and approved assets listed in [content-needed.md](content-needed.md) are still needed before these layouts can be considered final public content.
