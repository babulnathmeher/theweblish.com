"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export type CreateTeamMemberState = { success: boolean; message: string };

const accountSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().trim().toLowerCase().max(191),
  role: z.enum(["editor", "author"]),
  password: z.string().min(12).max(128),
});

export async function createTeamMember(_previous: CreateTeamMemberState, formData: FormData): Promise<CreateTeamMemberState> {
  await requireAdmin();
  const parsed = accountSchema.safeParse({
    name: formData.get("name"), email: formData.get("email"),
    role: formData.get("role"), password: formData.get("password"),
  });
  if (!parsed.success) return { success: false, message: "Enter a valid name, email, role, and password of at least 12 characters." };
  const { name, email, role, password } = parsed.data;
  try {
    const created = await auth.api.createUser({ body: { name, email, password } });
    if (role === "editor") await prisma.user.update({ where: { id: created.user.id }, data: { role: "editor" } });
    revalidatePath("/admin/team/");
    return { success: true, message: `${role === "editor" ? "Editor" : "Author"} account created. Share the initial password privately.` };
  } catch {
    return { success: false, message: "Account could not be created. Check whether the email is already in use." };
  }
}
