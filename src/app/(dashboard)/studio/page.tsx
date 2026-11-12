import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireContentStaff } from "@/lib/require-content-staff";

export default async function StudioPage() {
  const session = await requireContentStaff();
  const author = session.user.role === "author";
  const where = author ? { authorId: session.user.id, status: "DRAFT" as const } : {};
  const [total, drafts, published, recent] = await Promise.all([
    prisma.blogPost.count({ where }),
    prisma.blogPost.count({ where: { ...where, status: "DRAFT" } }),
    author ? Promise.resolve(0) : prisma.blogPost.count({ where: { status: "PUBLISHED" } }),
    prisma.blogPost.findMany({ where, orderBy: { updatedAt: "desc" }, take: 5, select: { id: true, title: true, status: true, updatedAt: true } }),
  ]);
  return <main className="admin-dashboard studio-dashboard"><div className="admin-page-heading"><div><p className="admin-eyebrow">CONTENT STUDIO / {author ? "AUTHOR" : "EDITOR"}</p><h1>Make the next <em>story.</em></h1><p>{author ? "Write and refine your own drafts. An editor will handle publication." : "Review, edit, and publish stories across the journal."}</p></div><Link href="/studio/blogs/new/" className="admin-primary-link">Write a post <span aria-hidden="true">↗</span></Link></div><div className="admin-services-stats"><div><span>{author ? "MY DRAFTS" : "ALL POSTS"}</span><strong>{total}</strong><small>{author ? "Private articles by you" : "Across all authors"}</small></div><div><span>DRAFTS</span><strong>{drafts}</strong><small>Awaiting review</small></div><div><span>PUBLISHED</span><strong>{author ? "—" : published}</strong><small>{author ? "Publication is managed by editors" : "Visible on the website"}</small></div></div><section className="admin-posts-panel" aria-labelledby="studio-recent-title"><div className="admin-posts-panel-heading"><div><span>RECENT WORK</span><h2 id="studio-recent-title">{author ? "Your drafts" : "Latest articles"}</h2></div><Link href="/studio/blogs/">All posts ↗</Link></div><div className="admin-activity-list">{recent.map((post) => <Link key={post.id} className="admin-activity-row" href={`/studio/blogs/${post.id}/edit/`}><span className="admin-activity-avatar">{post.title.charAt(0).toUpperCase()}</span><span className="admin-activity-copy"><strong>{post.title}</strong><small>{post.status.toLowerCase()}</small></span><span className="admin-activity-meta"><small>{post.updatedAt.toLocaleDateString("en-IN")}</small></span></Link>)}{!recent.length && <p className="admin-empty">No posts yet. Start with a new draft.</p>}</div></section></main>;
}
