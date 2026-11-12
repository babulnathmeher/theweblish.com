"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useAdminToast } from "@/components/admin/admin-toast";

export function LoginForm() {
  const router = useRouter();
  const toast = useAdminToast();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      const result = await authClient.signIn.email({
        email: String(data.get("email") || "").trim().toLowerCase(),
        password: String(data.get("password") || ""),
      });
      if (result.error) {
        const message = result.error.status === 401
          ? "Invalid email or password."
          : result.error.status === 429
            ? "Too many sign-in attempts. Please try again later."
            : "Sign-in is unavailable right now. Please try again later.";
        setError(message);
        toast(message, "error");
        return;
      }
      toast("Signed in successfully.");
      router.replace("/workspace/");
      router.refresh();
    } catch {
      setError("Sign-in is unavailable right now. Please try again later.");
      toast("Sign-in is unavailable right now. Please try again later.", "error");
    } finally {
      setBusy(false);
    }
  }

  return <form onSubmit={submit} className="admin-login-form">
    <label><span>Email address <span className="required-marker" aria-hidden="true">*</span></span><input name="email" type="email" autoComplete="username" placeholder="you@theweblish.com" required /></label>
    <label><span>Password <span className="required-marker" aria-hidden="true">*</span></span><input name="password" type="password" autoComplete="current-password" placeholder="Enter your password" required /></label>
    {error && <p role="alert" className="admin-login-error">{error}</p>}
    <button disabled={busy} className="admin-login-submit" type="submit">{busy ? "Signing in…" : "Sign in"}</button>
  </form>;
}
