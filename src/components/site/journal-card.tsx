import Image from "next/image";
import Link from "next/link";

export type JournalPost = {
  slug: string;
  title: string;
  excerpt: string | null;
  publishedAt: Date | null;
  coverMedia: { url: string; altText: string | null } | null;
};

export function JournalCard({ post, featured = false }: { post: JournalPost; featured?: boolean }) {
  const date = post.publishedAt?.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return <article className={`journal-card${featured ? " journal-card-featured" : ""}`}>
    <Link href={`/${post.slug}/`} className="journal-card-link" aria-label={`Read ${post.title}`}>
      <div className={`journal-card-visual${post.coverMedia ? " journal-card-visual-image" : ""}`}>
        {post.coverMedia ? <Image src={post.coverMedia.url} alt={post.coverMedia.altText || `${post.title} cover`} fill unoptimized sizes={featured ? "(max-width: 760px) 100vw, 60vw" : "(max-width: 760px) 100vw, 33vw"} /> : <><span className="journal-art-grid" aria-hidden="true" /><span className="journal-art-orbit" aria-hidden="true" /><span className="journal-art-label">The Weblish / Journal</span></>}
        <span className="journal-card-arrow" aria-hidden="true">↗</span>
      </div>
      <div className="journal-card-content">
        <div className="journal-card-meta"><span>Journal</span>{date && <time dateTime={post.publishedAt!.toISOString()}>{date}</time>}</div>
        <h3>{post.title}</h3>
        {post.excerpt && <p>{post.excerpt}</p>}
        <span className="journal-card-read">Read article <span aria-hidden="true">↗</span></span>
      </div>
    </Link>
  </article>;
}
