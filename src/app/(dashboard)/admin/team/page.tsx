import { TeamCreateForm } from "@/components/admin/team-create-form";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  await requireAdmin();
  const members = await prisma.user.findMany({ where: { role: { in: ["admin", "editor", "author"] } }, select: { id: true, name: true, email: true, role: true, createdAt: true, banned: true }, orderBy: [{ createdAt: "desc" }, { id: "desc" }] });
  return <main className="admin-team-page"><div className="admin-page-heading"><div><p className="admin-eyebrow">ACCOUNT / ACCESS</p><h1>Team <em>access.</em></h1><p>Create separate editor and author credentials for the content workspace.</p></div></div>
    <div className="admin-team-grid"><section className="admin-profile-panel" aria-labelledby="team-create-title"><div className="admin-profile-panel-heading"><span>01 / NEW ACCOUNT</span><h2 id="team-create-title">Add a team member</h2><p>New accounts can sign in at the existing workspace login.</p></div><TeamCreateForm /></section><section className="admin-profile-panel" aria-labelledby="team-roles-title"><div className="admin-profile-panel-heading"><span>02 / PERMISSIONS</span><h2 id="team-roles-title">Role boundaries</h2></div><dl className="admin-team-roles"><div><dt>Admin</dt><dd>Full operational workspace and account provisioning.</dd></div><div><dt>Editor</dt><dd>All blog posts, including review, publication, and deletion.</dd></div><div><dt>Author</dt><dd>Own unpublished drafts only. Cannot publish or view other authors’ drafts.</dd></div></dl></section></div>
    <section className="admin-posts-panel" aria-labelledby="team-list-title"><div className="admin-posts-panel-heading"><div><span>TEAM DIRECTORY</span><h2 id="team-list-title">Current accounts</h2></div><p>{members.length} {members.length === 1 ? "account" : "accounts"}</p></div><div className="admin-posts-table-wrap"><table className="admin-ticket-table"><caption className="sr-only">Team accounts</caption><thead><tr><th scope="col">Name</th><th scope="col">Email</th><th scope="col">Role</th><th scope="col">Created</th><th scope="col">Access</th></tr></thead><tbody>{members.map((member) => <tr key={member.id}><td><strong>{member.name}</strong></td><td>{member.email}</td><td><span className="admin-team-role-pill">{member.role}</span></td><td><time dateTime={member.createdAt.toISOString()}>{member.createdAt.toLocaleDateString("en-IN")}</time></td><td>{member.banned ? "Disabled" : "Active"}</td></tr>)}</tbody></table></div></section>
  </main>;
}
