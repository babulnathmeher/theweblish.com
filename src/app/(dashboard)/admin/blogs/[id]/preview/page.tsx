/* eslint-disable @next/next/no-img-element -- Cover URLs come from configured object storage. */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export const metadata: Metadata = { title: "Blog preview", robots: { index: false, follow: false } };

export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id }, include: { author: { select: { name: true } }, coverMedia: { select: { url: true, altText: true } } } });
  if (!post) notFound();
  return <main className="mx-auto max-w-3xl"><p className="rounded bg-brand-yellow p-3 font-semibold">Admin preview · {post.status}</p><h1 className="mt-8 text-4xl font-bold">{post.title}</h1><p className="mt-3">By {post.author.name}</p>{post.coverMedia && <img className="mt-8 w-full" src={post.coverMedia.url} alt={post.coverMedia.altText || post.title} />}{post.excerpt && <p className="mt-6 text-lg">{post.excerpt}</p>}<div className="markdown-body mt-8"><Markdown skipHtml remarkPlugins={[remarkGfm]}>{post.content}</Markdown></div></main>;
}
