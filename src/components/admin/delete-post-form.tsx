"use client";

import { deleteBlogPost } from "@/features/blogs/actions";

export function DeletePostForm({ id }: { id: string }) {
  return <form action={deleteBlogPost} className="admin-blog-delete" onSubmit={(event) => {
    if (!window.confirm("Delete this post permanently? This cannot be undone.")) event.preventDefault();
  }}><div><strong>Danger zone</strong><p>Deleting this post removes it from the database and public website permanently.</p></div><input type="hidden" name="id" value={id} /><input type="hidden" name="confirm" value="DELETE" /><button>Delete post</button></form>;
}
