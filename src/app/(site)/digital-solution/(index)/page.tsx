import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand, Section, SectionHeading } from "@/components/site/site-ui";
import { ServiceCards } from "@/components/site/service-cards";
import { ServiceIcon } from "@/components/site/service-icon";

export const metadata: Metadata = { title: "Digital Solutions", description: "Explore The Weblish website, design, and marketing service routes.", alternates: { canonical: "/digital-solution/" }, robots: { index: false, follow: false } };

export default function Page() {
  return <main className="services-page">
    <section className="services-hero" aria-labelledby="services-title">
      <div className="site-container services-hero-inner">
        <div className="services-hero-copy">
          <p className="services-kicker"><span aria-hidden="true" /> The Weblish / Digital services</p>
          <h1 id="services-title">Find the right <em>direction</em> for what&apos;s next.</h1>
          <p className="services-hero-intro">Explore website, design, and marketing services. We start with your brief, then shape the scope around what you actually need.</p>
          <div className="services-hero-actions"><Link className="button button-yellow" href="/contact/">Tell us about your project <span aria-hidden="true">↗</span></Link><a className="services-text-link" href="#services">Explore services <span aria-hidden="true">↓</span></a></div>
        </div>
        <div className="services-hero-art" aria-hidden="true">
          <span className="services-art-orbit services-art-orbit-one" /><span className="services-art-orbit services-art-orbit-two" />
          <div className="services-art-center"><span>Digital work</span><strong>Built around<br />your brief.</strong><span>The Weblish</span></div>
          <div className="services-art-tile services-art-tile-one"><ServiceIcon kind="browser" /><span>Websites</span></div>
          <div className="services-art-tile services-art-tile-two"><ServiceIcon kind="identity" /><span>Design</span></div>
          <div className="services-art-tile services-art-tile-three"><ServiceIcon kind="megaphone" /><span>Marketing</span></div>
          <div className="services-art-tile services-art-tile-four"><ServiceIcon kind="analytics" /><span>Measurement</span></div>
        </div>
      </div>
      <div className="site-container services-hero-bottom"><span>Websites</span><span>Design</span><span>Development</span><span>Marketing</span><span>Measurement</span></div>
    </section>

    <Section id="services" tone="soft" className="services-index-section"><SectionHeading eyebrow="Explore services" title="Choose a starting point." description="Browse the service areas below. Each page outlines the questions that help define a useful project brief." /><ServiceCards /></Section>
    <Section className="services-next-step-section"><div className="services-next-step"><div><p className="eyebrow">How to begin</p><h2>Start with the challenge. <em>We&apos;ll discuss the scope.</em></h2></div><div><p>Tell us what you are trying to achieve, who it is for, and what you already have. That context gives us a better starting point for a proposal.</p><Link className="services-next-link" href="/contact/">Start a conversation <span aria-hidden="true">↗</span></Link></div></div></Section>
    <CtaBand title="Need help choosing a direction?" text="Tell us what you are trying to achieve and what you already have." />
  </main>;
}
