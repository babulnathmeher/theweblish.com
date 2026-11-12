import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand, Section, SectionHeading } from "@/components/site/site-ui";
import { PortfolioStatus } from "@/components/site/portfolio-status";
import { PublishedProjects, type PublishedProject } from "@/components/site/published-projects";
import { prisma } from "@/lib/prisma";
import { publishedPortfolioWhere } from "@/features/portfolio/visibility";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Our Clients",
  description: "Explore The Weblish client project stories and the work behind them.",
  alternates: { canonical: "/our-clients/" },
  robots: { index: false, follow: false },
};

const storyParts = [
  { number: "01", title: "The brief", text: "The business context, audience, and reason for the project." },
  { number: "02", title: "The work", text: "The agreed scope and the design or development decisions made along the way." },
  { number: "03", title: "The result", text: "An outcome shared only when it can be accurately described and approved." },
];

export default async function Page() {
  let projects: PublishedProject[] = [];
  try {
    projects = await prisma.portfolioProject.findMany({ where: publishedPortfolioWhere(), orderBy: { publishedAt: "desc" }, take: 30, include: { coverMedia: { select: { url: true, altText: true } } } });
  } catch {
    // The checked-in portfolio migration may not yet be applied in development.
  }
  return <main className="clients-page">
    <section className="editorial-hero clients-hero" aria-labelledby="clients-title">
      <div className="site-container editorial-hero-inner">
        <div className="editorial-hero-copy">
          <p className="editorial-kicker"><span aria-hidden="true" /> Our clients / Our work</p>
          <h1 id="clients-title">Every project has <em>a story worth telling well.</em></h1>
          <p>{projects.length ? "Explore approved client stories and the work behind each project." : "We are preparing original project material and approvals before publishing client names, visuals, and case studies here."}</p>
          <a className="button button-dark" href="#selected-work">Explore this page <span aria-hidden="true">↓</span></a>
        </div>
        <div className="clients-hero-art" aria-hidden="true">
          <div className="clients-art-back" />
          <div className="clients-art-front"><span>Selected work</span><strong>Real work.<br />The full story.</strong><span>{projects.length ? "Approved case studies" : "Project material in review"}</span></div>
          <span className="clients-art-stamp">The Weblish</span>
        </div>
      </div>
    </section>

    <Section id="selected-work" className="clients-work-section">{projects.length ? <><SectionHeading eyebrow="Selected work" title="The work, and the story behind it." description="Published case studies are reviewed for client approval before they appear here." /><PublishedProjects projects={projects} /></> : <div className="clients-work-layout"><SectionHeading eyebrow="Selected work" title="The stories are being prepared." description="Project names, imagery, and results will be added when the original material is verified and approved for publication." /><PortfolioStatus /></div>}</Section>
    <Section tone="soft" className="clients-story-section"><SectionHeading eyebrow="What belongs in a project story" title="Context makes the work meaningful." description="A useful case study should explain what was needed, what was done, and what can be said about the outcome." /><div className="clients-story-grid">{storyParts.map((item) => <article className="clients-story-card" key={item.number}><span>{item.number}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}</div><Link href="/contact/" className="clients-story-link">Ask about relevant work <span aria-hidden="true">↗</span></Link></Section>
    <CtaBand title="Have a project in mind?" text="Tell us what you are planning and ask which examples can be shared with you." />
  </main>;
}
