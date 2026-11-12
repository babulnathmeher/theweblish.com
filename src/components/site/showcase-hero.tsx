import Link from "next/link";
import type { ReactNode } from "react";

type ShowcaseHeroProps = {
  id: string;
  eyebrow: string;
  title: ReactNode;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
  footnote: string;
  previewLabel: string;
  previewCategory: string;
  previewTitle: ReactNode;
  previewName?: string;
  previewVariant?: "giet";
  bottomLine?: { left: string; right: string };
};

export function ShowcaseHero({ id, eyebrow, title, description, primaryHref, primaryLabel, secondaryHref, secondaryLabel, footnote, previewLabel, previewCategory, previewTitle, previewName = "The Weblish", previewVariant, bottomLine }: ShowcaseHeroProps) {
  return <section className="showcase-hero" aria-labelledby={id}><div className="site-container showcase-hero-inner">
    <div className="showcase-hero-copy">
      <p className="showcase-hero-kicker">{eyebrow}</p>
      <h1 id={id}>{title}</h1>
      <p className="showcase-hero-description">{description}</p>
      <div className="showcase-hero-actions"><Link href={primaryHref} className="button button-yellow">{primaryLabel} <span aria-hidden="true">↗</span></Link><Link href={secondaryHref} className="showcase-hero-secondary">{secondaryLabel} <span aria-hidden="true">↓</span></Link></div>
      <p className="showcase-hero-footnote">{footnote}</p>
    </div>
    <div className={`website-preview${previewVariant === "giet" ? " website-preview-giet" : ""}`} role="img" aria-label={previewVariant === "giet" ? "GIET admissions website visual preview" : "Illustrative website layout preview; not a client project"}>
      <div className="website-preview-bar"><div className="website-preview-dots" aria-hidden="true"><span /><span /><span /></div><span>{previewVariant === "giet" ? "Selected website work" : "Website layout preview"}</span></div>
      <div className="website-preview-screen"><div className="website-preview-orbit" aria-hidden="true" /><div className="website-preview-screen-top"><strong>{previewName}</strong><span>{previewCategory}</span></div><p>{previewTitle}</p><div className="website-preview-screen-bottom"><span>{previewVariant === "giet" ? "Explore admissions" : "Considered design. Clear purpose."}</span><span aria-hidden="true">↗</span></div></div>
      <div className="website-preview-caption"><span>{previewLabel}</span><strong>{previewName}</strong></div>
    </div>
  </div>{bottomLine && <div className="site-container showcase-hero-bottom"><span>{bottomLine.left}</span><span>{bottomLine.right}</span></div>}</section>;
}
