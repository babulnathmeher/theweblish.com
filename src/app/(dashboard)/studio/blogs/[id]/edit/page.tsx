import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogEditor } from "@/components/admin/blog-editor";
import { DeletePostForm } from "@/components/admin/delete-post-form";
import { updateBlogPost } from "@/features/blogs/actions";
import { storageConfig } from "@/features/media/storage";
import { canManageBlogPost, contentRole } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { requireContentStaff } from "@/lib/require-content-staff";

export default async function EditStudioPostPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const session = await requireContentStaff();
  const role = contentRole(session)!;
  const { id } = await params;
  if (!id || id.length > 64) notFound();
  const { saved } = await searchParams;
  const [post, authors, media] = await Promise.all([
    prisma.blogPost.findUnique({ where: { id }, include: { coverMedia: { select: { id: true, fileName: true, url: true, altText: true } } } }),
    prisma.user.findMany({ where: { role: { in: ["admin", "editor", "author"] }, ...(role === "author" ? { id: session.user.id } : {}) }, select: { id: true, name: true, email: true }, orderBy: { name: "asc" } }),
    prisma.media.findMany({ select: { id: true, fileName: true, url: true, altText: true }, orderBy: { createdAt: "desc" }, take: 100 }),
  ]);
  if (!post || !canManageBlogPost(role, session.user.id, post, "read")) notFound();
  const availableMedia = post.coverMedia && !media.some((item) => item.id === post.coverMediaId) ? [post.coverMedia, ...media] : media;
  return <main><div className="admin-page-heading"><div><p className="admin-eyebrow">CONTENT STUDIO / EDIT POST</p><h1>Edit <em>your story.</em></h1><p>{role === "author" ? "Your draft stays private until an editor publishes it." : "Changes to a published article are visible after saving."}</p></div><Link className="admin-service-back" href="/studio/blogs/">← All posts</Link></div><BlogEditor action={updateBlogPost} post={{ ...post, publishedAt: post.publishedAt?.toISOString() || null }} authors={authors} media={availableMedia} storageConfigured={Boolean(storageConfig())} initiallySaved={saved === "1"} basePath="/studio/blogs" canPublish={role !== "author"} canUpload={role !== "author"} /><DeletePostForm id={post.id} /></main>;
}
