"use client";

/* eslint-disable @next/next/no-img-element -- Previews use temporary browser object URLs. */
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminToast } from "@/components/admin/admin-toast";

const MAX_BYTES = 5 * 1024 * 1024;
const MAX_BATCH = 20;
const TYPES = ["image/png", "image/jpeg", "image/webp"];

type UploadStatus = "ready" | "uploading" | "uploaded" | "error" | "invalid";
type UploadItem = {
  id: string;
  file: File;
  preview: string;
  altText: string;
  status: UploadStatus;
  error?: string;
};

function fileError(file: File) {
  if (!TYPES.includes(file.type)) return "Use a PNG, JPEG, or WebP image.";
  if (!file.size || file.size > MAX_BYTES) return "Image must be between 1 byte and 5 MB.";
  if (file.name.length > 255) return "File name must be 255 characters or fewer.";
  return "";
}

export function MediaUpload() {
  const router = useRouter();
  const toast = useAdminToast();
  const input = useRef<HTMLInputElement>(null);
  const previewUrls = useRef<Set<string>>(new Set());
  const [items, setItems] = useState<UploadItem[]>([]);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  useEffect(() => {
    const urls = previewUrls.current;
    return () => { for (const url of urls) URL.revokeObjectURL(url); urls.clear(); };
  }, []);

  function addFiles(files: FileList | File[]) {
    if (busy) return;
    const selected = Array.from(files);
    const available = Math.max(0, MAX_BATCH - items.length);
    if (selected.length > available) toast(`You can queue up to ${MAX_BATCH} images at once.`, "error");
    const next = selected.slice(0, available).map((file): UploadItem => {
      const preview = TYPES.includes(file.type) ? URL.createObjectURL(file) : "";
      if (preview) previewUrls.current.add(preview);
      const error = fileError(file);
      return {
        id: crypto.randomUUID(), file, preview,
        altText: file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ").slice(0, 255),
        status: error ? "invalid" : "ready", error: error || undefined,
      };
    });
    setItems((current) => [...current, ...next]);
    if (input.current) input.current.value = "";
  }

  function removeItem(id: string) {
    const item = items.find((entry) => entry.id === id);
    if (item?.preview) { URL.revokeObjectURL(item.preview); previewUrls.current.delete(item.preview); }
    setItems((current) => current.filter((entry) => entry.id !== id));
  }

  function clearCompleted() {
    for (const item of items) {
      if (item.status === "uploaded" && item.preview) {
        URL.revokeObjectURL(item.preview);
        previewUrls.current.delete(item.preview);
      }
    }
    setItems((current) => current.filter((entry) => entry.status !== "uploaded"));
  }

  function updateItem(id: string, changes: Partial<UploadItem>) {
    setItems((current) => current.map((item) => item.id === id ? { ...item, ...changes } : item));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const batch = items.filter((item) => item.status === "ready" || item.status === "error");
    if (!batch.length) { toast("Choose valid images to upload.", "error"); return; }
    setBusy(true);
    setProgress({ done: 0, total: batch.length });
    let cursor = 0;
    let uploaded = 0;
    let failed = 0;
    let done = 0;

    async function worker() {
      while (cursor < batch.length) {
        const item = batch[cursor++];
        updateItem(item.id, { status: "uploading", error: undefined });
        const data = new FormData();
        data.set("file", item.file);
        data.set("altText", item.altText.trim());
        try {
          const response = await fetch("/api/uploads/", { method: "POST", body: data });
          const result = await response.json().catch(() => null);
          if (!response.ok || !result?.media?.id) throw new Error(result?.error || "Upload failed. Please try again.");
          uploaded++;
          updateItem(item.id, { status: "uploaded" });
        } catch (error) {
          failed++;
          updateItem(item.id, { status: "error", error: error instanceof Error ? error.message : "Upload failed. Please try again." });
        } finally {
          setProgress({ done: ++done, total: batch.length });
        }
      }
    }

    try {
      await Promise.all(Array.from({ length: Math.min(3, batch.length) }, () => worker()));
      if (uploaded) router.refresh();
      if (failed) toast(`${uploaded} image${uploaded === 1 ? "" : "s"} uploaded; ${failed} failed. You can retry the failed images.`, "error");
      else toast(`${uploaded} image${uploaded === 1 ? "" : "s"} uploaded to the media library.`);
    } finally {
      setBusy(false);
    }
  }

  const pending = items.filter((item) => item.status === "ready" || item.status === "error").length;
  const completed = items.filter((item) => item.status === "uploaded").length;

  return <form className="admin-library-upload" onSubmit={submit}>
    <div className="admin-library-upload-heading"><span>ADD TO LIBRARY</span><h2>Upload images.</h2><p>Choose up to 20 images, then add alternative text for each one.</p></div>
    <div className={`admin-library-dropzone${dragging ? " is-dragging" : ""}`} onDragOver={(event) => { event.preventDefault(); if (!busy) setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); addFiles(event.dataTransfer.files); }}>
      <span className="admin-library-upload-symbol" aria-hidden="true">+</span>
      <strong>Drag and drop images here</strong>
      <span>PNG, JPEG or WebP · Maximum 5 MB each</span>
      <label htmlFor="media-upload-file">Choose images</label><input id="media-upload-file" ref={input} type="file" multiple disabled={busy || items.length >= MAX_BATCH} accept="image/png,image/jpeg,image/webp" onChange={(event) => { if (event.target.files) addFiles(event.target.files); }} />
    </div>
    {items.length > 0 && <div className="admin-library-upload-queue">
      <div className="admin-library-upload-queue-heading"><strong>{items.length} selected</strong>{completed > 0 && <button type="button" onClick={clearCompleted} disabled={busy}>Clear completed</button>}</div>
      <ul>{items.map((item) => <li className="admin-library-upload-item" key={item.id}>
        {item.preview ? <img src={item.preview} alt="" /> : <span className="admin-library-upload-file-icon" aria-hidden="true">!</span>}
        <div className="admin-library-upload-item-content">
          <div className="admin-library-upload-item-head"><strong title={item.file.name}>{item.file.name}</strong><span>{(item.file.size / 1024).toFixed(0)} KB</span></div>
          <label>Alternative text <input value={item.altText} maxLength={255} disabled={busy || item.status === "uploaded" || item.status === "invalid"} onChange={(event) => updateItem(item.id, { altText: event.target.value })} placeholder="Describe what this image shows" /></label>
          <span className={`admin-library-upload-status is-${item.status}`} role={item.error ? "alert" : undefined}>{item.error || { ready: "Ready to upload", uploading: "Uploading…", uploaded: "Uploaded", error: "Upload failed", invalid: "Invalid image" }[item.status]}</span>
        </div>
        <button className="admin-library-upload-remove" type="button" onClick={() => removeItem(item.id)} disabled={busy} aria-label={`Remove ${item.file.name}`}>×</button>
      </li>)}</ul>
    </div>}
    {busy && <div className="admin-library-upload-progress" role="status" aria-live="polite"><span>Uploading {progress.done} of {progress.total}</span><progress value={progress.done} max={progress.total} /></div>}
    <button className="admin-library-upload-button" type="submit" disabled={busy || pending === 0}>{busy ? "Uploading images…" : `Upload ${pending} image${pending === 1 ? "" : "s"}`} <span aria-hidden="true">↗</span></button>
  </form>;
}
