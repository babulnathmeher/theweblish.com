"use client";

/* eslint-disable @next/next/no-img-element -- Media URLs are validated public object-storage records. */
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminToast } from "@/components/admin/admin-toast";

export type MediaItem = {
  id: string; fileName: string; url: string; altText: string | null;
  mimeType: string; sizeBytes: number; createdAt: string;
  width: number | null; height: number | null; _count: { posts: number; portfolioProjects: number };
};

function fileSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function usageCount(item: MediaItem) {
  return item._count.posts + item._count.portfolioProjects;
}

export function MediaLibrary({ items, storageConfigured }: { items: MediaItem[]; storageConfigured: boolean }) {
  const router = useRouter();
  const toast = useAdminToast();
  const dialog = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [altText, setAltText] = useState("");
  const [busy, setBusy] = useState(false);
  const [removedIds, setRemovedIds] = useState<string[]>([]);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (selected && !element.open) element.showModal();
    if (!selected && element.open) element.close();
  }, [selected]);

  function inspect(item: MediaItem) {
    setSelected(item);
    setAltText(item.altText || "");
  }

  async function copyUrl() {
    if (!selected) return;
    try {
      await navigator.clipboard.writeText(selected.url);
      toast("Image URL copied.");
    } catch { toast("Could not copy the image URL.", "error"); }
  }

  async function save() {
    if (!selected) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/media/${selected.id}/`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ altText }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.media) throw new Error(result?.error || "Could not save image details.");
      setSelected({ ...selected, altText: result.media.altText });
      toast("Image description updated.");
      router.refresh();
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not save image details.", "error");
    } finally { setBusy(false); }
  }

  async function remove() {
    if (!selected || busy || usageCount(selected) > 0 || !storageConfigured) return;
    if (!window.confirm(`Permanently delete "${selected.fileName}" from the media library and object storage?`)) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/media/${selected.id}/`, { method: "DELETE" });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.deleted) throw new Error(result?.error || "Could not delete the image.");
      setRemovedIds((current) => [...current, selected.id]);
      setSelected(null);
      toast(result.warning || "Image deleted.", result.warning ? "error" : "success");
      router.refresh();
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not delete the image.", "error");
    } finally { setBusy(false); }
  }

  return <><div className="admin-library-grid">{items.filter((item) => !removedIds.includes(item.id)).map((item) => <button type="button" className="admin-library-card" key={item.id} onClick={() => inspect(item)} aria-label={`View details for ${item.fileName}`}>
    <span className="admin-library-card-image"><img src={item.url} alt={item.altText || item.fileName} loading="lazy" /></span>
    <span className="admin-library-card-info"><strong title={item.fileName}>{item.fileName}</strong><span>{item.mimeType.replace("image/", "").toUpperCase()} · {fileSize(item.sizeBytes)}</span></span>
    <span className="admin-library-card-foot"><span>{new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span><span>{usageCount(item) ? `Used in ${usageCount(item)} ${usageCount(item) === 1 ? "place" : "places"}` : "Unused"}</span></span>
  </button>)}</div>
    <dialog ref={dialog} className="admin-library-detail" aria-label="Image details" onCancel={() => setSelected(null)}>
      {selected && <><div className="admin-library-detail-top"><div><span>MEDIA DETAILS</span><h2>{selected.fileName}</h2></div><button type="button" onClick={() => setSelected(null)} aria-label="Close image details">×</button></div>
        <div className="admin-library-detail-layout"><div className="admin-library-detail-image"><img src={selected.url} alt={selected.altText || selected.fileName} /></div><div className="admin-library-detail-sidebar">
          <dl><div><dt>File type</dt><dd>{selected.mimeType}</dd></div><div><dt>File size</dt><dd>{fileSize(selected.sizeBytes)}</dd></div>{selected.width && selected.height && <div><dt>Dimensions</dt><dd>{selected.width} × {selected.height} px</dd></div>}<div><dt>Uploaded</dt><dd>{new Date(selected.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</dd></div><div><dt>Usage</dt><dd>{usageCount(selected) ? [selected._count.posts ? `${selected._count.posts} blog ${selected._count.posts === 1 ? "post" : "posts"}` : "", selected._count.portfolioProjects ? `${selected._count.portfolioProjects} portfolio ${selected._count.portfolioProjects === 1 ? "project" : "projects"}` : ""].filter(Boolean).join(", ") : "Unused"}</dd></div></dl>
          <label htmlFor="media-detail-alt">Alternative text</label><textarea id="media-detail-alt" value={altText} onChange={(event) => setAltText(event.target.value)} maxLength={255} rows={3} placeholder="Describe the image for readers using assistive technology" /><small>{altText.length}/255 characters</small>
          <button type="button" className="admin-library-save" disabled={busy || altText.trim() === (selected.altText || "")} onClick={save}>{busy ? "Saving…" : "Save description"}</button>
          <div className="admin-library-detail-links"><button type="button" onClick={copyUrl}>Copy URL</button><a href={selected.url} target="_blank" rel="noopener noreferrer">Open image ↗</a></div>
          <div className="admin-library-delete-section"><button type="button" className="admin-library-delete" disabled={busy || usageCount(selected) > 0 || !storageConfigured} onClick={remove}>{busy ? "Working…" : "Delete image"}</button>{usageCount(selected) > 0 ? <p>Remove this image from all blog posts and portfolio projects before deleting it.</p> : !storageConfigured ? <p>Configure object storage before deleting this image.</p> : <p>This permanently removes the image from the library and storage.</p>}</div>
        </div></div></>}
    </dialog>
  </>;
}
