import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { BlogRowActions } from "@/components/admin/blog-row-actions";
import { TablePagination } from "@/components/admin/table-pagination";

const DEFAULT_PAGE_SIZE = 50;
const PAGE_SIZES = [10, 25, 50, 100];
const formatDate = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

export default async function Page({ searchParams }: {
  searchParams: Promise<{ q?: string; status?: string; author?: string; sort?: string; page?: string; perPage?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 100) : "";
  const status: "DRAFT" | "PUBLISHED" | "" = params.status === "DRAFT" || params.status === "PUBLISHED" ? params.status : "";
  const author = typeof params.author === "string" ? params.author.slice(0, 64) : "";
  const sort = params.sort === "oldest" || params.sort === "title" ? params.sort : "newest";
  const requestedSize = Number(params.perPage);
  const pageSize = PAGE_SIZES.includes(requestedSize) ? requestedSize : DEFAULT_PAGE_SIZE;
  const requested = Number(params.page || 1);
  const requestedPage = Number.isSafeInteger(requested) && requested > 0 ? Math.min(requested, 10000) : 1;
  const where = {
    ...(status ? { status } : {}),
    ...(author ? { authorId: author } : {}),
    ...(q ? { OR: [{ title: { contains: q } }, { slug: { contains: q } }] } : {}),
  };
  const [total, published, drafts, filtered, authors] = await Promise.all([
    prisma.blogPost.count(),
    prisma.blogPost.count({ where: { status: "PUBLISHED" } }),
    prisma.blogPost.count({ where: { status: "DRAFT" } }),
    prisma.blogPost.count({ where }),
    prisma.user.findMany({ where: { posts: { some: {} } }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  const pages = Math.max(1, Math.ceil(filtered / pageSize));
  const page = Math.min(requestedPage, pages);
  const orderBy = sort === "oldest" ? [{ updatedAt: "asc" as const }, { id: "asc" as const }]
    : sort === "title" ? [{ title: "asc" as const }, { id: "asc" as const }]
    : [{ updatedAt: "desc" as const }, { id: "desc" as const }];
  const posts = await prisma.blogPost.findMany({
    where, orderBy, skip: (page - 1) * pageSize, take: pageSize,
    select: {
      id: true, title: true, slug: true, excerpt: true, status: true, publishedAt: true, updatedAt: true,
      author: { select: { name: true } }, coverMedia: { select: { url: true, altText: true } },
    },
  });
  const now = new Date();
  function href(overrides: { status?: string; page?: number } = {}) {
    const search = new URLSearchParams();
    if (q) search.set("q", q);
    if (author) search.set("author", author);
    if (sort !== "newest") search.set("sort", sort);
    if (pageSize !== DEFAULT_PAGE_SIZE) search.set("perPage", String(pageSize));
    const nextStatus = overrides.status ?? status;
    if (nextStatus) search.set("status", nextStatus);
    if (overrides.page && overrides.page > 1) search.set("page", String(overrides.page));
    return `/admin/blogs/${search.size ? `?${search}` : ""}`;
  }

  return <main className="admin-blog-page admin-posts-page">
    <div className="admin-page-heading"><div><p className="admin-eyebrow">CONTENT STUDIO / POSTS</p><h1>Blog <em>posts.</em></h1><p>Write, review, publish, and manage every article from one place.</p></div><Link className="admin-primary-link" href="/admin/blogs/new/">Add new post <span aria-hidden="true">↗</span></Link></div>
    <div className="admin-services-stats"><div><span>ALL POSTS</span><strong>{total}</strong><small>Across every publication state</small></div><div><span>PUBLISHED</span><strong>{published}</strong><small>Includes any scheduled articles</small></div><div><span>DRAFTS</span><strong>{drafts}</strong><small>Private until published</small></div></div>
    <section className="admin-posts-panel" aria-labelledby="posts-table-title">
      <div className="admin-posts-panel-heading"><div><span>POST MANAGER</span><h2 id="posts-table-title">All articles</h2></div><p>{filtered} {filtered === 1 ? "post" : "posts"} found</p></div>
      <nav className="admin-post-tabs" aria-label="Filter by publication status"><Link href={href({ status: "" })} className={!status ? "is-active" : ""} aria-current={!status ? "page" : undefined}>All <span>{total}</span></Link><Link href={href({ status: "PUBLISHED" })} className={status === "PUBLISHED" ? "is-active" : ""} aria-current={status === "PUBLISHED" ? "page" : undefined}>Published <span>{published}</span></Link><Link href={href({ status: "DRAFT" })} className={status === "DRAFT" ? "is-active" : ""} aria-current={status === "DRAFT" ? "page" : undefined}>Drafts <span>{drafts}</span></Link></nav>
      <form action="/admin/blogs/" method="get" className="admin-posts-filters">{status && <input type="hidden" name="status" value={status} />}<input type="hidden" name="perPage" value={pageSize} /><label>Search posts<input name="q" defaultValue={q} maxLength={100} placeholder="Search title or URL slug" /></label><label>Author<select name="author" defaultValue={author}><option value="">All authors</option>{authors.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>Sort by<select name="sort" defaultValue={sort}><option value="newest">Recently updated</option><option value="oldest">Oldest updated</option><option value="title">Title A–Z</option></select></label><button type="submit">Filter posts</button></form>
      <div className="admin-posts-table-wrap"><table className="admin-posts-table"><caption className="sr-only">Blog posts and management actions</caption><thead><tr><th scope="col">Title</th><th scope="col">Author</th><th scope="col">Status</th><th scope="col">Dates</th><th scope="col">Actions</th></tr></thead><tbody>
        {posts.map((post) => {
          const live = post.status === "PUBLISHED" && Boolean(post.publishedAt && post.publishedAt <= now);
          const scheduled = post.status === "PUBLISHED" && !live;
          return <tr key={post.id}><td><div className="admin-post-title-cell"><span className="admin-post-cover">{post.coverMedia ? <Image src={post.coverMedia.url} alt={post.coverMedia.altText || ""} width={68} height={52} unoptimized /> : <span aria-hidden="true">TW</span>}</span><span className="admin-post-title-copy"><Link href={`/admin/blogs/${post.id}/edit/`}>{post.title}</Link><small>/{post.slug}/</small>{post.excerpt && <span>{post.excerpt}</span>}</span></div></td><td className="admin-post-author">{post.author.name}</td><td><span className={`admin-post-status ${scheduled ? "is-scheduled" : live ? "is-live" : "is-draft"}`}><span aria-hidden="true" />{scheduled ? "Scheduled" : live ? "Published" : "Draft"}</span></td><td className="admin-post-dates"><span>Updated <time dateTime={post.updatedAt.toISOString()}>{formatDate.format(post.updatedAt)}</time></span>{post.publishedAt && <span>{scheduled ? "Goes live" : "Published"} <time dateTime={post.publishedAt.toISOString()}>{formatDate.format(post.publishedAt)}</time></span>}</td><td><BlogRowActions id={post.id} title={post.title} slug={post.slug} status={post.status} live={live} /></td></tr>;
        })}
        {!posts.length && <tr><td colSpan={5}><div className="admin-posts-empty"><span aria-hidden="true">▤</span><strong>{total ? "No posts match these filters" : "No blog posts yet"}</strong><p>{total ? "Try another search, author, or publication status." : "Create your first draft to start the journal."}</p>{total ? <Link href="/admin/blogs/">Clear filters</Link> : <Link href="/admin/blogs/new/">Add a post</Link>}</div></td></tr>}
      </tbody></table></div>
      <TablePagination path="/admin/blogs/" filters={{ ...(q ? { q } : {}), ...(status ? { status } : {}), ...(author ? { author } : {}), ...(sort !== "newest" ? { sort } : {}) }} page={page} perPage={pageSize} total={filtered} label="Posts" />
    </section>
  </main>;
}
