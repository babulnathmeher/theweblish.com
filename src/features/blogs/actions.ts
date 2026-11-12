"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireContentStaff } from "@/lib/require-content-staff";
import { canManageBlogPost, contentRole } from "@/lib/authorization";
import { type BlogActionState, type BlogInput, validateBlogInput } from "@/features/blogs/validation";
import { legacyArticleSlugs } from "@/config/site";

function codeOf(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
}

async function checkRelations(input: BlogInput): Promise<BlogActionState | null> {
  const author = await prisma.user.findUnique({ where: { id: input.authorId }, select: { role: true } });
  if (!author || !["admin", "editor", "author"].includes(author.role)) return { fields: { authorId: "Choose a valid staff author." }, message: "Check the form." };
  if (input.coverMediaId && !await prisma.media.findUnique({ where: { id: input.coverMediaId }, select: { id: true } })) {
    return { fields: { coverMediaId: "Choose an uploaded image." }, message: "Check the form." };
  }
  return null;
}

export async function createBlogPost(_previous: BlogActionState, formData: FormData): Promise<BlogActionState> {
  const session = await requireContentStaff();
  const validated = validateBlogInput(formData, "save");
  if (!validated.success) return { fields: validated.fields, message: "Check the form." };
  if (session.user.role === "author" && validated.data.authorId !== session.user.id) return { fields: { authorId: "Authors can only create their own posts." }, message: "Check the form." };
  const relationError = await checkRelations(validated.data);
  if (relationError) return relationError;
  let id: string;
  try {
    const { publishedAt: _requestedAt, ...data } = validated.data;
    void _requestedAt;
    const post = await prisma.blogPost.create({ data: { ...data, status: "DRAFT" }, select: { id: true } });
    id = post.id;
  } catch (error) {
    if (codeOf(error) === "P2002") return { fields: { slug: "This slug is already in use." }, message: "Check the form." };
    console.error("Blog creation failed");
    return { fields: {}, message: "Could not save the draft. Please try again." };
  }
  revalidatePath("/admin/blogs/");
  revalidatePath("/studio/blogs/");
  redirect(`${session.user.role === "admin" ? "/admin" : "/studio"}/blogs/${id}/edit/?saved=1`);
}

export async function updateBlogPost(_previous: BlogActionState, formData: FormData): Promise<BlogActionState> {
  const session = await requireContentStaff();
  const role = contentRole(session)!;
  const id = String(formData.get("id") || "");
  if (!id || id.length > 64) return { fields: {}, message: "Invalid post." };
  const intent = String(formData.get("intent") || "save");
  if (!["save", "publish", "unpublish"].includes(intent)) return { fields: {}, message: "Invalid action." };
  const existing = await prisma.blogPost.findUnique({ where: { id }, select: { slug: true, status: true, publishedAt: true, authorId: true } });
  if (!existing) return { fields: {}, message: "Post not found." };
  if (!canManageBlogPost(role, session.user.id, existing, intent as "save" | "publish" | "unpublish")) return { fields: {}, message: "You cannot change this post." };
  const validated = validateBlogInput(formData, intent as "save" | "publish" | "unpublish", existing.slug);
  if (!validated.success) return { fields: validated.fields, message: "Check the form." };
  if (role === "author" && validated.data.authorId !== session.user.id) return { fields: { authorId: "Authors cannot reassign posts." }, message: "Check the form." };
  const relationError = await checkRelations(validated.data);
  if (relationError) return relationError;
  if (existing.status === "PUBLISHED" && intent === "save" && !validated.data.content) {
    return { fields: { content: "A published article needs a body." }, message: "Check the form." };
  }
  const { publishedAt: requestedAt, ...data } = validated.data;
  const publication = intent === "publish" ? { status: "PUBLISHED" as const, publishedAt: requestedAt ?? (existing.status === "PUBLISHED" && existing.publishedAt ? existing.publishedAt : new Date()) }
    : intent === "unpublish" ? { status: "DRAFT" as const, publishedAt: null }
    : existing.status === "PUBLISHED" && requestedAt ? { publishedAt: requestedAt } : {};
  try {
    await prisma.blogPost.update({ where: { id }, data: { ...data, ...publication } });
  } catch (error) {
    if (codeOf(error) === "P2002") return { fields: { slug: "This slug is already in use." }, message: "Check the form." };
    console.error("Blog update failed");
    return { fields: {}, message: "Could not save the post. Please try again." };
  }
  revalidatePath("/blog/");
  revalidatePath(`/${existing.slug}/`);
  revalidatePath(`/${validated.data.slug}/`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/blogs/");
  revalidatePath("/studio/blogs/");
  return { fields: {}, message: intent === "publish" ? "Published." : intent === "unpublish" ? "Unpublished." : "Saved." };
}

export async function deleteBlogPost(formData: FormData) {
  const session = await requireContentStaff();
  const role = contentRole(session)!;
  if (formData.get("confirm") !== "DELETE") throw new Error("Deletion confirmation required.");
  const id = String(formData.get("id") || "");
  if (!id || id.length > 64) throw new Error("Invalid post.");
  const post = await prisma.blogPost.findUnique({ where: { id }, select: { slug: true, authorId: true, status: true } });
  if (!post) throw new Error("Post not found.");
  if (!canManageBlogPost(role, session.user.id, post, "delete")) throw new Error("Access denied.");
  await prisma.blogPost.delete({ where: { id } });
  revalidatePath("/blog/");
  revalidatePath(`/${post.slug}/`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/blogs/");
  revalidatePath("/studio/blogs/");
  redirect(role === "admin" ? "/admin/blogs/" : "/studio/blogs/");
}

export type ManageBlogPostState = { success: boolean; message: string };

export async function manageBlogPost(_previous: ManageBlogPostState, formData: FormData): Promise<ManageBlogPostState> {
  const session = await requireContentStaff();
  const role = contentRole(session)!;
  const id = String(formData.get("id") || "");
  const intent = String(formData.get("intent") || "");
  if (!id || id.length > 64 || !["publish", "unpublish", "delete"].includes(intent)) return { success: false, message: "Invalid post action." };
  if (intent === "delete" && formData.get("confirm") !== "DELETE") return { success: false, message: "Confirm deletion before removing the post." };
  try {
    const post = await prisma.blogPost.findUnique({ where: { id } });
    if (!post) return { success: false, message: "Post not found." };
    if (!canManageBlogPost(role, session.user.id, post, intent as "publish" | "unpublish" | "delete")) return { success: false, message: "You cannot perform this action." };
    if (intent === "publish") {
      if (post.status === "PUBLISHED") return { success: false, message: "This post is already published." };
      if (legacyArticleSlugs.has(post.slug)) return { success: false, message: "Open the editor to review and confirm the original article before publishing it." };
      const fields = new FormData();
      for (const [key, value] of Object.entries({
        title: post.title, slug: post.slug, excerpt: post.excerpt || "", content: post.content,
        seoTitle: post.seoTitle || "", seoDescription: post.seoDescription || "",
        authorId: post.authorId, coverMediaId: post.coverMediaId || "", publishedAt: "",
      })) fields.set(key, value);
      const validated = validateBlogInput(fields, "publish", post.slug);
      if (!validated.success) return { success: false, message: "This draft needs review before publishing. Open the editor to fix its fields." };
      const relationError = await checkRelations(validated.data);
      if (relationError) return { success: false, message: "This draft needs a valid author and image before publishing." };
      await prisma.blogPost.update({ where: { id }, data: { status: "PUBLISHED", publishedAt: new Date() } });
    } else if (intent === "unpublish") {
      if (post.status === "DRAFT") return { success: false, message: "This post is already a draft." };
      await prisma.blogPost.update({ where: { id }, data: { status: "DRAFT", publishedAt: null } });
    } else {
      await prisma.blogPost.delete({ where: { id } });
    }
    revalidatePath("/admin/blogs/");
    revalidatePath("/studio/blogs/");
    revalidatePath("/blog/");
    revalidatePath(`/${post.slug}/`);
    revalidatePath("/sitemap.xml");
    return { success: true, message: intent === "publish" ? "Post published." : intent === "unpublish" ? "Post moved to drafts." : "Post deleted." };
  } catch {
    console.error("Blog list action failed");
    return { success: false, message: "Could not update the post. Please try again." };
  }
}
