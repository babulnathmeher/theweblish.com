import Link from "next/link";
import { MediaUpload } from "@/components/admin/media-upload";
import { MediaLibrary } from "@/components/admin/media-library";
import { storageConfig } from "@/features/media/storage";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

const PAGE_SIZE = 24;
const mediaTypes = { png: "image/png", jpeg: "image/jpeg", webp: "image/webp" } as const;

export default async function MediaPage({ searchParams }: {
  searchParams: Promise<{ q?: string; type?: string; page?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 100) : "";
  const type = params.type === "png" || params.type === "jpeg" || params.type === "webp" ? params.type : "";
  const requested = Number(params.page || 1);
  const requestedPage = Number.isSafeInteger(requested) && requested > 0 ? Math.min(requested, 10000) : 1;
  const where = {
    ...(q ? { OR: [{ fileName: { contains: q } }, { altText: { contains: q } }] } : {}),
    ...(type ? { mimeType: mediaTypes[type] } : {}),
  };
  const [total, allMedia, used, storage] = await Promise.all([
    prisma.media.count({ where }),
    prisma.media.count(),
    prisma.media.count({ where: { OR: [{ posts: { some: {} } }, { portfolioProjects: { some: {} } }] } }),
    prisma.media.aggregate({ _sum: { sizeBytes: true } }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(requestedPage, pages);
  const items = await prisma.media.findMany({
    where, orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE,
    select: { id: true, fileName: true, url: true, altText: true, mimeType: true, sizeBytes: true, width: true, height: true, createdAt: true, _count: { select: { posts: true, portfolioProjects: true } } },
  });
  function pageHref(next: number) {
    const search = new URLSearchParams();
    if (q) search.set("q", q);
    if (type) search.set("type", type);
    if (next > 1) search.set("page", String(next));
    return `/admin/media/${search.size ? `?${search}` : ""}`;
  }
  const configured = Boolean(storageConfig());
  return <main className="admin-library-page">
    <div className="admin-page-heading"><div><p className="admin-eyebrow">CONTENT STUDIO / ASSETS</p><h1>Media <em>library.</em></h1><p>Upload, find, and manage images used across your blog and portfolio.</p></div><span className="admin-count-pill">{allMedia} assets</span></div>
    <div className="admin-library-stats"><div><span>ALL IMAGES</span><strong>{allMedia}</strong><small>Stored in your media library</small></div><div><span>IN USE</span><strong>{used}</strong><small>Linked to a blog post or portfolio project</small></div><div><span>STORAGE USED</span><strong>{((storage._sum.sizeBytes || 0) / (1024 * 1024)).toFixed(1)} <small>MB</small></strong><small>Image files recorded in the database</small></div></div>
    <div className="admin-library-workspace"><section className="admin-library-browser" aria-labelledby="media-browser-title">
      <div className="admin-library-section-head"><div><span>YOUR COLLECTION</span><h2 id="media-browser-title">Browse images</h2></div><p>{total} {total === 1 ? "image" : "images"} found</p></div>
      <form action="/admin/media/" method="get" className="admin-library-filters"><label htmlFor="media-search">Search<input id="media-search" name="q" defaultValue={q} maxLength={100} placeholder="Search file names or alt text" /></label><label htmlFor="media-type">File type<select id="media-type" name="type" defaultValue={type}><option value="">All formats</option><option value="png">PNG</option><option value="jpeg">JPEG</option><option value="webp">WebP</option></select></label><button type="submit">Apply filters</button></form>
      {items.length ? <MediaLibrary items={items.map((item) => ({ ...item, createdAt: item.createdAt.toISOString() }))} storageConfigured={configured} /> : <div className="admin-library-empty"><span aria-hidden="true">▧</span><h3>{allMedia ? "No matching images" : "Your library is empty"}</h3><p>{allMedia ? "Try another search or file type." : configured ? "Upload your first image using the panel beside the library." : "Configure object storage to start uploading images."}</p>{allMedia > 0 && <Link href="/admin/media/">Clear filters</Link>}</div>}
      {total > PAGE_SIZE && <nav className="admin-library-pages" aria-label="Media pages"><span>Page {page} of {pages}</span><div>{page > 1 && <Link href={pageHref(page - 1)}>Previous</Link>}{page < pages && <Link href={pageHref(page + 1)}>Next</Link>}</div></nav>}
    </section><aside className="admin-library-aside">{configured ? <MediaUpload /> : <div className="admin-library-unconfigured"><span>UPLOAD STATUS</span><h2>Storage setup needed.</h2><p>Uploads become available when the object-storage variables are configured. Existing images remain available in the library.</p><code>S3_ENDPOINT · S3_REGION · S3_BUCKET · S3_ACCESS_KEY_ID · S3_SECRET_ACCESS_KEY · MEDIA_PUBLIC_BASE_URL</code></div>}<div className="admin-library-note"><strong>Image guidance</strong><p>Use PNG, JPEG or WebP files up to 5 MB. Add descriptive alternative text so readers using assistive technology understand the image.</p></div></aside></div>
  </main>;
}

