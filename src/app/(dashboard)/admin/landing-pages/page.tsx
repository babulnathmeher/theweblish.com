import Link from "next/link";
import { requireAdmin } from "@/lib/require-admin";

const pages = [
  { name: "Homepage", href: "/", note: "Agency overview" },
  { name: "Website development", href: "/website-development/", note: "Website quote landing page" },
  { name: "Landing page design", href: "/landing-page-design/", note: "Service landing page" },
] as const;

export default async function LandingPagesPage() {
  await requireAdmin();
  return <main><div className="admin-page-heading"><div><p className="admin-eyebrow">CONTENT / LANDING PAGES</p><h1>Landing pages</h1><p>These pages are currently maintained in the project code.</p></div></div><div className="admin-directory-grid">{pages.map((page, index) => <article className="admin-directory-card" key={page.href}><span className="admin-directory-number">{String(index + 1).padStart(2, "0")} / PAGE</span><h2>{page.name}</h2><p>{page.note}</p><Link href={page.href} target="_blank" rel="noopener noreferrer">View public page ↗</Link></article>)}</div></main>;
}
