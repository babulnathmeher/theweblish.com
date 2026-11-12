"use client";

import Link from "next/link";
import { useActionState } from "react";
import { emptyServiceState, serviceIcons, servicePath, type ServiceActionState } from "@/features/services/validation";

export type ServiceEditorValues = {
  id?: string; title: string; slug: string; eyebrow: string; summary: string; content: string;
  category: string; icon: string; seoTitle: string | null; seoDescription: string | null;
  indexable: boolean; status?: "DRAFT" | "PUBLISHED"; publishedAt?: Date | null;
};

const iconNames: Record<(typeof serviceIcons)[number], string> = {
  browser: "Website", layout: "Layout", landing: "Landing page", identity: "Identity", code: "Development",
  editor: "Content editor", search: "Search", megaphone: "Marketing", social: "Social", analytics: "Analytics",
};

export function ServiceEditor({ action, values, legacySlug }: {
  action: (state: ServiceActionState, formData: FormData) => Promise<ServiceActionState>;
  values?: ServiceEditorValues;
  legacySlug?: string;
}) {
  const [state, formAction, pending] = useActionState(action, emptyServiceState);
  const invalid = (field: string) => Boolean(state.fields[field]);
  const describedBy = (field: string) => invalid(field) ? `service-${field}-error` : undefined;
  const fieldError = (field: string) => invalid(field) ? <span className="sr-only" id={`service-${field}-error`}>{state.fields[field]}</span> : null;
  const slugLocked = Boolean(values?.id || legacySlug);

  return <form action={formAction} className="admin-service-editor" noValidate>
    {values?.id && <input type="hidden" name="id" value={values.id} />}
    {legacySlug && <input type="hidden" name="legacySlug" value={legacySlug} />}
    <div className="admin-service-editor-main">
      <section className="admin-service-form-card"><div className="admin-service-form-heading"><span>01 / THE BASICS</span><h2>Service details</h2><p>Write the offer in clear terms. Saved drafts are only visible to administrators.</p></div><div className="admin-service-fields">
        <label><span>Service title <b aria-hidden="true">*</b></span><input name="title" defaultValue={values?.title || ""} maxLength={255} required aria-invalid={invalid("title")} aria-describedby={describedBy("title")} placeholder="e.g. Conversion focused websites" />{fieldError("title")}</label>
        <label><span>URL slug <b aria-hidden="true">*</b></span><div className="admin-service-slug-field"><span>{legacySlug ? "/" : "/digital-solution/"}</span><input name="slug" defaultValue={values?.slug || legacySlug || ""} maxLength={191} required readOnly={slugLocked} aria-invalid={invalid("slug")} aria-describedby={describedBy("slug")} placeholder="service-name" /></div>{fieldError("slug")}<small>{slugLocked ? "This URL is preserved to avoid broken links." : "Use lowercase letters, numbers, and hyphens. The URL is fixed after creation."}</small></label>
        <label><span>Short label <b aria-hidden="true">*</b></span><input name="eyebrow" defaultValue={values?.eyebrow || ""} maxLength={191} required aria-invalid={invalid("eyebrow")} aria-describedby={describedBy("eyebrow")} placeholder="e.g. Web strategy" />{fieldError("eyebrow")}</label>
        <label><span>Category <b aria-hidden="true">*</b></span><input name="category" defaultValue={values?.category || ""} maxLength={100} required aria-invalid={invalid("category")} aria-describedby={describedBy("category")} placeholder="e.g. Websites" />{fieldError("category")}</label>
        <label className="admin-service-field-wide"><span>Short summary <b aria-hidden="true">*</b></span><textarea name="summary" defaultValue={values?.summary || ""} maxLength={2000} rows={4} required aria-invalid={invalid("summary")} aria-describedby={describedBy("summary")} placeholder="A concise description shown in the hero and service cards." />{fieldError("summary")}</label>
        <label className="admin-service-field-wide"><span>Full description (Markdown) <b aria-hidden="true">*</b></span><textarea name="content" defaultValue={values?.content || ""} maxLength={100000} rows={14} required aria-invalid={invalid("content")} aria-describedby={describedBy("content")} placeholder="Explain the service, scope, and who it is for." />{fieldError("content")}<small>Markdown is supported. Raw HTML is not rendered on the public page.</small></label>
      </div></section>
      <section className="admin-service-form-card"><div className="admin-service-form-heading"><span>02 / SEARCH APPEARANCE</span><h2>Search preview</h2><p>Optional SEO text. A page enters the sitemap only when published and indexing is enabled.</p></div><div className="admin-service-fields"><label className="admin-service-field-wide"><span>SEO title</span><input name="seoTitle" defaultValue={values?.seoTitle || ""} maxLength={255} aria-invalid={invalid("seoTitle")} aria-describedby={describedBy("seoTitle")} placeholder="Leave blank to use the service title" />{fieldError("seoTitle")}</label><label className="admin-service-field-wide"><span>SEO description</span><textarea name="seoDescription" defaultValue={values?.seoDescription || ""} maxLength={320} rows={3} aria-invalid={invalid("seoDescription")} aria-describedby={describedBy("seoDescription")} placeholder="Leave blank to use the short summary" />{fieldError("seoDescription")}</label></div></section>
    </div>
    <aside className="admin-service-editor-side"><section className="admin-service-form-card"><div className="admin-service-form-heading"><span>PUBLICATION</span><h2>{values?.status === "PUBLISHED" ? "Live service" : "Draft service"}</h2><p>{values?.publishedAt ? `Published ${new Date(values.publishedAt).toLocaleDateString("en-IN")}` : "Only admins can see this draft."}</p></div><div className="admin-service-publication"><label><input type="checkbox" name="indexable" defaultChecked={values?.indexable || false} /><span><strong>Allow search indexing</strong><small>Only applies after publishing. Leave off until content has been reviewed.</small></span></label>{values?.id && <Link href={`/admin/services/${values.id}/preview/`}>Preview saved version ↗</Link>}{values?.status === "PUBLISHED" && <Link href={servicePath(values.slug)} target="_blank" rel="noopener noreferrer">View live page ↗</Link>}</div></section><section className="admin-service-form-card"><div className="admin-service-form-heading"><span>VISUAL</span><h2>Service icon</h2></div><label className="admin-service-icon-select"><span>Choose an icon <b aria-hidden="true">*</b></span><select name="icon" defaultValue={values?.icon || "browser"} required aria-invalid={invalid("icon")} aria-describedby={describedBy("icon")}>{serviceIcons.map((icon) => <option value={icon} key={icon}>{iconNames[icon]}</option>)}</select>{fieldError("icon")}</label></section><div className="admin-service-actions">{state.message && !Object.keys(state.fields).length && <p role="status" className="admin-service-action-message">{state.message}</p>}<button type="submit" name="intent" value="save" disabled={pending} className="admin-service-save">{pending ? "Saving…" : values?.id ? "Save changes" : "Create draft"} <span aria-hidden="true">↗</span></button>{values?.id && <button type="submit" name="intent" value={values.status === "PUBLISHED" ? "unpublish" : "publish"} disabled={pending} className="admin-service-secondary">{values.status === "PUBLISHED" ? "Unpublish service" : "Publish service"}</button>}<Link href="/admin/services/" className="admin-service-cancel">Back to services</Link></div></aside>
  </form>;
}
