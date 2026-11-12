import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { publishedFilter } from "@/features/blogs/visibility";
import { JournalCard, type JournalPost } from "@/components/site/journal-card";
import { logPublicContentFailure } from "@/lib/public-content-log";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 10;

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ page?: string }> }): Promise<Metadata> {
  const { page: rawPage } = await searchParams;
  const page = rawPage === undefined ? 1 : Number(rawPage);
  const title = page > 1 ? `Journal · Page ${page}` : "Journal";
  try {
    const count = await prisma.blogPost.count({ where: publishedFilter() });
    const validPage = Number.isInteger(page) && page >= 1 && page <= Math.max(1, Math.ceil(count / PAGE_SIZE));
    return { title, description: "Published writing from The Weblish on websites, design, and digital work.", robots: { index: count > 0 && validPage, follow: count > 0 && validPage }, alternates: { canonical: page > 1 && validPage ? `/blog/?page=${page}` : "/blog/" } };
  } catch {
    return { title, description: "Published writing from The Weblish.", robots: { index: false, follow: false }, alternates: { canonical: "/blog/" } };
  }
}

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: rawPage } = await searchParams;
  const page = rawPage === undefined ? 1 : Number(rawPage);
  if (!Number.isInteger(page) || page < 1 || page > 10000) notFound();
  let total: number | null = null;
  let posts: JournalPost[] = [];
  try {
    const where = publishedFilter();
    [total, posts] = await Promise.all([
      prisma.blogPost.count({ where }),
      prisma.blogPost.findMany({ where, orderBy: [{ publishedAt: "desc" }, { id: "desc" }], skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE, select: { slug: true, title: true, excerpt: true, publishedAt: true, coverMedia: { select: { url: true, altText: true } } } }),
    ]);
  } catch (error) {
    logPublicContentFailure("Public journal listing could not be loaded", error);
  }
  const pages = Math.ceil((total ?? 0) / PAGE_SIZE);
  if (total !== null && page > 1 && page > pages) notFound();

  return <main className="journal-page">
    <section className="journal-hero" aria-labelledby="journal-title"><div className="site-container journal-hero-inner">
      <div><p className="journal-hero-eyebrow"><span aria-hidden="true">/</span> Ideas & articles</p><h1 id="journal-title">The <em>journal.</em></h1><p>Published writing on websites, design, and the decisions behind better digital work.</p></div>
      <div className="journal-hero-decoration" aria-hidden="true"><span className="journal-hero-orbit" /><span className="journal-hero-index">The Weblish / Journal</span></div>
    </div></section>
    <section className="site-section journal-listing-section" aria-labelledby="journal-list-title"><div className="site-container">
      <div className="journal-listing-head"><div><p className="eyebrow">The Weblish / Journal</p><h2 id="journal-list-title">Latest articles</h2></div>{total !== null && total > 0 && <span>{total} published {total === 1 ? "article" : "articles"}</span>}</div>
      {total === null ? <div className="journal-empty"><span className="journal-empty-mark" aria-hidden="true">↗</span><div><h3>The journal is temporarily unavailable.</h3><p>Please check back soon.</p></div></div>
        : posts.length === 0 ? <div className="journal-empty"><span className="journal-empty-mark" aria-hidden="true">↗</span><div><h3>Stories are on their way.</h3><p>No articles are published yet. Original writing will appear here after review.</p></div></div>
          : <ol className={`journal-grid journal-grid-listing${posts.length < 3 ? ` journal-grid-count-${posts.length}` : ""}`}>{posts.map((post, index) => <li key={post.slug}><JournalCard post={post} featured={index === 0 && posts.length > 2} /></li>)}</ol>}
      {pages > 1 && <nav aria-label="Blog pages" className="journal-pagination">{page > 1 ? <Link href={page === 2 ? "/blog/" : `/blog/?page=${page - 1}`}>← Previous</Link> : <span aria-hidden="true" />}<span>Page {page} of {pages}</span>{page < pages ? <Link href={`/blog/?page=${page + 1}`}>Next →</Link> : <span aria-hidden="true" />}</nav>}
    </div></section>
  </main>;
}
