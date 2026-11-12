import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/forms/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Send The Weblish a message about your project or question.",
  alternates: { canonical: "/contact/" },
  robots: { index: false, follow: false },
};

export default function ContactPage() {
  return <main className="contact-page">
    <section className="contact-hero" aria-labelledby="contact-title">
      <div className="site-container contact-hero-inner">
        <div className="contact-hero-copy">
          <p className="editorial-kicker"><span aria-hidden="true" /> Contact The Weblish</p>
          <h1 id="contact-title">Let&apos;s make room for <em>the next idea.</em></h1>
          <p>Tell us what you are planning, what you need help with, or what you would like to ask. A clear conversation is a good place to begin.</p>
          <a className="contact-hero-link" href="#contact-form">Write to us <span aria-hidden="true">↓</span></a>
        </div>
        <div className="contact-hero-art" aria-hidden="true">
          <span className="contact-art-orbit contact-art-orbit-outer" />
          <span className="contact-art-orbit contact-art-orbit-inner" />
          <span className="contact-art-label">The Weblish / Contact</span>
          <strong>Have<br />something<br /><em>in mind?</em></strong>
          <span className="contact-art-corner">↗</span>
        </div>
      </div>
      <div className="site-container contact-hero-bottom"><span>Start with a message</span><span>Websites · Design · Digital marketing</span></div>
    </section>

    <section id="contact-form" className="site-section contact-form-section" aria-labelledby="contact-form-title">
      <div className="site-container contact-form-layout">
        <div className="contact-form-intro">
          <p className="eyebrow">Your message</p>
          <h2 id="contact-form-title">Tell us what&apos;s on your mind.</h2>
          <p>Share a few useful details and we can discuss the right next step. The form below is for general enquiries.</p>
          <div className="contact-route-card">
            <span>Planning a website?</span>
            <h3>Start with the project brief.</h3>
            <p>Our website form asks about your requirements, budget range, and the kind of site you need.</p>
            <Link href="/website-development/#quote">Request a website quote <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
        <div className="contact-form-panel">
          <div className="contact-form-panel-head"><span>01 / Send a message</span><span aria-hidden="true">↗</span></div>
          <ContactForm />
        </div>
      </div>
    </section>
  </main>;
}
