import Link from "next/link";
import { BlogEditor } from "@/components/admin/blog-editor";
import { createBlogPost } from "@/features/blogs/actions";
import { storageConfig } from "@/features/media/storage";
import { prisma } from "@/lib/prisma";
import { requireContentStaff } from "@/lib/require-content-staff";

export default async function NewStudioPostPage() {
  const session = await requireContentStaff();
  const author = session.user.role === "author";
  const [authors, media] = await Promise.all([
    prisma.user.findMany({ where: { role: { in: ["admin", "editor", "author"] }, ...(author ? { id: session.user.id } : {}) }, select: { id: true, name: true, email: true }, orderBy: { name: "asc" } }),
    prisma.media.findMany({ select: { id: true, fileName: true, url: true, altText: true }, orderBy: { createdAt: "desc" }, take: 100 }),
  ]);
  return <main><div className="admin-page-heading"><div><p className="admin-eyebrow">CONTENT STUDIO / NEW POST</p><h1>Write a <em>new story.</em></h1><p>{author ? "Save your draft for editorial review." : "Create a draft, review it, then publish when ready."}</p></div><Link className="admin-service-back" href="/studio/blogs/">← All posts</Link></div><BlogEditor action={createBlogPost} authors={authors} media={media} storageConfigured={Boolean(storageConfig())} basePath="/studio/blogs" canPublish={!author} canUpload={!author} /></main>;
}
