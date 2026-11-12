import type { Metadata } from "next";
import { ArrowLink, CtaBand, Section, SectionHeading } from "@/components/site/site-ui";
import { HomeHero } from "@/components/site/home-hero";
import { ServiceCards } from "@/components/site/service-cards";
import { ProcessSteps } from "@/components/site/process-steps";
import { PortfolioStatus } from "@/components/site/portfolio-status";
import { HomeJournal } from "@/components/site/home-journal";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Digital agency for websites, design and marketing", description: "Explore The Weblish services and start a conversation about your next digital project.", alternates: { canonical: "/" }, robots: { index: false, follow: false } };

export default async function HomePage() {
  const journal = await HomeJournal();
  return <main>
    <HomeHero />
    <Section tone="soft"><SectionHeading eyebrow="What we do" title="Digital services, considered together." description="Explore the services listed across The Weblish site. The right scope starts with your goals, not a preset claim." /><ServiceCards count={6} /><div className="mt-10"><ArrowLink href="/digital-solution/">View all services</ArrowLink></div></Section>
    <Section><SectionHeading eyebrow="Our work" title="See the work behind the conversation." description="Portfolio entries will be published with verified project details and permission to show them." /><PortfolioStatus /></Section>
    <Section tone="dark"><div className="feature-grid"><SectionHeading eyebrow="Why The Weblish" title="A clearer path from idea to launch." description="A project works best when the goals, scope, and decisions are visible from the beginning." light /><div className="feature-stack"><div className="feature-item"><h3>Start with the brief</h3><p>Share what you need, who it serves, and what is already in place.</p></div><div className="feature-item"><h3>Agree on the scope</h3><p>Review deliverables and exclusions in a proposal before work begins.</p></div><div className="feature-item"><h3>Keep the conversation open</h3><p>Use feedback and reviews to guide the work through completion.</p></div></div></div></Section>
    <Section tone="soft"><SectionHeading eyebrow="How work moves" title="A practical process, one step at a time." description="The exact plan depends on your project. These are the stages to discuss when starting a new engagement." /><ProcessSteps /></Section>
    <Section><div className="feature-grid"><SectionHeading eyebrow="Introducing TW Automate" title="A new chapter to discuss." description="TW Automate is part of the conversation around what comes next for The Weblish. Its details will be shared after they are confirmed." /><div className="statement-panel"><h3>Curious about TW Automate?</h3><p>Ask us directly while the public description is being prepared.</p><ArrowLink href="/contact/">Start a conversation</ArrowLink></div></div></Section>
    {journal}
    <CtaBand title="Have a project in mind?" text="Tell us what you want to create. We will use your brief to start the conversation." href="/website-development/" label="Request a website quote" />
  </main>;
}
