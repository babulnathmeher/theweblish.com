"use client";

import { useState } from "react";

export function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setState("sending"); setError(""); setFields({});
    const payload = {
      name: String(data.get("name") || ""), email: String(data.get("email") || ""),
      phone: String(data.get("phone") || ""), subject: String(data.get("subject") || ""),
      message: String(data.get("message") || ""), consent: data.get("consent") === "on",
      sourcePage: window.location.href, website: String(data.get("website") || ""),
    };
    try {
      const response = await fetch("/api/contact/", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) { setFields(result.fields || {}); setError(result.fields && Object.keys(result.fields).length ? "" : result.error || "Please try again."); setState("idle"); return; }
      form.reset(); setState("sent");
    } catch { setError("We could not send your message. Please try again."); setState("idle"); }
  }
  if (state === "sent") return <p role="status" className="form-success">Thank you. Your message has been received.</p>;
  return <form className="site-form" onSubmit={submit} noValidate aria-busy={state === "sending"}>
    <p className="form-required-note">Fields marked <span aria-hidden="true">*</span> are required.</p>
    <label><span>Name <span className="required-marker" aria-hidden="true">*</span></span><input name="name" required maxLength={191} autoComplete="name" aria-invalid={Boolean(fields.name)} aria-describedby={fields.name ? "contact-name-error" : undefined} />{fields.name && <span id="contact-name-error" className="sr-only">{fields.name}</span>}</label>
    <label><span>Email <span className="required-marker" aria-hidden="true">*</span></span><input name="email" type="email" required maxLength={191} autoComplete="email" aria-invalid={Boolean(fields.email)} aria-describedby={fields.email ? "contact-email-error" : undefined} />{fields.email && <span id="contact-email-error" className="sr-only">{fields.email}</span>}</label>
    <label><span>Phone <span className="required-marker" aria-hidden="true">*</span></span><input name="phone" type="tel" required maxLength={50} autoComplete="tel" aria-invalid={Boolean(fields.phone)} aria-describedby={fields.phone ? "contact-phone-error" : undefined} />{fields.phone && <span id="contact-phone-error" className="sr-only">{fields.phone}</span>}</label>
    <label>Subject (optional) <input name="subject" maxLength={255} aria-invalid={Boolean(fields.subject)} aria-describedby={fields.subject ? "contact-subject-error" : undefined} />{fields.subject && <span id="contact-subject-error" className="sr-only">{fields.subject}</span>}</label>
    <label><span>Message <span className="required-marker" aria-hidden="true">*</span></span><textarea name="message" required minLength={10} maxLength={4000} rows={6} aria-invalid={Boolean(fields.message)} aria-describedby={fields.message ? "contact-message-error" : undefined} />{fields.message && <span id="contact-message-error" className="sr-only">{fields.message}</span>}</label>
    <label className="checkbox-label"><input name="consent" type="checkbox" required aria-invalid={Boolean(fields.consent)} aria-describedby={fields.consent ? "contact-consent-error" : undefined} /><span>I agree to be contacted about my message. <span className="required-marker" aria-hidden="true">*</span></span></label>
    {fields.consent && <p id="contact-consent-error" className="sr-only">{fields.consent}</p>}
    <div className="hidden" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    {error && <p role="alert" className="form-alert">{error}</p>}
    <button disabled={state === "sending"} className="button button-dark form-submit disabled:opacity-50">{state === "sending" ? "Sending…" : "Send message"}</button>
  </form>;
}
