import type { Metadata } from "next";
import Link from "next/link";
import Markdown from "react-markdown";
import { CtaBand, Section, SectionHeading } from "@/components/site/site-ui";
import { ProcessSteps } from "@/components/site/process-steps";
import { ServiceIcon } from "@/components/site/service-icon";
import { servicePages, type ServiceSlug } from "@/config/service-pages";
import { serviceVisuals } from "@/config/service-visuals";
import { getPublishedService } from "@/features/services/public";
import { serviceIcons } from "@/features/services/validation";

export type ManagedServiceView = { slug: string; title: string; eyebrow: string; summary: string; content: string; category: string; icon: string };

function managedIcon(icon: string) {
  return serviceIcons.includes(icon as (typeof serviceIcons)[number]) ? icon as (typeof serviceIcons)[number] : "browser";
}

export async function serviceMetadata(slug: ServiceSlug): Promise<Metadata> {
  const content = servicePages[slug];
  const managed = await getPublishedService(slug);
  return { title: managed?.seoTitle || managed?.title || content.title, description: managed?.seoDescription || managed?.summary || content.intro, alternates: { canonical: `/${slug}/` }, robots: { index: Boolean(managed?.indexable), follow: Boolean(managed?.indexable) } };
}

export async function ServicePage({ slug }: { slug: ServiceSlug }) {
  const content = servicePages[slug];
  const visual = serviceVisuals[slug];
  const managed = await getPublishedService(slug);
  const title = managed?.title || content.title;
  const eyebrow = managed?.eyebrow || content.eyebrow;
  const intro = managed?.summary || content.intro;
  const category = managed?.category || visual.category;
  const icon = managed ? managedIcon(managed.icon) : visual.icon;

  return <main className="service-detail-page">
    <section className="service-detail-hero" aria-labelledby="service-title">
      <div className="site-container service-detail-hero-inner">
        <div className="service-detail-copy">
          <Link className="service-back-link" href="/digital-solution/">← All services</Link>
          <p className="services-kicker"><span aria-hidden="true" /> {category} / {eyebrow}</p>
          <h1 id="service-title">{title}</h1>
          <p className="service-detail-intro">{intro}</p>
          <div className="service-detail-actions"><Link className="button button-yellow" href="/contact/">Discuss your project <span aria-hidden="true">↗</span></Link><a className="services-text-link" href="#service-focus">What to consider <span aria-hidden="true">↓</span></a></div>
        </div>
        <div className="service-detail-art" aria-hidden="true"><span className="service-detail-art-ring" /><span className="service-detail-art-icon"><ServiceIcon kind={icon} /></span><span className="service-detail-art-label">{eyebrow}</span></div>
      </div>
      <div className="site-container service-detail-hero-bottom"><span>Start with your brief</span><span>Explore the questions below ↓</span></div>
    </section>
    {managed ? <Section id="service-focus" className="service-managed-section"><div className="service-managed-copy"><p className="eyebrow">About this service</p><div className="markdown-body"><Markdown skipHtml>{managed.content}</Markdown></div></div></Section>
      : <Section id="service-focus" className="service-focus-section"><SectionHeading eyebrow="Start with the right questions" title="Define the work before the work begins." description="A useful proposal starts with the context you can share. These are areas to discuss, not a fixed package or promised result." /><div className="service-topic-grid">{content.topics.map(([title, description], index) => <article className="service-topic-card" key={title}><span className="service-topic-number">0{index + 1} / Focus area</span><h3>{title}</h3><p>{description}</p><span className="service-topic-mark" aria-hidden="true">↗</span></article>)}</div></Section>}
    <Section tone="soft"><SectionHeading eyebrow="Working together" title="A clear path from brief to next step." description="The exact scope and schedule should be agreed in a project-specific proposal." /><ProcessSteps /></Section>
    <CtaBand title="Tell us what you have in mind." text="Share your goals and any existing material. We can discuss the appropriate scope from there." />
  </main>;
}

export function ManagedServicePage({ service }: { service: ManagedServiceView }) {
  return <main className="service-detail-page"><section className="service-detail-hero" aria-labelledby="service-title"><div className="site-container service-detail-hero-inner"><div className="service-detail-copy"><Link className="service-back-link" href="/digital-solution/">← All services</Link><p className="services-kicker"><span aria-hidden="true" /> {service.category} / {service.eyebrow}</p><h1 id="service-title">{service.title}</h1><p className="service-detail-intro">{service.summary}</p><div className="service-detail-actions"><Link className="button button-yellow" href="/contact/">Discuss your project <span aria-hidden="true">↗</span></Link></div></div><div className="service-detail-art" aria-hidden="true"><span className="service-detail-art-ring" /><span className="service-detail-art-icon"><ServiceIcon kind={managedIcon(service.icon)} /></span><span className="service-detail-art-label">{service.eyebrow}</span></div></div></section><Section className="service-managed-section"><div className="service-managed-copy"><p className="eyebrow">About this service</p><div className="markdown-body"><Markdown skipHtml>{service.content}</Markdown></div></div></Section><Section tone="soft"><SectionHeading eyebrow="Working together" title="A clear path from brief to next step." description="The exact scope and schedule should be agreed in a project-specific proposal." /><ProcessSteps /></Section><CtaBand title="Tell us what you have in mind." text="Share your goals and any existing material. We can discuss the appropriate scope from there." /></main>;
}
