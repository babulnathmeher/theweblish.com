"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { useAdminToast } from "@/components/admin/admin-toast";
import { BlogCoverPicker } from "@/components/admin/blog-cover-picker";
import { slugFromTitle } from "@/features/blogs/slug";
import { emptyPortfolioState, type PortfolioActionState } from "@/features/portfolio/validation";

type MediaOption = { id: string; fileName: string; url: string; altText: string | null };
export type PortfolioEditorValues = {
  id: string; title: string; slug: string; clientName: string; industry: string | null; services: string | null;
  projectUrl: string | null; summary: string; challenge: string; approach: string; outcome: string | null;
  coverMediaId: string | null; seoTitle: string | null; seoDescription: string | null;
  status: "DRAFT" | "PUBLISHED"; publishedAt: string | null;
};

export function PortfolioEditor({ action, project, media, storageConfigured, initialResult }: {
  action: (state: PortfolioActionState, formData: FormData) => Promise<PortfolioActionState>;
  project?: PortfolioEditorValues; media: MediaOption[]; storageConfigured: boolean; initialResult?: "created" | "save" | "publish" | "unpublish";
}) {
  const toast = useAdminToast();
  const [state, formAction, pending] = useActionState(action, emptyPortfolioState);
  const [title, setTitle] = useState(project?.title || "");
  const [slug, setSlug] = useState(project?.slug || "");
  const [slugEdited, setSlugEdited] = useState(Boolean(project));
  useEffect(() => {
    if (initialResult) toast({ created: "Draft case study created.", save: "Case study saved.", publish: "Case study published.", unpublish: "Case study moved to drafts." }[initialResult]);
  }, [initialResult, toast]);
  const error = (field: string) => state.fields[field] ? <span className="admin-portfolio-error" id={`portfolio-${field}-error`} role="alert">{state.fields[field]}</span> : null;
  const invalid = (field: string) => Boolean(state.fields[field]);
  const field = (name: string) => ({ "aria-invalid": invalid(name), "aria-describedby": invalid(name) ? `portfolio-${name}-error` : undefined });

  return <form action={formAction} className="admin-portfolio-editor" noValidate>
    {project && <input type="hidden" name="id" value={project.id} />}
    <div className="admin-portfolio-editor-main">
      <section className="admin-service-form-card"><div className="admin-service-form-heading"><span>01 / PROJECT DETAILS</span><h2>Set the scene.</h2><p>Save the first details as a private draft. Use the client’s approved name and description before publishing.</p></div>
        <div className="admin-portfolio-fields">
          <label className="is-wide">Project title <b aria-hidden="true">*</b><input name="title" value={title} maxLength={255} onChange={(event) => { const next = event.target.value; setTitle(next); if (!slugEdited) setSlug(slugFromTitle(next)); }} placeholder="Name this case study" {...field("title")} />{error("title")}</label>
          <label>Project anchor <b aria-hidden="true">*</b><span className="admin-portfolio-slug"><span>/our-clients/#</span><input name="slug" value={slug} maxLength={191} readOnly={Boolean(project)} onChange={(event) => { setSlug(slugFromTitle(event.target.value)); setSlugEdited(true); }} placeholder="project-name" {...field("slug")} /></span>{error("slug")}</label>
          <label>Client name<input name="clientName" defaultValue={project?.clientName || ""} maxLength={191} placeholder="Verified client or approved public name" {...field("clientName")} />{error("clientName")}</label>
          <label>Industry<input name="industry" defaultValue={project?.industry || ""} maxLength={100} placeholder="e.g. Education" {...field("industry")} />{error("industry")}</label>
          <label>Services delivered<input name="services" defaultValue={project?.services || ""} maxLength={255} placeholder="e.g. Strategy, design, development" {...field("services")} />{error("services")}</label>
          <label className="is-wide">Project website<input name="projectUrl" type="url" defaultValue={project?.projectUrl || ""} maxLength={2048} placeholder="https://example.com/" {...field("projectUrl")} />{error("projectUrl")}</label>
          <label className="is-wide">Short summary<textarea name="summary" defaultValue={project?.summary || ""} maxLength={2000} rows={4} placeholder="What the project was and who it served" {...field("summary")} />{error("summary")}</label>
        </div>
      </section>
      <section className="admin-service-form-card"><div className="admin-service-form-heading"><span>02 / CASE STUDY</span><h2>Tell the real story.</h2><p>Describe the brief, the work, and only outcomes you can substantiate. Markdown is supported; raw HTML is ignored in previews.</p></div>
        <div className="admin-portfolio-fields">
          <label className="is-wide">The challenge<textarea name="challenge" defaultValue={project?.challenge || ""} maxLength={100000} rows={8} placeholder="What did the client need to solve?" {...field("challenge")} />{error("challenge")}</label>
          <label className="is-wide">Our approach<textarea name="approach" defaultValue={project?.approach || ""} maxLength={100000} rows={8} placeholder="What did The Weblish actually do?" {...field("approach")} />{error("approach")}</label>
          <label className="is-wide">Outcome <small>(optional)</small><textarea name="outcome" defaultValue={project?.outcome || ""} maxLength={100000} rows={6} placeholder="Include measurable results only when verified and approved." {...field("outcome")} />{error("outcome")}</label>
        </div>
      </section>
      <section className="admin-service-form-card"><div className="admin-service-form-heading"><span>03 / SEARCH APPEARANCE</span><h2>Page details.</h2><p>Optional metadata for a future dedicated case-study route. The existing Our Clients page remains noindex while the route audit is incomplete.</p></div><div className="admin-portfolio-fields"><label className="is-wide">SEO title<input name="seoTitle" defaultValue={project?.seoTitle || ""} maxLength={255} placeholder="Leave blank to use the project title" {...field("seoTitle")} />{error("seoTitle")}</label><label className="is-wide">SEO description<textarea name="seoDescription" defaultValue={project?.seoDescription || ""} maxLength={320} rows={3} placeholder="A concise description of this project" {...field("seoDescription")} />{error("seoDescription")}</label></div></section>
    </div>
    <aside className="admin-portfolio-editor-side">
      <section className="admin-service-form-card"><div className="admin-service-form-heading"><span>PUBLICATION</span><h2>{project?.status === "PUBLISHED" ? "Published case study" : "Private draft"}</h2><p>{project?.publishedAt ? `Approved ${new Date(project.publishedAt).toLocaleDateString("en-IN")}` : "Drafts can be saved before the story is complete."}</p></div><div className="admin-portfolio-publication">
        {project && <Link href={`/admin/portfolio/${project.id}/preview/`} target="_blank" rel="noopener noreferrer">Preview saved case study ↗</Link>}
        {project && <label className="admin-portfolio-approval"><input type="checkbox" name="publicationApproved" /><span>I confirm the client name, project details, and selected image are approved for publication.</span></label>}
        {error("publicationApproved")}
        <p>Published case studies can appear on the existing Our Clients page. They remain out of search indexing while the public route and content are reviewed.</p>
      </div></section>
      <BlogCoverPicker kind="project" initialMedia={media} initialId={project?.coverMediaId || ""} storageConfigured={storageConfigured} invalid={invalid("coverMediaId")} />
      <div className="admin-service-actions">{state.message && <p className="admin-service-action-message" role="alert">{state.message}</p>}
        <button type="submit" name="intent" value="save" disabled={pending} className="admin-service-save">{pending ? "Saving…" : project ? "Save changes" : "Create draft"}<span aria-hidden="true">↗</span></button>
        {project && <button type="submit" name="intent" value={project.status === "PUBLISHED" ? "unpublish" : "publish"} disabled={pending} className="admin-service-secondary">{project.status === "PUBLISHED" ? "Move to draft" : "Publish case study"}</button>}
        <Link href="/admin/portfolio/" className="admin-service-cancel">Back to portfolio</Link>
      </div>
    </aside>
  </form>;
}
