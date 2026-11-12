"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useAdminToast } from "@/components/admin/admin-toast";

export function SignOutButton() {
  const router = useRouter();
  const toast = useAdminToast();
  const [busy, setBusy] = useState(false);
  return <button type="button" className="admin-signout" disabled={busy} onClick={async () => {
    setBusy(true);
    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error("Sign-out failed.");
      toast("Signed out successfully.");
      router.replace("/admin/login/");
      router.refresh();
    } catch { toast("Could not sign out. Please try again.", "error"); }
    finally { setBusy(false); }
  }} aria-label="Sign out of admin">↪</button>;
}
