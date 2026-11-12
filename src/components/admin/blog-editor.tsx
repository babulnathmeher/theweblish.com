"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { BlogTextEditor } from "@/components/admin/blog-text-editor";
import { BlogCoverPicker } from "@/components/admin/blog-cover-picker";
import { type BlogActionState, emptyBlogState } from "@/features/blogs/validation";
import { slugFromTitle } from "@/features/blogs/slug";
import { useAdminToast } from "@/components/admin/admin-toast";
import { legacyArticleSlugs } from "@/config/site";

type BlogValues = {
  id: string; title: string; slug: string; excerpt: string | null; content: string;
  seoTitle: string | null; seoDescription: string | null; authorId: string;
  coverMediaId: string | null; status: "DRAFT" | "PUBLISHED"; publishedAt: string | null;
};

export function BlogEditor({
  action, post, authors, media, storageConfigured, initiallySaved = false, basePath = "/admin/blogs", canPublish = true, canUpload = true,
}: {
  action: (state: BlogActionState, formData: FormData) => Promise<BlogActionState>;
  post?: BlogValues;
  authors: { id: string; name: string; email: string }[];
  media: { id: string; fileName: string; url: string; altText: string | null }[];
  storageConfigured: boolean;
  initiallySaved?: boolean;
  basePath?: string;
  canPublish?: boolean;
  canUpload?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, emptyBlogState);
  const router = useRouter();
  const toast = useAdminToast();
  const initialToastShown = useRef(false);
  useEffect(() => {
    if (!initiallySaved || initialToastShown.current) return;
    initialToastShown.current = true;
    toast("Draft saved to the database. It is private until published.");
    const url = new URL(window.location.href);
    url.searchParams.delete("saved");
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
  }, [initiallySaved, toast]);
  useEffect(() => {
    if (!state.message) return;
    if (["Saved.", "Published.", "Unpublished."].includes(state.message)) {
      toast(state.message === "Saved." ? "Post saved." : state.message === "Published." ? "Post published." : "Post unpublished.");
      router.refresh();
    } else toast(Object.values(state.fields)[0] || state.message, "error");
  }, [router, state, toast]);
  const [title, setTitle] = useState(post?.title || "");
  const [slug, setSlug] = useState(post?.slug || "");
  const [slugEdited, setSlugEdited] = useState(Boolean(post));
  const isLegacyArticle = legacyArticleSlugs.has(slugFromTitle(slugEdited ? slug : title));
  function changeTitle(value: string) {
    setTitle(value);
    if (!slugEdited) setSlug(slugFromTitle(value));
  }
  const input = (field: string) => `mt-1 w-full rounded border p-2 ${state.fields[field] ? "border-2 border-red-700" : "border-neutral-500"}`;
  const fieldError = (field: string) => state.fields[field] ? <span id={`blog-${field}-error`} className="sr-only">{state.fields[field]}</span> : null;
  const fieldDescription = (field: string) => state.fields[field] ? `blog-${field}-error` : undefined;
  return <form action={formAction} className="admin-blog-form" noValidate>
    {post && <input type="hidden" name="id" value={post.id} />}
    <input type="hidden" name="slugMode" value={slugEdited ? "manual" : "auto"} />
    <div className="admin-blog-command-bar"><div><span className="admin-blog-command-icon" aria-hidden="true">âœ¦</span><strong>{post ? "Edit post" : "New post"}</strong><span className={`admin-service-status${post?.status === "PUBLISHED" ? " is-published" : ""}`}>{post?.status === "PUBLISHED" ? "Published" : "Draft"}</span></div><div className="admin-blog-command-actions">{post && <Link href={`${basePath}/${post.id}/preview/`}>Preview saved post</Link>}<button disabled={pending} name="intent" value="save" type="submit" className="admin-blog-save-button">{pending ? "Savingâ€¦" : post?.status === "PUBLISHED" ? "Update" : "Save draft"}</button>{canPublish && post && post.status !== "PUBLISHED" && <button disabled={pending} name="intent" value="publish" type="submit" className="admin-blog-publish-button">Publish</button>}</div></div>
    <p className="form-required-note">Fields marked <span aria-hidden="true">*</span> are required. Save draft stores your work privately in the database.</p>
    <div className="admin-blog-editor-grid"><div className="admin-blog-editor-main">
    <div className="admin-service-form-heading"><span>01 / STORY</span><h2>Article details</h2><p>Give the post a clear headline and a useful summary.</p></div>
    <label className="admin-blog-title-label"><span>Post title <span className="required-marker" aria-hidden="true">*</span></span><input name="title" className={input("title")} required maxLength={255} value={title} onChange={(event) => changeTitle(event.target.value)} placeholder="Add a title" aria-invalid={Boolean(state.fields.title)} aria-describedby={fieldDescription("title")} />{fieldError("title")}</label>
    <div className="admin-blog-permalink"><label htmlFor="blog-slug">Permalink <span className="required-marker" aria-hidden="true">*</span></label><div><span>theweblish.in/</span><input id="blog-slug" name="slug" className={input("slug")} required maxLength={191} pattern="[a-z0-9]+(-[a-z0-9]+)*" value={slug} onChange={(event) => { setSlug(event.target.value); setSlugEdited(true); }} onBlur={() => { if (slugEdited) setSlug(slugFromTitle(slug)); }} placeholder="post-url" aria-invalid={Boolean(state.fields.slug)} aria-describedby={fieldDescription("slug")} /><span>/</span></div><button type="button" onClick={() => { setSlug(slugFromTitle(title)); setSlugEdited(false); }}>Use title</button>{fieldError("slug")}</div>
    {isLegacyArticle && post?.status !== "PUBLISHED" && <div className="admin-blog-legacy-import"><strong>Preserved article URL</strong><p>This URL belongs to an earlier article. Add its original content and save it as a private draft. It stays 404 until you publish it.</p><label><input type="checkbox" name="legacyOriginalImport" value="yes" /><span>{post ? "I confirm this is the original article content for the preserved URL." : "I am importing the original article content for this URL."}</span></label></div>}
    <label className="grid">Excerpt<textarea name="excerpt" className={input("excerpt")} maxLength={1000} rows={3} defaultValue={post?.excerpt || ""} aria-invalid={Boolean(state.fields.excerpt)} aria-describedby={fieldDescription("excerpt")} />{fieldError("excerpt")}</label>
    <div className="admin-blog-body-field"><span>Article body <small>Required before publishing</small></span><BlogTextEditor initialValue={post?.content || ""} invalid={Boolean(state.fields.content)} />{fieldError("content")}</div>
    <div className="admin-service-form-heading"><span>02 / DISCOVERY</span><h2>Search appearance</h2><p>Optional details for search results and social previews.</p></div>
    <label className="grid">SEO title<input name="seoTitle" className={input("seoTitle")} maxLength={255} defaultValue={post?.seoTitle || ""} aria-invalid={Boolean(state.fields.seoTitle)} aria-describedby={fieldDescription("seoTitle")} />{fieldError("seoTitle")}</label>
    <label className="grid">SEO description<textarea name="seoDescription" className={input("seoDescription")} maxLength={320} rows={3} defaultValue={post?.seoDescription || ""} aria-invalid={Boolean(state.fields.seoDescription)} aria-describedby={fieldDescription("seoDescription")} />{fieldError("seoDescription")}</label>
    </div><aside className="admin-blog-editor-side"><div className="admin-service-form-heading"><span>POST SETTINGS</span><h2>{post?.status === "PUBLISHED" ? "Live article" : "Draft article"}</h2><p>{post?.status === "PUBLISHED" ? "Visible on the public website." : "Only admins can view this article."}</p></div>
    <BlogCoverPicker initialMedia={media} initialId={post?.coverMediaId || ""} storageConfigured={storageConfigured} uploadAllowed={canUpload} invalid={Boolean(state.fields.coverMediaId)} />{fieldError("coverMediaId")}
    <label className="grid"><span>Author <span className="required-marker" aria-hidden="true">*</span></span><select name="authorId" className={input("authorId")} required defaultValue={post?.authorId || authors[0]?.id || ""} aria-invalid={Boolean(state.fields.authorId)} aria-describedby={fieldDescription("authorId")}>{authors.map((author) => <option key={author.id} value={author.id}>{author.name} ({author.email})</option>)}</select>{fieldError("authorId")}</label>
    {post && <label className="grid">Publication time (UTC)<input name="publishedAt" type="datetime-local" className={input("publishedAt")} defaultValue={post.publishedAt?.slice(0, 16) || ""} aria-invalid={Boolean(state.fields.publishedAt)} aria-describedby={fieldDescription("publishedAt")} />{fieldError("publishedAt")}</label>}
    {post && <p>Status: <strong>{post.status}</strong> Â· Published: {post.publishedAt ? new Date(post.publishedAt).toLocaleString("en-IN") : "Not published"}</p>}
    {canPublish && post?.status === "PUBLISHED" && <div className="admin-service-actions"><button disabled={pending} name="intent" value="unpublish" className="admin-service-secondary">Unpublish post</button></div>}
    </aside></div>
  </form>;
}
