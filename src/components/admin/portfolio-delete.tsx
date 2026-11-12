"use client";

export function PortfolioDelete({ id, action }: { id: string; action: (formData: FormData) => Promise<void> }) {
  return <form action={action} className="admin-blog-delete" onSubmit={(event) => {
    if (!window.confirm("Permanently delete this case study? This cannot be undone.")) event.preventDefault();
  }}><div><strong>Delete case study</strong><p>This removes the project record. The original media file remains in the library.</p></div><input type="hidden" name="id" value={id} /><input type="hidden" name="confirm" value="DELETE" /><button type="submit">Delete case study</button></form>;
}
