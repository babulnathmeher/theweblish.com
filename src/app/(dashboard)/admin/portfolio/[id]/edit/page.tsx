import Link from "next/link";
import { notFound } from "next/navigation";
import { PortfolioEditor } from "@/components/admin/portfolio-editor";
import { deletePortfolioProject, updatePortfolioProject } from "@/features/portfolio/actions";
import { storageConfig } from "@/features/media/storage";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { PortfolioDelete } from "@/components/admin/portfolio-delete";

export default async function EditPortfolioPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ result?: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const { result } = await searchParams;
  if (id.length > 64) notFound();
  const [project, media] = await Promise.all([
    prisma.portfolioProject.findUnique({ where: { id }, include: { coverMedia: { select: { id: true, fileName: true, url: true, altText: true } } } }),
    prisma.media.findMany({ select: { id: true, fileName: true, url: true, altText: true }, orderBy: { createdAt: "desc" }, take: 100 }),
  ]);
  if (!project) notFound();
  const options = project.coverMedia && !media.some((item) => item.id === project.coverMediaId) ? [project.coverMedia, ...media] : media;
  return <main><div className="admin-page-heading"><div><p className="admin-eyebrow">PORTFOLIO / EDIT</p><h1>Edit <em>the project story.</em></h1><p>Review client details and permission before making changes visible.</p></div><Link className="admin-service-back" href="/admin/portfolio/">← All case studies</Link></div>
    <PortfolioEditor action={updatePortfolioProject} project={{ ...project, publishedAt: project.publishedAt?.toISOString() || null }} media={options} storageConfigured={Boolean(storageConfig())} initialResult={result === "created" || result === "save" || result === "publish" || result === "unpublish" ? result : undefined} />
    <PortfolioDelete id={id} action={deletePortfolioProject} />
  </main>;
}
