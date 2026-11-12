import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import { ServiceIcon, type ServiceIconKind } from "@/components/site/service-icon";
import { serviceIcons, servicePath } from "@/features/services/validation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export default async function ServicePreviewPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!id || id.length > 64) notFound();
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) notFound();
  const icon = serviceIcons.includes(service.icon as ServiceIconKind) ? service.icon as ServiceIconKind : "browser";
  return <main className="admin-service-preview"><div className="admin-page-heading"><div><p className="admin-eyebrow">SERVICES / PRIVATE PREVIEW</p><h1>Preview service.</h1><p>This preview is visible only to administrators.</p></div><Link href={`/admin/services/${service.id}/edit/`} className="admin-service-back">← Back to editor</Link></div><div className="admin-service-preview-banner"><span>{service.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT"}</span><span>{service.indexable ? "Indexing enabled after publish" : "Search indexing off"}</span><span>{servicePath(service.slug)}</span></div><article className="admin-service-preview-article"><div className="admin-service-preview-hero"><div><p>{service.category} / {service.eyebrow}</p><h2>{service.title}</h2><p>{service.summary}</p></div><span><ServiceIcon kind={icon} /></span></div><div className="markdown-body"><Markdown skipHtml>{service.content}</Markdown></div></article></main>;
}
