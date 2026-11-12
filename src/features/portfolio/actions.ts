"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { type PortfolioActionState, validatePortfolioInput } from "@/features/portfolio/validation";

function codeOf(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
}

async function mediaExists(id: string | null) {
  return !id || Boolean(await prisma.media.findUnique({ where: { id }, select: { id: true } }));
}

export async function createPortfolioProject(_previous: PortfolioActionState, formData: FormData): Promise<PortfolioActionState> {
  await requireAdmin();
  const validated = validatePortfolioInput(formData);
  if (!validated.success) return { fields: validated.fields, message: "" };
  let id: string;
  try {
    if (!await mediaExists(validated.data.coverMediaId)) return { fields: { coverMediaId: "Choose an image from the media library." }, message: "" };
    const project = await prisma.portfolioProject.create({ data: { ...validated.data, status: "DRAFT", indexable: false }, select: { id: true } });
    id = project.id;
  } catch (error) {
    if (codeOf(error) === "P2002") return { fields: { slug: "This case-study slug is already in use." }, message: "" };
    console.error("Portfolio project creation failed");
    return { fields: {}, message: "Could not save the case study. Check that the portfolio migration is applied." };
  }
  revalidatePath("/admin/portfolio/");
  redirect(`/admin/portfolio/${id}/edit/?result=created`);
}

export async function updatePortfolioProject(_previous: PortfolioActionState, formData: FormData): Promise<PortfolioActionState> {
  const session = await requireAdmin();
  const id = String(formData.get("id") || "");
  const intent = String(formData.get("intent") || "save");
  if (!id || id.length > 64 || !["save", "publish", "unpublish"].includes(intent)) return { fields: {}, message: "Invalid case-study action." };
  try {
    const existing = await prisma.portfolioProject.findUnique({ where: { id }, select: { slug: true, status: true, publishedAt: true } });
    if (!existing) return { fields: {}, message: "Case study not found." };
    const mustReview = intent === "publish" || (intent === "save" && existing.status === "PUBLISHED");
    const validated = validatePortfolioInput(formData, mustReview ? "publish" : intent === "unpublish" ? "unpublish" : "save", existing.slug);
    if (!validated.success) return { fields: validated.fields, message: "" };
    if (!await mediaExists(validated.data.coverMediaId)) return { fields: { coverMediaId: "Choose an image from the media library." }, message: "" };
    const publication = intent === "publish" ? {
      status: "PUBLISHED" as const, publishedAt: existing.publishedAt || new Date(), approvedAt: new Date(), approvedById: session.user.id,
    } : intent === "unpublish" ? { status: "DRAFT" as const, publishedAt: null, approvedAt: null, approvedById: null }
      : existing.status === "PUBLISHED" ? { approvedAt: new Date(), approvedById: session.user.id } : {};
    await prisma.portfolioProject.update({ where: { id }, data: { ...validated.data, ...publication } });
  } catch (error) {
    if (codeOf(error) === "P2002") return { fields: { slug: "This case-study slug is already in use." }, message: "" };
    console.error("Portfolio project update failed");
    return { fields: {}, message: "Could not update the case study. Please try again." };
  }
  revalidatePath("/admin/portfolio/");
  revalidatePath(`/admin/portfolio/${id}/edit/`);
  revalidatePath(`/admin/portfolio/${id}/preview/`);
  revalidatePath("/our-clients/");
  redirect(`/admin/portfolio/${id}/edit/?result=${intent}`);
}

export async function deletePortfolioProject(formData: FormData) {
  await requireAdmin();
  if (formData.get("confirm") !== "DELETE") throw new Error("Deletion confirmation required.");
  const id = String(formData.get("id") || "");
  if (!id || id.length > 64) throw new Error("Invalid case study.");
  await prisma.portfolioProject.delete({ where: { id } });
  revalidatePath("/admin/portfolio/");
  revalidatePath("/our-clients/");
  redirect("/admin/portfolio/");
}
