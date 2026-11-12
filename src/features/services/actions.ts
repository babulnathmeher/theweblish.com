"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { isCoreServiceSlug, servicePath, type ServiceActionState, validateServiceInput } from "@/features/services/validation";
import { serviceCmsEnabled } from "@/features/services/config";

function codeOf(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
}

function refreshServiceRoutes(oldSlug?: string, newSlug?: string) {
  // The shared footer lists published services on statically rendered pages.
  revalidatePath("/", "layout");
  revalidatePath("/admin/");
  revalidatePath("/admin/services/");
  revalidatePath("/digital-solution/");
  revalidatePath("/sitemap.xml");
  if (oldSlug) revalidatePath(servicePath(oldSlug));
  if (newSlug) revalidatePath(servicePath(newSlug));
}

export async function createService(_previous: ServiceActionState, formData: FormData): Promise<ServiceActionState> {
  await requireAdmin();
  if (!serviceCmsEnabled()) return { fields: {}, message: "Service editing is unavailable until the database migration is applied and enabled." };
  const legacySlug = String(formData.get("legacySlug") || "");
  if (legacySlug && !isCoreServiceSlug(legacySlug)) return { fields: { slug: "Choose an existing service page." }, message: "" };
  const validated = validateServiceInput(formData, legacySlug || undefined);
  if (!validated.success) return { fields: validated.fields, message: "" };
  let id: string;
  try {
    const service = await prisma.service.create({ data: { ...validated.data, status: "DRAFT" }, select: { id: true } });
    id = service.id;
  } catch (error) {
    if (codeOf(error) === "P2002") return { fields: { slug: "This service URL is already managed." }, message: "" };
    console.error("Service creation failed");
    return { fields: {}, message: "Service editing is unavailable right now. Please try again later." };
  }
  refreshServiceRoutes(undefined, validated.data.slug);
  redirect(`/admin/services/${id}/edit/`);
}

export async function updateService(_previous: ServiceActionState, formData: FormData): Promise<ServiceActionState> {
  await requireAdmin();
  if (!serviceCmsEnabled()) return { fields: {}, message: "Service editing is unavailable until the database migration is applied and enabled." };
  const id = String(formData.get("id") || "");
  if (!id || id.length > 64) return { fields: {}, message: "Invalid service." };
  const intent = String(formData.get("intent") || "save");
  if (!["save", "publish", "unpublish"].includes(intent)) return { fields: {}, message: "Invalid action." };
  let existing: { slug: string; status: "DRAFT" | "PUBLISHED"; publishedAt: Date | null } | null;
  try {
    existing = await prisma.service.findUnique({ where: { id }, select: { slug: true, status: true, publishedAt: true } });
  } catch {
    return { fields: {}, message: "Service editing is unavailable right now. Please try again later." };
  }
  if (!existing) return { fields: {}, message: "Service not found." };
  const validated = validateServiceInput(formData, isCoreServiceSlug(existing.slug) ? existing.slug : undefined);
  if (!validated.success) return { fields: validated.fields, message: "" };
  if (validated.data.slug !== existing.slug) return { fields: { slug: "Keep the existing service URL." }, message: "" };
  const publication = intent === "publish"
    ? { status: "PUBLISHED" as const, publishedAt: existing.status === "PUBLISHED" && existing.publishedAt ? existing.publishedAt : new Date() }
    : intent === "unpublish" ? { status: "DRAFT" as const, publishedAt: null } : {};
  try {
    await prisma.service.update({ where: { id }, data: { ...validated.data, ...publication } });
  } catch (error) {
    if (codeOf(error) === "P2002") return { fields: { slug: "This service URL is already managed." }, message: "" };
    console.error("Service update failed");
    return { fields: {}, message: "Could not save this service. Please try again." };
  }
  refreshServiceRoutes(existing.slug, validated.data.slug);
  revalidatePath(`/admin/services/${id}/edit/`);
  revalidatePath(`/admin/services/${id}/preview/`);
  redirect(`/admin/services/${id}/edit/?result=${intent}`);
}

export async function deleteService(formData: FormData) {
  await requireAdmin();
  if (!serviceCmsEnabled()) throw new Error("Service editing is unavailable.");
  if (formData.get("confirm") !== "DELETE") throw new Error("Deletion confirmation required.");
  const id = String(formData.get("id") || "");
  if (!id || id.length > 64) throw new Error("Invalid service.");
  const service = await prisma.service.findUnique({ where: { id }, select: { slug: true } });
  if (!service) throw new Error("Service not found.");
  await prisma.service.delete({ where: { id } });
  refreshServiceRoutes(service.slug);
  redirect("/admin/services/");
}
