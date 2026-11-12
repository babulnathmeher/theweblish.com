import { notFound } from "next/navigation";
import { ProfileNameForm } from "@/components/admin/profile-name-form";
import { prisma } from "@/lib/prisma";
import { requireContentStaff } from "@/lib/require-content-staff";

export const dynamic = "force-dynamic";

export default async function StudioProfilePage() {
  const session = await requireContentStaff();
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true, email: true, role: true, createdAt: true } });
  if (!user) notFound();
  const initials = user.name.trim().split(/\s+/).map((part) => part.charAt(0)).slice(0, 2).join("").toUpperCase() || "TW";
  return <main className="admin-profile-page"><div className="admin-page-heading"><div><p className="admin-eyebrow">CONTENT STUDIO / PROFILE</p><h1>Your <em>profile.</em></h1><p>Manage the name shown in the content workspace.</p></div></div><section className="admin-profile-hero" aria-labelledby="studio-profile-title"><div className="admin-profile-hero-mark" aria-hidden="true">{initials}</div><div className="admin-profile-hero-copy"><span>THE WEBLISH / {user.role.toUpperCase()}</span><h2 id="studio-profile-title">{user.name}</h2><p>{user.email}</p></div><span className="admin-profile-role">{user.role}</span></section><div className="admin-profile-facts"><div><span>ACCOUNT CREATED</span><strong>{user.createdAt.toLocaleDateString("en-IN")}</strong></div><div><span>WORKSPACE ROLE</span><strong>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</strong></div></div><div className="admin-profile-grid"><section className="admin-profile-panel" aria-labelledby="studio-profile-details"><div className="admin-profile-panel-heading"><span>IDENTITY</span><h2 id="studio-profile-details">Profile details</h2></div><ProfileNameForm initialName={user.name} /><div className="admin-profile-readonly"><span>EMAIL ADDRESS</span><strong>{user.email}</strong></div></section></div></main>;
}
