"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

const idSchema = z.string().min(1).max(64);
const statusSchema = z.enum(["OPEN", "IN_PROGRESS", "WAITING_ON_CLIENT", "RESOLVED", "CLOSED"]);

export async function updateTicketStatus(formData: FormData) {
  const session = await requireAdmin();
  const id = idSchema.parse(formData.get("id"));
  const status = statusSchema.parse(formData.get("status"));
  await prisma.$transaction(async (tx) => {
    const ticket = await tx.supportTicket.findUniqueOrThrow({ where: { id }, select: { status: true } });
    if (ticket.status === status) return;
    await tx.supportTicket.update({ where: { id }, data: { status } });
    await tx.ticketActivity.create({ data: { ticketId: id, actorId: session.user.id, type: "STATUS_CHANGE", fromStatus: ticket.status, toStatus: status } });
  });
  revalidatePath("/admin/tickets/");
  revalidatePath(`/admin/tickets/${id}/`);
}

export async function addTicketNote(formData: FormData) {
  const session = await requireAdmin();
  const id = idSchema.parse(formData.get("id"));
  const note = z.string().trim().min(1).max(2000).parse(formData.get("note"));
  await prisma.ticketActivity.create({ data: { ticketId: id, actorId: session.user.id, type: "NOTE", note } });
  revalidatePath(`/admin/tickets/${id}/`);
}
