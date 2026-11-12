"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

const idSchema = z.string().min(1).max(64);
const statusSchema = z.enum(["NEW", "CONTACTED", "QUALIFIED", "CLOSED"]);

export async function updateLeadStatus(formData: FormData) {
  const session = await requireAdmin();
  const id = idSchema.parse(formData.get("id"));
  const status = statusSchema.parse(formData.get("status"));
  await prisma.$transaction(async (tx) => {
    const lead = await tx.lead.findUniqueOrThrow({ where: { id }, select: { status: true } });
    if (lead.status === status) return;
    await tx.lead.update({ where: { id }, data: { status } });
    await tx.leadActivity.create({ data: { leadId: id, actorId: session.user.id, type: "STATUS_CHANGE", fromStatus: lead.status, toStatus: status } });
  });
  revalidatePath("/admin/leads/");
  revalidatePath(`/admin/leads/${id}/`);
}

export async function addLeadNote(formData: FormData) {
  const session = await requireAdmin();
  const id = idSchema.parse(formData.get("id"));
  const note = z.string().trim().min(1).max(2000).parse(formData.get("note"));
  await prisma.leadActivity.create({ data: { leadId: id, actorId: session.user.id, type: "NOTE", note } });
  revalidatePath(`/admin/leads/${id}/`);
}
