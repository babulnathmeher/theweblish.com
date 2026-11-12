import { notFound } from "next/navigation";
import { ProfileNameForm } from "@/components/admin/profile-name-form";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" });
const dateTimeFormatter = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" });

export default async function ProfilePage() {
  const session = await requireAdmin();
  const [user, activeSessions] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true, email: true, role: true, createdAt: true, updatedAt: true } }),
    prisma.session.count({ where: { userId: session.user.id, expiresAt: { gt: new Date() } } }),
  ]);
  if (!user) notFound();
  const initials = user.name.trim().split(/\s+/).map((part) => part.charAt(0)).slice(0, 2).join("").toUpperCase() || "TW";

  return <main className="admin-profile-page">
    <div className="admin-page-heading"><div><p className="admin-eyebrow">ACCOUNT / PROFILE</p><h1>Your <em>profile.</em></h1><p>Manage the identity shown in your administrator workspace.</p></div></div>
    <section className="admin-profile-hero" aria-labelledby="profile-identity-title">
      <div className="admin-profile-hero-mark" aria-hidden="true">{initials}</div>
      <div className="admin-profile-hero-copy"><span>THE WEBLISH / ADMINISTRATOR</span><h2 id="profile-identity-title">{user.name}</h2><p>{user.email}</p></div>
      <span className="admin-profile-role">{user.role}</span>
    </section>
    <div className="admin-profile-facts" aria-label="Account overview">
      <div><span>ACCOUNT CREATED</span><strong><time dateTime={user.createdAt.toISOString()}>{dateFormatter.format(user.createdAt)}</time></strong></div>
      <div><span>ACTIVE SESSIONS</span><strong>{activeSessions}</strong><small>Including this browser</small></div>
      <div><span>CURRENT SIGN-IN</span><strong><time dateTime={session.session.createdAt.toISOString()}>{dateTimeFormatter.format(session.session.createdAt)}</time></strong></div>
    </div>
    <div className="admin-profile-grid"><section className="admin-profile-panel" aria-labelledby="profile-details-title"><div className="admin-profile-panel-heading"><span>01 / IDENTITY</span><h2 id="profile-details-title">Profile details</h2><p>Update the name shown across the admin workspace.</p></div><ProfileNameForm initialName={user.name} /><div className="admin-profile-readonly"><span>EMAIL ADDRESS</span><strong>{user.email}</strong><small>Email changes are unavailable until a verified change flow is configured.</small></div></section></div>
  </main>;
}
