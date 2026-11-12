export function hasAdminAccess(session: { user: { role?: string | null } } | null): boolean {
  return session?.user.role === "admin";
}

export type ContentRole = "admin" | "editor" | "author";

export function contentRole(session: { user: { role?: string | null } } | null): ContentRole | null {
  const role = session?.user.role;
  return role === "admin" || role === "editor" || role === "author" ? role : null;
}

export function canManageBlogPost(role: ContentRole, userId: string, post: { authorId: string; status: "DRAFT" | "PUBLISHED" }, action: "read" | "save" | "publish" | "unpublish" | "delete") {
  if (role === "admin" || role === "editor") return true;
  return post.authorId === userId && post.status === "DRAFT" && action !== "publish" && action !== "unpublish";
}
