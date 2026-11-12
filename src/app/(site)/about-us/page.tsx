import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand, Section, SectionHeading } from "@/components/site/site-ui";
import { ProcessSteps } from "@/components/site/process-steps";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn how The Weblish approaches website, design, and digital marketing projects.",
  alternates: { canonical: "/about-us/" },
  robots: { index: false, follow: false },
};

const principles = [
  { number: "01", title: "Listen first", text: "Start with the people you want to reach and the challenge you want to solve." },
  { number: "02", title: "Make the scope clear", text: "Discuss deliverables, inputs, and constraints before deciding how the work should move." },
  { number: "03", title: "Review with purpose", text: "Connect feedback to the agreed direction so decisions stay useful." },
];

export default function Page() {
  return <main className="about-page">
    <section className="editorial-hero about-hero" aria-labelledby="about-title">
      <div className="site-container editorial-hero-inner">
        <div className="editorial-hero-copy">
          <p className="editorial-kicker"><span aria-hidden="true" /> About The Weblish</p>
          <h1 id="about-title">Good digital work starts with <em>a clearer question.</em></h1>
          <p>We bring website, design, and digital marketing conversations together around your business brief. The first step is understanding what you need the work to do.</p>
          <Link className="button button-yellow" href="/contact/">Start a conversation <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="about-hero-art" aria-hidden="true">
          <span className="about-art-ring about-art-ring-one" /><span className="about-art-ring about-art-ring-two" />
          <span className="about-art-corner">The Weblish / 01</span>
          <strong>Clarity<br /><span>shapes</span><br />what&apos;s next.</strong>
          <span className="about-art-bottom">Discover / Design / Build</span>
        </div>
      </div>
    </section>

    <Section className="about-intro-section">
      <div className="about-intro-grid">
        <p className="eyebrow">Our approach</p>
        <div><h2>Start with the brief. Then shape the work.</h2><p>A useful first conversation covers your audience, existing material, goals, and constraints. Those details help define a proposal with a scope that fits the project.</p></div>
      </div>
      <div className="about-principles">{principles.map((item) => <article className="about-principle" key={item.number}><span>{item.number} / Approach</span><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
    </Section>

    <Section tone="soft" className="about-process-section"><SectionHeading eyebrow="How work moves" title="A practical path, shaped by the project." description="The detail of every engagement is set by its own proposal. These stages give a new conversation a useful starting point." /><ProcessSteps /></Section>
    <CtaBand title="Tell us what you are planning." text="Share your goals, what you already have, and the questions you want to work through." />
  </main>;
}
