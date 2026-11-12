import Link from "next/link";
import type { Prisma } from "@/generated/prisma/client";
import { BlogRowActions } from "@/components/admin/blog-row-actions";
import { TablePagination } from "@/components/admin/table-pagination";
import { prisma } from "@/lib/prisma";
import { requireContentStaff } from "@/lib/require-content-staff";

const sizes = [10, 25, 50, 100];
const date = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

export default async function StudioBlogsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; page?: string; perPage?: string }> }) {
  const session = await requireContentStaff();
  const author = session.user.role === "author";
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 100) : "";
  const status: "DRAFT" | "PUBLISHED" | "" = !author && (params.status === "DRAFT" || params.status === "PUBLISHED") ? params.status : "";
  const perPage = sizes.includes(Number(params.perPage)) ? Number(params.perPage) : 25;
  const requested = Number(params.page || 1);
  const requestedPage = Number.isSafeInteger(requested) && requested > 0 ? Math.min(requested, 10000) : 1;
  const scope: Prisma.BlogPostWhereInput = author ? { authorId: session.user.id, status: "DRAFT" } : {};
  const where: Prisma.BlogPostWhereInput = { ...scope, ...(status ? { status } : {}), ...(q ? { OR: [{ title: { contains: q } }, { slug: { contains: q } }] } : {}) };
  const [total, filtered, drafts, published] = await Promise.all([
    prisma.blogPost.count({ where: scope }), prisma.blogPost.count({ where }),
    prisma.blogPost.count({ where: { ...scope, status: "DRAFT" } }),
    author ? Promise.resolve(0) : prisma.blogPost.count({ where: { status: "PUBLISHED" } }),
  ]);
  const page = Math.min(requestedPage, Math.max(1, Math.ceil(filtered / perPage)));
  const posts = await prisma.blogPost.findMany({ where, orderBy: [{ updatedAt: "desc" }, { id: "desc" }], skip: (page - 1) * perPage, take: perPage, select: { id: true, title: true, slug: true, status: true, updatedAt: true, publishedAt: true, author: { select: { name: true } } } });
  function href(nextStatus: string) {
    const search = new URLSearchParams();
    if (q) search.set("q", q);
    if (nextStatus) search.set("status", nextStatus);
    if (perPage !== 25) search.set("perPage", String(perPage));
    return `/studio/blogs/${search.size ? `?${search}` : ""}`;
  }
  return <main className="admin-blog-page admin-posts-page"><div className="admin-page-heading"><div><p className="admin-eyebrow">CONTENT STUDIO / POSTS</p><h1>{author ? "My" : "All"} <em>stories.</em></h1><p>{author ? "Write and manage your private drafts." : "Review and manage articles across the team."}</p></div><Link className="admin-primary-link" href="/studio/blogs/new/">Add new post <span aria-hidden="true">↗</span></Link></div>
    <div className="admin-services-stats"><div><span>{author ? "MY DRAFTS" : "ALL POSTS"}</span><strong>{total}</strong></div><div><span>DRAFTS</span><strong>{drafts}</strong></div><div><span>PUBLISHED</span><strong>{author ? "—" : published}</strong></div></div>
    <section className="admin-posts-panel" aria-labelledby="studio-posts-title"><div className="admin-posts-panel-heading"><div><span>POST MANAGER</span><h2 id="studio-posts-title">{author ? "Your drafts" : "All articles"}</h2></div><p>{filtered} {filtered === 1 ? "post" : "posts"} found</p></div>
      {!author && <nav className="admin-post-tabs" aria-label="Filter posts by status"><Link href={href("")} className={!status ? "is-active" : ""}>All <span>{total}</span></Link><Link href={href("DRAFT")} className={status === "DRAFT" ? "is-active" : ""}>Drafts <span>{drafts}</span></Link><Link href={href("PUBLISHED")} className={status === "PUBLISHED" ? "is-active" : ""}>Published <span>{published}</span></Link></nav>}
      <form className="admin-ticket-filters" action="/studio/blogs/" method="get">{status && <input type="hidden" name="status" value={status} />}<input type="hidden" name="perPage" value={perPage} /><label>Search articles<input name="q" defaultValue={q} maxLength={100} placeholder="Search title or slug" /></label><button type="submit">Search posts</button>{q && <Link href={href(status)}>Clear search</Link>}</form>
      <div className="admin-posts-table-wrap"><table className="admin-ticket-table"><caption className="sr-only">Content studio posts</caption><thead><tr><th scope="col">Title</th><th scope="col">Author</th><th scope="col">Status</th><th scope="col">Updated</th><th scope="col">Actions</th></tr></thead><tbody>{posts.map((post) => <tr key={post.id}><td><Link className="admin-ticket-reference" href={`/studio/blogs/${post.id}/edit/`}>{post.title}</Link><small>/{post.slug}/</small></td><td>{post.author.name}</td><td><span className={`admin-post-status ${post.status === "PUBLISHED" ? "is-live" : "is-draft"}`}>{post.status === "PUBLISHED" ? "Published" : "Draft"}</span></td><td><time dateTime={post.updatedAt.toISOString()}>{date.format(post.updatedAt)}</time></td><td><BlogRowActions id={post.id} title={post.title} slug={post.slug} status={post.status} live={post.status === "PUBLISHED" && Boolean(post.publishedAt && post.publishedAt <= new Date())} basePath="/studio/blogs" canPublish={!author} /></td></tr>)}{!posts.length && <tr><td colSpan={5}><div className="admin-posts-empty"><strong>No posts found</strong><p>{total ? "Try another search or status." : "Create a draft to get started."}</p>{total > 0 && <Link href="/studio/blogs/">Clear filters</Link>}</div></td></tr>}</tbody></table></div>
      <TablePagination path="/studio/blogs/" filters={{ ...(q ? { q } : {}), ...(status ? { status } : {}) }} page={page} perPage={perPage} total={filtered} label="Posts" />
    </section>
  </main>;
}
