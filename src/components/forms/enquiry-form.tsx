"use client";

import { useState } from "react";
import { budgetRanges, serviceInterests } from "@/features/leads/validation";

const serviceLabels: Record<(typeof serviceInterests)[number], string> = {
  "business-website": "Business website", ecommerce: "E-commerce website",
  "landing-page": "Landing page", redesign: "Website redesign", other: "Other",
};
const budgetLabels: Record<(typeof budgetRanges)[number], string> = {
  "under-25000": "Under INR 25,000", "25000-50000": "INR 25,000 to 50,000",
  "50000-100000": "INR 50,000 to 1,00,000", "over-100000": "Over INR 1,00,000", unsure: "Not sure yet",
};

export function EnquiryForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending"); setError(""); setFields({});
    const form = event.currentTarget;
    const data = new FormData(form);
    const params = new URLSearchParams(window.location.search);
    const payload = {
      name: String(data.get("name") || ""), phone: String(data.get("phone") || ""),
      email: String(data.get("email") || ""), serviceInterest: String(data.get("serviceInterest") || ""),
      budgetRange: String(data.get("budgetRange") || ""), message: String(data.get("message") || ""),
      consent: data.get("consent") === "on", landingPageUrl: window.location.href,
      utmSource: params.get("utm_source") || "", utmMedium: params.get("utm_medium") || "",
      utmCampaign: params.get("utm_campaign") || "", utmTerm: params.get("utm_term") || "",
      utmContent: params.get("utm_content") || "", website: String(data.get("website") || ""),
    };
    try {
      const response = await fetch("/api/enquiries/", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) {
        setFields(result.fields || {});
        setError(result.fields && Object.keys(result.fields).length ? "" : result.error || "Please try again.");
        setState("idle");
        return;
      }
      form.reset();
      setState("sent");
    } catch {
      setError("We could not send your enquiry. Please try again.");
      setState("idle");
    }
  }

  if (state === "sent") return <p role="status" className="form-success">Thank you. Your enquiry has been received.</p>;

  const inputClass = "";
  return <form onSubmit={submit} className="site-form" noValidate aria-busy={state === "sending"}>
    <p className="form-required-note">Fields marked <span aria-hidden="true">*</span> are required.</p>
    <label className="grid"><span>Name <span className="required-marker" aria-hidden="true">*</span></span><input className={inputClass} name="name" maxLength={191} required autoComplete="name" aria-invalid={Boolean(fields.name)} aria-describedby={fields.name ? "enquiry-name-error" : undefined} />{fields.name && <span id="enquiry-name-error" className="sr-only">{fields.name}</span>}</label>
    <label className="grid"><span>Mobile number <span className="required-marker" aria-hidden="true">*</span></span><input className={inputClass} name="phone" type="tel" maxLength={30} required autoComplete="tel" inputMode="tel" aria-invalid={Boolean(fields.phone)} aria-describedby={fields.phone ? "enquiry-phone-error" : undefined} />{fields.phone && <span id="enquiry-phone-error" className="sr-only">{fields.phone}</span>}</label>
    <label className="grid">Email (optional) <input className={inputClass} name="email" type="email" maxLength={191} autoComplete="email" aria-invalid={Boolean(fields.email)} aria-describedby={fields.email ? "enquiry-email-error" : undefined} />{fields.email && <span id="enquiry-email-error" className="sr-only">{fields.email}</span>}</label>
    <label className="grid"><span>Service interest <span className="required-marker" aria-hidden="true">*</span></span><select className={inputClass} name="serviceInterest" required defaultValue="" aria-invalid={Boolean(fields.serviceInterest)} aria-describedby={fields.serviceInterest ? "enquiry-service-error" : undefined}><option value="" disabled>Select a service</option>{serviceInterests.map((value) => <option key={value} value={value}>{serviceLabels[value]}</option>)}</select>{fields.serviceInterest && <span id="enquiry-service-error" className="sr-only">{fields.serviceInterest}</span>}</label>
    <label className="grid"><span>Budget range <span className="required-marker" aria-hidden="true">*</span></span><select className={inputClass} name="budgetRange" required defaultValue="" aria-invalid={Boolean(fields.budgetRange)} aria-describedby={fields.budgetRange ? "enquiry-budget-error" : undefined}><option value="" disabled>Select a range</option>{budgetRanges.map((value) => <option key={value} value={value}>{budgetLabels[value]}</option>)}</select>{fields.budgetRange && <span id="enquiry-budget-error" className="sr-only">{fields.budgetRange}</span>}</label>
    <label className="grid">Project details (optional) <textarea className={inputClass} name="message" maxLength={2000} rows={5} aria-invalid={Boolean(fields.message)} aria-describedby={fields.message ? "enquiry-message-error" : undefined} />{fields.message && <span id="enquiry-message-error" className="sr-only">{fields.message}</span>}</label>
    <label className="checkbox-label"><input name="consent" type="checkbox" required aria-invalid={Boolean(fields.consent)} aria-describedby={fields.consent ? "enquiry-consent-error" : undefined} /><span>I agree to be contacted about this enquiry. <span className="required-marker" aria-hidden="true">*</span></span></label>
    {fields.consent && <p id="enquiry-consent-error" className="sr-only">{fields.consent}</p>}
    <div className="hidden" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    {error && <p role="alert" className="form-alert">{error}</p>}
    <button type="submit" disabled={state === "sending"} className="button button-dark form-submit disabled:opacity-50">{state === "sending" ? "Sending…" : "Send enquiry"}</button>
  </form>;
}
