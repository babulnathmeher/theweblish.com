import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ManagedServicePage } from "@/components/site/service-page";
import { getPublishedService, isNewManagedService } from "@/features/services/public";
import { servicePath } from "@/features/services/validation";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (!isNewManagedService(slug)) return { robots: { index: false, follow: false } };
  const service = await getPublishedService(slug);
  if (!service) return { robots: { index: false, follow: false } };
  return { title: service.seoTitle || service.title, description: service.seoDescription || service.summary, alternates: { canonical: servicePath(slug) }, robots: { index: service.indexable, follow: service.indexable } };
}

export default async function ManagedServiceRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isNewManagedService(slug)) notFound();
  const service = await getPublishedService(slug);
  if (!service) notFound();
  return <ManagedServicePage service={service} />;
}
