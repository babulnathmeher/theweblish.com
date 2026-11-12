"use client";

import { useActionState, useEffect, useRef } from "react";
import { useAdminToast } from "@/components/admin/admin-toast";
import { createTeamMember, type CreateTeamMemberState } from "@/features/team/actions";

const initialState: CreateTeamMemberState = { success: false, message: "" };

export function TeamCreateForm() {
  const [state, action, pending] = useActionState(createTeamMember, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const toast = useAdminToast();

  useEffect(() => {
    if (!state.message) return;
    toast(state.message, state.success ? "success" : "error");
    if (state.success) formRef.current?.reset();
  }, [state, toast]);

  return <form ref={formRef} action={action} className="admin-team-form">
    <div className="admin-team-form-grid"><label>Full name <span aria-hidden="true">*</span><input name="name" autoComplete="off" required minLength={2} maxLength={100} /></label><label>Email <span aria-hidden="true">*</span><input name="email" type="email" autoComplete="off" required maxLength={191} /></label><label>Workspace role <span aria-hidden="true">*</span><select name="role" defaultValue="author"><option value="author">Author — own drafts</option><option value="editor">Editor — all blog posts</option></select></label><label>Initial password <span aria-hidden="true">*</span><input name="password" type="password" autoComplete="new-password" required minLength={12} maxLength={128} /></label></div>
    <p>Use a unique password and share it privately with the new team member. Passwords are hashed by the authentication provider and are never shown here again.</p>
    {state.message && <p role={state.success ? "status" : "alert"} className={state.success ? "admin-team-success" : "admin-team-error"}>{state.message}</p>}
    <button type="submit" disabled={pending}>{pending ? "Creating account…" : "Create team account"}</button>
  </form>;
}
