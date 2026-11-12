import type { Metadata } from "next";
import Link from "next/link";
import { TicketForm } from "@/components/forms/ticket-form";

export const metadata: Metadata = {
  title: "Raise a support ticket",
  description: "Tell The Weblish about a problem with an existing project and receive a support reference.",
  alternates: { canonical: "/support/" },
  robots: { index: false, follow: false },
};

export default function SupportPage() {
  return <main className="support-page">
    <section className="support-hero" aria-labelledby="support-title"><div className="site-container support-hero-inner">
      <div><p className="editorial-kicker"><span aria-hidden="true" /> The Weblish / Client support</p><h1 id="support-title">Something wrong?<br /><em>Let&apos;s fix it.</em></h1><p>Tell us what is happening with your existing website or project. Include the affected page and the steps that led to the problem.</p><a className="support-hero-link" href="#raise-ticket">Raise a ticket <span aria-hidden="true">↓</span></a></div>
      <div className="support-hero-panel" aria-hidden="true"><span>Support request / Intake</span><strong>Tell us<br />what went<br /><em>wrong.</em></strong><div><span>01 / Share the issue</span><span>02 / Keep your reference</span><span>03 / We review the request</span></div></div>
    </div></section>
    <section id="raise-ticket" className="site-section support-form-section" aria-labelledby="support-form-title"><div className="site-container support-form-layout">
      <div className="support-form-intro"><p className="eyebrow">Raise a ticket</p><h2 id="support-form-title">Give us the details.</h2><p>Use the email associated with your project if possible. A clear subject, affected URL, and steps to reproduce the issue help us review it.</p><div className="support-help-card"><span>Starting a new project?</span><p>This form is for support on existing work. For a new enquiry, start a conversation with us.</p><Link href="/contact/">Go to contact <span aria-hidden="true">↗</span></Link></div><p className="support-privacy-note">Do not include passwords or other secrets in the description. We are not accepting file attachments through this form.</p></div>
      <div className="support-form-panel"><div className="support-form-panel-head"><span>New support request</span><span>01 / 01</span></div><TicketForm /></div>
    </div></section>
  </main>;
}
