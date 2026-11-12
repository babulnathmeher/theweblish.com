"use client";

/* eslint-disable @next/next/no-img-element -- Media URLs come from validated storage records. */
import { useEffect, useRef, useState } from "react";
import { useAdminToast } from "@/components/admin/admin-toast";

type Cover = { id: string; fileName: string; url: string; altText: string | null };
type LibraryResponse = { items: Cover[]; total: number; page: number; pages: number };

export function BlogCoverPicker({ initialMedia, initialId, storageConfigured, invalid, kind = "post", uploadAllowed = true }: {
  initialMedia: Cover[]; initialId: string; storageConfigured: boolean; invalid: boolean; kind?: "post" | "project"; uploadAllowed?: boolean;
}) {
  const toast = useAdminToast();
  const [media, setMedia] = useState(initialMedia);
  const [selectedId, setSelectedId] = useState(initialId);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"library" | "upload">("library");
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [library, setLibrary] = useState<LibraryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [altText, setAltText] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const selected = media.find((item) => item.id === selectedId);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  useEffect(() => {
    if (!open || tab !== "library") return;
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(page), q: query });
        const response = await fetch(`/api/admin/media/?${params}`, { signal: controller.signal, cache: "no-store" });
        const result = await response.json().catch(() => null);
        if (!response.ok) throw new Error(result?.error || "Could not load the media library.");
        setLibrary(result);
      } catch (error) {
        if (!controller.signal.aborted) toast(error instanceof Error ? error.message : "Could not load the media library.", "error");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [open, tab, page, query, toast]);

  function choose(item: Cover) {
    setMedia((current) => current.some((existing) => existing.id === item.id) ? current : [item, ...current]);
    setSelectedId(item.id);
    setOpen(false);
    toast(`Featured image selected. Save the ${kind} to attach it.`);
  }

  async function upload() {
    const file = fileInput.current?.files?.[0];
    if (!file) { toast("Choose an image first.", "error"); return; }
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      toast("Choose a PNG, JPEG, or WebP image under 5 MB.", "error"); return;
    }
    const data = new FormData();
    data.set("file", file);
    data.set("altText", altText.trim());
    setBusy(true);
    try {
      const response = await fetch("/api/uploads/", { method: "POST", body: data });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.media?.id) throw new Error(result?.error || "Upload failed. Please try again.");
      setMedia((current) => [result.media, ...current]);
      setSelectedId(result.media.id);
      setLibrary(null);
      setOpen(false);
      setAltText("");
      if (fileInput.current) fileInput.current.value = "";
      toast(`Image uploaded and selected. Save the ${kind} to attach it.`);
    } catch (error) {
      toast(error instanceof Error ? error.message : "Upload failed. Please try again.", "error");
    } finally { setBusy(false); }
  }

  return <section className="admin-blog-cover-panel" aria-labelledby="blog-cover-title">
    <div className="admin-blog-panel-title"><span>FEATURED IMAGE</span><h2 id="blog-cover-title">{kind === "project" ? "Project cover" : "Post cover"}</h2></div>
    <div className="admin-blog-cover-frame">{selected ? <img src={selected.url} alt={selected.altText || `Selected cover: ${selected.fileName}`} /> : <div className="admin-blog-cover-placeholder"><span aria-hidden="true">▧</span><strong>No cover selected</strong><small>Choose an image to lead your story.</small></div>}</div>
    <input type="hidden" name="coverMediaId" value={selectedId} />
    <div className="admin-blog-cover-actions"><button type="button" className="admin-blog-cover-choose" onClick={() => { setTab("library"); setOpen(true); }}>Choose from library</button><button type="button" disabled={!storageConfigured || !uploadAllowed} onClick={() => { setTab("upload"); setOpen(true); }}>Upload new</button></div>
    {selected && <div className="admin-blog-cover-selected"><span title={selected.fileName}>{selected.fileName}</span><button type="button" onClick={() => setSelectedId("")}>Remove</button></div>}
    {!storageConfigured && <p className="admin-blog-cover-unavailable">Uploads need configured object storage. Existing media can still be selected.</p>}
    {storageConfigured && !uploadAllowed && <p className="admin-blog-cover-unavailable">Authors can choose existing images. An editor can upload new ones.</p>}
    {invalid && <p className="sr-only" role="alert">Choose an uploaded image.</p>}
    <dialog ref={dialog} className="admin-media-dialog" aria-label="Choose featured image" onCancel={() => setOpen(false)}>
      <div className="admin-media-dialog-header"><div><span>FEATURED IMAGE</span><h2>Choose an image</h2></div><button type="button" onClick={() => setOpen(false)} aria-label="Close image picker">×</button></div>
      <div className="admin-media-dialog-tabs" aria-label="Image source"><button type="button" aria-pressed={tab === "library"} onClick={() => setTab("library")}>Media library</button><button type="button" aria-pressed={tab === "upload"} disabled={!storageConfigured || !uploadAllowed} onClick={() => setTab("upload")}>Upload image</button></div>
      {tab === "library" ? <div className="admin-media-library"><div className="admin-media-library-search"><input aria-label="Search images by filename" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); setPage(1); setQuery(searchInput.trim()); } }} placeholder="Search images" /><button type="button" onClick={() => { setPage(1); setQuery(searchInput.trim()); }}>Search</button></div>{loading ? <p role="status">Loading images…</p> : library?.items.length ? <div className="admin-media-picker-grid">{library.items.map((item) => <button type="button" key={item.id} className={item.id === selectedId ? "is-selected" : ""} onClick={() => choose(item)} aria-label={`Select ${item.fileName}`}><img src={item.url} alt={item.altText || item.fileName} loading="lazy" /><span>{item.fileName}</span></button>)}</div> : <p className="admin-media-empty">No images found.</p>}<div className="admin-media-pagination"><span>{library?.total || 0} images · Page {page} of {Math.max(1, library?.pages || 1)}</span><div><button type="button" disabled={loading || page <= 1} onClick={() => setPage((current) => current - 1)}>Previous</button><button type="button" disabled={loading || page >= (library?.pages || 1)} onClick={() => setPage((current) => current + 1)}>Next</button></div></div></div> : <div className="admin-media-upload-pane"><label>Image file<input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp" /></label><label>Alternative text<input value={altText} onChange={(event) => setAltText(event.target.value)} maxLength={255} placeholder="Describe the image for readers" /></label><p>PNG, JPEG, or WebP. Maximum 5 MB. The upload is stored in your media library.</p><button type="button" disabled={busy} onClick={upload}>{busy ? "Uploading…" : "Upload and select"}</button></div>}
    </dialog>
  </section>;
}


