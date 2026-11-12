"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { manageBlogPost } from "@/features/blogs/actions";
import { useAdminToast } from "@/components/admin/admin-toast";

type ActionIconName = "edit" | "preview" | "view" | "publish" | "unpublish" | "delete";

function ActionIcon({ name }: { name: ActionIconName }) {
  const paths: Record<ActionIconName, React.ReactNode> = {
    edit: <><path d="M12 20h9" /><path d="m16.5 3.5 4 4L9 19l-5 1 1-5L16.5 3.5Z" /></>,
    preview: <><path d="M2 12s3.5-6 10-6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
    view: <><path d="M14 4h6v6" /><path d="m20 4-9 9" /><path d="M20 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h6" /></>,
    publish: <><path d="M12 16V3" /><path d="m6 9 6-6 6 6" /><path d="M4 17v3h16v-3" /></>,
    unpublish: <><path d="M12 3v13" /><path d="m6 10 6 6 6-6" /><path d="M4 17v3h16v-3" /></>,
    delete: <><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="m5 6 1 14h12l1-14" /><path d="M10 10v6M14 10v6" /></>,
  };
  return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export function BlogRowActions({ id, title, slug, status, live, basePath = "/admin/blogs", canPublish = true }: {
  id: string; title: string; slug: string; status: "DRAFT" | "PUBLISHED"; live: boolean; basePath?: string; canPublish?: boolean;
}) {
  const [state, action, pending] = useActionState(manageBlogPost, { success: false, message: "" });
  const router = useRouter();
  const toast = useAdminToast();
  useEffect(() => {
    if (!state.message) return;
    toast(state.message, state.success ? "success" : "error");
    if (state.success) router.refresh();
  }, [state, router, toast]);

  return <div className="admin-post-row-actions">
    <Link href={`${basePath}/${id}/edit/`} aria-label={`Edit ${title}`} title="Edit post"><ActionIcon name="edit" /></Link>
    <Link href={`${basePath}/${id}/preview/`} target="_blank" rel="noopener noreferrer" aria-label={`Preview ${title} in a new tab`} title="Preview post"><ActionIcon name="preview" /></Link>
    {live && <Link href={`/${slug}/`} target="_blank" rel="noopener noreferrer" aria-label={`View ${title} on the website in a new tab`} title="View live post"><ActionIcon name="view" /></Link>}
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="confirm" value="DELETE" />
      {canPublish && <button type="submit" name="intent" value={status === "DRAFT" ? "publish" : "unpublish"} disabled={pending} aria-label={`${status === "DRAFT" ? "Publish" : "Move to draft"} ${title}`} title={status === "DRAFT" ? "Publish post" : "Move to draft"} onClick={(event) => {
        if (status === "DRAFT" && !window.confirm(`Publish â€œ${title}â€ now?`)) event.preventDefault();
      }}><ActionIcon name={status === "DRAFT" ? "publish" : "unpublish"} /></button>}
      <button type="submit" name="intent" value="delete" className="is-danger" disabled={pending} aria-label={`Delete ${title}`} title="Delete post" onClick={(event) => {
        if (!window.confirm(`Permanently delete â€œ${title}â€? This cannot be undone.`)) event.preventDefault();
      }}><ActionIcon name="delete" /></button>
    </form>
  </div>;
}
