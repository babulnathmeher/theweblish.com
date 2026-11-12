import { requireAdmin } from "@/lib/require-admin";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BlogEditor } from "@/components/admin/blog-editor";
import { DeletePostForm } from "@/components/admin/delete-post-form";
import { updateBlogPost } from "@/features/blogs/actions";
import { storageConfig } from "@/features/media/storage";
import Link from "next/link";

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const { saved } = await searchParams;
  const [post, authors, media] = await Promise.all([
    prisma.blogPost.findUnique({ where: { id }, include: { coverMedia: { select: { id: true, fileName: true, url: true, altText: true } } } }),
    prisma.user.findMany({ where: { role: { in: ["admin", "editor", "author"] } }, select: { id: true, name: true, email: true }, orderBy: { name: "asc" } }),
    prisma.media.findMany({ select: { id: true, fileName: true, url: true, altText: true }, orderBy: { createdAt: "desc" }, take: 100 }),
  ]);
  if (!post) notFound();
  return <main><div className="admin-page-heading"><div><p className="admin-eyebrow">CONTENT STUDIO / EDIT POST</p><h1>Edit <em>your story.</em></h1><p>Changes to a published article become visible after saving.</p></div><Link className="admin-service-back" href="/admin/blogs/">â† All posts</Link></div><BlogEditor action={updateBlogPost} post={{ ...post, publishedAt: post.publishedAt?.toISOString() || null }} authors={authors} media={post.coverMedia && !media.some((item) => item.id === post.coverMediaId) ? [post.coverMedia, ...media] : media} storageConfigured={Boolean(storageConfig())} initiallySaved={saved === "1"} /><DeletePostForm id={post.id} /></main>;
}

