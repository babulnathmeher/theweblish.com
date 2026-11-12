"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAdminToast } from "@/components/admin/admin-toast";
import { authClient } from "@/lib/auth-client";

export function ProfileNameForm({ initialName }: { initialName: string }) {
  const router = useRouter();
  const toast = useAdminToast();
  const [name, setName] = useState(initialName);
  const [savedName, setSavedName] = useState(initialName);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextName = name.trim().replace(/\s+/g, " ");
    if (nextName.length < 2 || nextName.length > 100) {
      setError("Enter a name between 2 and 100 characters.");
      return;
    }
    if (nextName === savedName) return;
    setBusy(true);
    setError("");
    try {
      const result = await authClient.updateUser({ name: nextName });
      if (result.error) {
        const message = result.error.status === 429 ? "Too many attempts. Try again later." : "Could not update your profile. Please try again.";
        setError(message);
        toast(message, "error");
        return;
      }
      setName(nextName);
      setSavedName(nextName);
      toast("Profile name updated.");
      router.refresh();
    } catch {
      setError("Could not update your profile. Please try again.");
      toast("Could not update your profile.", "error");
    } finally {
      setBusy(false);
    }
  }

  return <form className="admin-profile-name-form" onSubmit={submit}>
    <label htmlFor="profile-display-name">Display name <span className="required-marker" aria-hidden="true">*</span></label>
    <div className="admin-profile-name-field"><input id="profile-display-name" name="name" type="text" autoComplete="name" minLength={2} maxLength={100} required value={name} onChange={(event) => { setName(event.target.value); if (error) setError(""); }} aria-invalid={Boolean(error)} aria-describedby={error ? "profile-name-error" : "profile-name-help"} /><button type="submit" disabled={busy || name.trim() === savedName}>{busy ? "Saving…" : "Save name"}</button></div>
    {error ? <p id="profile-name-error" className="admin-profile-form-error" role="alert">{error}</p> : <p id="profile-name-help">This name appears in your workspace and on authored content.</p>}
  </form>;
}
