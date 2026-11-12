"use client";

import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";
import { useAdminToast } from "@/components/admin/admin-toast";

export function ChangePasswordForm() {
  const toast = useAdminToast();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const currentPassword = String(data.get("currentPassword") || "");
    const newPassword = String(data.get("newPassword") || "");
    const confirmation = String(data.get("confirmation") || "");
    if (newPassword.length < 12 || newPassword.length > 128 || newPassword !== confirmation || newPassword === currentPassword) {
      setError("Use a different password of 12–128 characters and confirm it exactly.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result = await authClient.changePassword({ currentPassword, newPassword, revokeOtherSessions: true });
      if (result.error) {
        const message = result.error.status === 429 ? "Too many attempts. Try again later." : "Password could not be changed. Check your current password and try again.";
        setError(message);
        toast(message, "error");
        return;
      }
      form.reset();
      toast("Password updated. Other sessions have been signed out.");
    } catch {
      setError("Password could not be changed. Please try again later.");
      toast("Password could not be changed.", "error");
    } finally { setBusy(false); }
  }

  return <form className="admin-settings-password" onSubmit={submit}><label>Current password<input type="password" name="currentPassword" autoComplete="current-password" required maxLength={128} /></label><label>New password<input type="password" name="newPassword" autoComplete="new-password" required minLength={12} maxLength={128} /></label><label>Confirm new password<input type="password" name="confirmation" autoComplete="new-password" required minLength={12} maxLength={128} /></label><p>Use a unique password. Other signed-in sessions will be revoked.</p>{error && <p className="admin-settings-password-error" role="alert">{error}</p>}<button type="submit" disabled={busy}>{busy ? "Updating password…" : "Update password"}</button></form>;
}
