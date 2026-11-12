"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

const idSchema = z.string().min(1).max(64);
const statusSchema = z.enum(["NEW", "READ", "REPLIED", "ARCHIVED"]);

export async function updateContactStatus(formData: FormData) {
  const session = await requireAdmin();
  const id = idSchema.parse(formData.get("id"));
  const status = statusSchema.parse(formData.get("status"));
  await prisma.$transaction(async (tx) => {
    const contact = await tx.contactMessage.findUniqueOrThrow({ where: { id }, select: { status: true } });
    if (contact.status === status) return;
    await tx.contactMessage.update({ where: { id }, data: { status } });
    await tx.contactActivity.create({ data: { contactId: id, actorId: session.user.id, type: "STATUS_CHANGE", fromStatus: contact.status, toStatus: status } });
  });
  revalidatePath("/admin/contacts/");
  revalidatePath(`/admin/contacts/${id}/`);
}

export async function addContactNote(formData: FormData) {
  const session = await requireAdmin();
  const id = idSchema.parse(formData.get("id"));
  const note = z.string().trim().min(1).max(2000).parse(formData.get("note"));
  await prisma.contactActivity.create({ data: { contactId: id, actorId: session.user.id, type: "NOTE", note } });
  revalidatePath(`/admin/contacts/${id}/`);
}
