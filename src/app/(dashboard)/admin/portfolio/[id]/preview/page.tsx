/* eslint-disable @next/next/no-img-element -- Media URLs come from configured object storage. */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export const metadata: Metadata = { title: "Case-study preview", robots: { index: false, follow: false } };

export default async function PortfolioPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (id.length > 64) notFound();
  const project = await prisma.portfolioProject.findUnique({ where: { id }, include: { coverMedia: { select: { url: true, altText: true } } } });
  if (!project) notFound();
  return <main className="admin-portfolio-preview"><div className="admin-portfolio-preview-banner"><span>ADMIN PREVIEW · {project.status}</span><Link href={`/admin/portfolio/${id}/edit/`}>Edit case study ↗</Link></div><article><p className="admin-eyebrow">{project.industry || "CLIENT PROJECT"}</p><h1>{project.title}</h1><p className="admin-portfolio-preview-client">For {project.clientName || "Client name pending"}</p>{project.coverMedia && <img className="admin-portfolio-preview-cover" src={project.coverMedia.url} alt={project.coverMedia.altText || project.title} />}{project.summary && <p className="admin-portfolio-preview-lede">{project.summary}</p>}
    <div className="admin-portfolio-preview-meta">{project.services && <span><strong>Services</strong>{project.services}</span>}{project.projectUrl && <a href={project.projectUrl} target="_blank" rel="noopener noreferrer">Visit project website ↗</a>}</div>
    {project.challenge && <section><h2>The challenge</h2><div className="markdown-body"><Markdown skipHtml remarkPlugins={[remarkGfm]}>{project.challenge}</Markdown></div></section>}
    {project.approach && <section><h2>Our approach</h2><div className="markdown-body"><Markdown skipHtml remarkPlugins={[remarkGfm]}>{project.approach}</Markdown></div></section>}
    {project.outcome && <section><h2>The outcome</h2><div className="markdown-body"><Markdown skipHtml remarkPlugins={[remarkGfm]}>{project.outcome}</Markdown></div></section>}
  </article></main>;
}
