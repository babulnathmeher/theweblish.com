import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { publishedFilter } from "@/features/blogs/visibility";
import { JournalCard, type JournalPost } from "@/components/site/journal-card";
import { logPublicContentFailure } from "@/lib/public-content-log";

export async function HomeJournal() {
  let posts: JournalPost[] | null = null;
  try {
    posts = await prisma.blogPost.findMany({
      where: publishedFilter(),
      orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
      take: 3,
      select: { slug: true, title: true, excerpt: true, publishedAt: true, coverMedia: { select: { url: true, altText: true } } },
    });
  } catch (error) {
    logPublicContentFailure("Public journal preview could not be loaded", error);
  }

  return <section className="site-section journal-section" aria-labelledby="home-journal-title"><div className="site-container">
    <div className="journal-section-head">
      <div className="section-heading"><p className="eyebrow">From the journal</p><h2 id="home-journal-title">Ideas to move<br /><em>things forward.</em></h2><p className="section-description">Thoughts on websites, design, and the decisions behind better digital work.</p></div>
      <Link href="/blog/" className="journal-all-link">Explore all articles <span aria-hidden="true">↗</span></Link>
    </div>
    {posts === null ? <div className="journal-empty"><span className="journal-empty-mark" aria-hidden="true">↗</span><p>The journal is temporarily unavailable. Please check back soon.</p></div>
      : posts.length === 0 ? <div className="journal-empty"><span className="journal-empty-mark" aria-hidden="true">↗</span><div><h3>Stories are on their way.</h3><p>No articles are published yet. The journal will open with reviewed writing.</p></div></div>
        : <ol className={`journal-grid journal-grid-count-${posts.length}`}>{posts.map((post, index) => <li key={post.slug}><JournalCard post={post} featured={index === 0 && posts.length > 1} /></li>)}</ol>}
  </div></section>;
}
