"use client";

import { useState } from "react";

export function TicketForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setState("sending"); setError(""); setFields({});
    const payload = {
      name: String(data.get("name") || ""), email: String(data.get("email") || ""),
      phone: String(data.get("phone") || ""), websiteUrl: String(data.get("websiteUrl") || ""),
      category: String(data.get("category") || ""), subject: String(data.get("subject") || ""),
      description: String(data.get("description") || ""), consent: data.get("consent") === "on",
      sourcePage: window.location.href, website: String(data.get("website") || ""),
    };
    try {
      const response = await fetch("/api/tickets/", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) { setFields(result.fields || {}); setError(result.fields && Object.keys(result.fields).length ? "" : result.error || "Please try again."); setState("idle"); return; }
      setReference(result.reference); form.reset(); setState("sent");
    } catch { setError("We could not send your ticket. Please try again."); setState("idle"); }
  }

  if (state === "sent") return <div role="status" className="ticket-success"><span>Ticket received</span><h3>Keep this reference.</h3><strong>{reference}</strong><p>Your request has been saved. Quote this reference when contacting The Weblish about the issue.</p><button type="button" onClick={() => { setReference(""); setState("idle"); }}>Raise another ticket ↗</button></div>;

  return <form className="site-form ticket-form" onSubmit={submit} noValidate aria-busy={state === "sending"}>
    <p className="form-required-note ticket-form-wide">Fields marked <span aria-hidden="true">*</span> are required.</p>
    <label><span>Name <span className="required-marker" aria-hidden="true">*</span></span><input name="name" required maxLength={191} autoComplete="name" aria-invalid={Boolean(fields.name)} aria-describedby={fields.name ? "ticket-name-error" : undefined} />{fields.name && <span id="ticket-name-error" className="sr-only">{fields.name}</span>}</label>
    <label><span>Email <span className="required-marker" aria-hidden="true">*</span></span><input name="email" type="email" required maxLength={191} autoComplete="email" aria-invalid={Boolean(fields.email)} aria-describedby={fields.email ? "ticket-email-error" : undefined} />{fields.email && <span id="ticket-email-error" className="sr-only">{fields.email}</span>}</label>
    <label><span>Phone <span className="required-marker" aria-hidden="true">*</span></span><input name="phone" type="tel" required maxLength={50} autoComplete="tel" aria-invalid={Boolean(fields.phone)} aria-describedby={fields.phone ? "ticket-phone-error" : undefined} />{fields.phone && <span id="ticket-phone-error" className="sr-only">{fields.phone}</span>}</label>
    <label><span>Website URL <span className="required-marker" aria-hidden="true">*</span></span><input name="websiteUrl" type="url" required maxLength={2048} placeholder="https://" aria-invalid={Boolean(fields.websiteUrl)} aria-describedby={fields.websiteUrl ? "ticket-url-error" : undefined} />{fields.websiteUrl && <span id="ticket-url-error" className="sr-only">{fields.websiteUrl}</span>}</label>
    <label><span>Issue type <span className="required-marker" aria-hidden="true">*</span></span><select name="category" required defaultValue="" aria-invalid={Boolean(fields.category)} aria-describedby={fields.category ? "ticket-category-error" : undefined}><option value="" disabled>Select an issue type</option><option>Website issue</option><option>Access issue</option><option>Content update</option><option>Other</option></select>{fields.category && <span id="ticket-category-error" className="sr-only">{fields.category}</span>}</label>
    <label><span>Short subject <span className="required-marker" aria-hidden="true">*</span></span><input name="subject" required minLength={5} maxLength={255} placeholder="What needs fixing?" aria-invalid={Boolean(fields.subject)} aria-describedby={fields.subject ? "ticket-subject-error" : undefined} />{fields.subject && <span id="ticket-subject-error" className="sr-only">{fields.subject}</span>}</label>
    <label className="ticket-form-wide"><span>Describe the problem <span className="required-marker" aria-hidden="true">*</span></span><textarea name="description" required minLength={20} maxLength={4000} rows={6} placeholder="What happened, which page is affected, and what did you expect?" aria-invalid={Boolean(fields.description)} aria-describedby={fields.description ? "ticket-description-error" : undefined} />{fields.description && <span id="ticket-description-error" className="sr-only">{fields.description}</span>}</label>
    <label className="checkbox-label ticket-form-wide"><input name="consent" type="checkbox" required aria-invalid={Boolean(fields.consent)} aria-describedby={fields.consent ? "ticket-consent-error" : undefined} /><span>I agree to be contacted about this support request. <span className="required-marker" aria-hidden="true">*</span></span></label>
    {fields.consent && <p id="ticket-consent-error" className="sr-only ticket-form-wide">{fields.consent}</p>}
    <div className="hidden" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    {error && <p role="alert" className="form-alert ticket-form-wide">{error}</p>}
    <button disabled={state === "sending"} className="button button-dark form-submit ticket-form-wide disabled:opacity-50">{state === "sending" ? "Submitting…" : "Raise support ticket"} <span aria-hidden="true">↗</span></button>
  </form>;
}
