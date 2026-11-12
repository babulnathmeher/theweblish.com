import Link from "next/link";
import type { ReactNode } from "react";

export function Section({ children, tone = "white", id, className = "" }: { children: ReactNode; tone?: "white" | "soft" | "dark" | "yellow"; id?: string; className?: string }) {
  return <section id={id} className={`site-section section-${tone} ${className}`}><div className="site-container">{children}</div></section>;
}

export function SectionHeading({ eyebrow, title, description, light = false }: { eyebrow: string; title: string; description?: string; light?: boolean }) {
  return <div className="section-heading"><p className={`eyebrow ${light ? "eyebrow-on-dark" : ""}`}>{eyebrow}</p><h2>{title}</h2>{description && <p className="section-description">{description}</p>}</div>;
}

export function ArrowLink({ href, children, light = false }: { href: string; children: ReactNode; light?: boolean }) {
  return <Link href={href} className={`arrow-link ${light ? "arrow-link-light" : ""}`}>{children}<span aria-hidden="true">↗</span></Link>;
}

export function CtaBand({ title, text, href = "/contact/", label = "Start a conversation" }: { title: string; text: string; href?: string; label?: string }) {
  return <Section tone="yellow" className="cta-section"><div className="cta-grid"><div><p className="eyebrow">Your next step</p><h2>{title}</h2><p>{text}</p></div><Link href={href} className="button button-dark">{label}<span aria-hidden="true">↗</span></Link></div></Section>;
}

export function PageHero({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children?: ReactNode }) {
  return <section className="page-hero"><div className="site-container page-hero-inner"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="hero-description">{description}</p>{children}</div><div className="hero-pattern" aria-hidden="true"><span /><span /><span /></div></div></section>;
}
