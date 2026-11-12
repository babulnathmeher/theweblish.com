import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { BlogEditor } from "@/components/admin/blog-editor";
import { createBlogPost } from "@/features/blogs/actions";
import { storageConfig } from "@/features/media/storage";
import Link from "next/link";

export default async function Page() {
  await requireAdmin();
  const [authors, media] = await Promise.all([
    prisma.user.findMany({ where: { role: { in: ["admin", "editor", "author"] } }, select: { id: true, name: true, email: true }, orderBy: { name: "asc" } }),
    prisma.media.findMany({ select: { id: true, fileName: true, url: true, altText: true }, orderBy: { createdAt: "desc" }, take: 100 }),
  ]);
  return <main><div className="admin-page-heading"><div><p className="admin-eyebrow">CONTENT STUDIO / NEW POST</p><h1>Write a <em>new story.</em></h1><p>Create a draft, review it, then publish when it is ready.</p></div><Link className="admin-service-back" href="/admin/blogs/">â† All posts</Link></div><BlogEditor action={createBlogPost} authors={authors} media={media} storageConfigured={Boolean(storageConfig())} /></main>;
}
