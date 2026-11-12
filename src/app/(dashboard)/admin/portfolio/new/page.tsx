import Link from "next/link";
import { PortfolioEditor } from "@/components/admin/portfolio-editor";
import { createPortfolioProject } from "@/features/portfolio/actions";
import { storageConfig } from "@/features/media/storage";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export default async function NewPortfolioPage() {
  await requireAdmin();
  let available = true;
  let media: { id: string; fileName: string; url: string; altText: string | null }[] = [];
  try {
    [, media] = await Promise.all([
      prisma.portfolioProject.count(),
      prisma.media.findMany({ select: { id: true, fileName: true, url: true, altText: true }, orderBy: { createdAt: "desc" }, take: 100 }),
    ]);
  } catch { available = false; }
  return <main><div className="admin-page-heading"><div><p className="admin-eyebrow">PORTFOLIO / NEW</p><h1>Document a <em>client project.</em></h1><p>Start as a private draft. Add only material that can be verified and approved.</p></div><Link className="admin-service-back" href="/admin/portfolio/">← All case studies</Link></div>{available ? <PortfolioEditor action={createPortfolioProject} media={media} storageConfigured={Boolean(storageConfig())} /> : <p className="admin-info-banner" role="status">The portfolio migration must be applied to a healthy database before you can create a case study.</p>}</main>;
}
