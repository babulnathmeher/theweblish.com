/* eslint-disable @next/next/no-img-element -- Cover URLs come from configured object storage. */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { getPublishedPost } from "@/features/blogs/public";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) return { title: "Article unavailable", robots: { index: false, follow: false } };
  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || undefined,
    alternates: { canonical: `/${post.slug}/` },
    openGraph: { title: post.seoTitle || post.title, description: post.seoDescription || post.excerpt || undefined, images: post.coverMedia ? [post.coverMedia.url] : undefined },
  };
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) notFound();
  return <main><article className="article-shell"><Link href="/blog/" className="arrow-link">← Back to blog</Link><p className="eyebrow mt-12">The Weblish journal</p><h1 className="mt-4">{post.title}</h1>
    <p className="article-meta"><time dateTime={post.publishedAt?.toISOString()}>{post.publishedAt?.toLocaleDateString("en-IN")}</time> · {post.author.name}</p>
    {post.coverMedia && <img className="article-cover" src={post.coverMedia.url} alt={post.coverMedia.altText || post.title} />}
    {post.excerpt && <p className="article-excerpt">{post.excerpt}</p>}
    <div className="markdown-body"><Markdown skipHtml remarkPlugins={[remarkGfm]}>{post.content}</Markdown></div>
  </article></main>;
}
