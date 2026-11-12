"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminConnectivityIndicator } from "@/components/admin/admin-connectivity-indicator";
import { SignOutButton } from "@/components/admin/sign-out-button";

type IconName = "dashboard" | "services" | "leads" | "tickets" | "blog" | "portfolio" | "media" | "landing" | "contact" | "settings" | "profile" | "external" | "team";

const iconPaths: Record<IconName, string> = {
  dashboard: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",
  services: "M4 7h16 M4 12h16 M4 17h16 M7 4v16 M17 4v16",
  leads: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  tickets: "M4 3h16v6a3 3 0 0 0 0 6v6H4v-6a3 3 0 0 0 0-6z M12 3v18",
  blog: "M5 4h11l3 3v13H5z M15 4v4h4 M8 12h8 M8 16h8",
  portfolio: "M3 7h18v13H3z M8 7V4h8v3 M3 13h18 M10 13v2h4v-2",
  media: "M4 4h16v16H4z M7 16l4-4 3 3 2-2 2 3 M8 8h.01",
  landing: "M3 5h18v14H3z M3 9h18 M7 14h5 M16 14h2",
  contact: "M3 5h18v14H3z M3 6l9 7 9-7",
  settings: "M12 3v2 M12 19v2 M3 12h2 M19 12h2 M5.6 5.6 1.4 1.4 M17 17l1.4 1.4 M18.4 5.6 17 7 M7 17l-1.4 1.4 M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8",
  profile: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M4 21v-2a8 8 0 0 1 16 0v2z",
  team: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  external: "M7 17 17 7 M8 7h9v9",
};

export function AdminIcon({ name, size = 19 }: { name: IconName; size?: number }) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={iconPaths[name]} /></svg>;
}

const groups: { label: string; links: { label: string; href: string; icon: IconName }[] }[] = [
  { label: "Overview", links: [
    { label: "Dashboard", href: "/admin/", icon: "dashboard" },
    { label: "Services", href: "/admin/services/", icon: "services" },
    { label: "Enquiries", href: "/admin/leads/", icon: "leads" },
    { label: "Support tickets", href: "/admin/tickets/", icon: "tickets" },
  ] },
  { label: "Content", links: [
    { label: "Blog posts", href: "/admin/blogs/", icon: "blog" },
    { label: "Portfolio", href: "/admin/portfolio/", icon: "portfolio" },
    { label: "Media", href: "/admin/media/", icon: "media" },
    { label: "Landing pages", href: "/admin/landing-pages/", icon: "landing" },
    { label: "Contact", href: "/admin/contacts/", icon: "contact" },
  ] },
  { label: "Account", links: [
    { label: "Team access", href: "/admin/team/", icon: "team" },
    { label: "Settings", href: "/admin/settings/", icon: "settings" },
    { label: "Profile", href: "/admin/profile/", icon: "profile" },
  ] },
];

function isActiveAdminLink(pathname: string, href: string) {
  const current = pathname.replace(/\/+$/, "") || "/";
  const target = href.replace(/\/+$/, "") || "/";
  return current === target || (target !== "/admin" && current.startsWith(`${target}/`));
}

function NavigationLinks({ pathname }: { pathname: string }) {
  return <>{groups.map((group) => <div className="admin-nav-group" key={group.label}>
    <p className="admin-nav-label">{group.label}</p>
    {group.links.map((item) => {
      const active = isActiveAdminLink(pathname, item.href);
      return <Link key={item.href} href={item.href} className={`admin-nav-link${active ? " is-active" : ""}`} aria-current={active ? "page" : undefined}><span className="admin-nav-icon"><AdminIcon name={item.icon} /></span><span className="admin-nav-link-label">{item.label}</span><span className="admin-nav-arrow" aria-hidden="true">↗</span></Link>;
    })}
  </div>)}</>;
}

export function AdminShell({ children, user }: { children: React.ReactNode; user: { name: string; email: string } }) {
  const pathname = usePathname();
  const current = groups.flatMap((group) => group.links).find((item) => isActiveAdminLink(pathname, item.href));
  const initials = user.name.trim().split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase() || "TW";

  return <div className="admin-shell">
    <aside className="admin-sidebar" aria-label="Admin navigation">
      <Link href="/admin/" className="admin-brand"><span className="admin-brand-mark"><Image src="/images/logo.png" alt="The Weblish" width={150} height={24} priority /></span><span className="admin-brand-caption">WORKSPACE</span></Link>
      <div className="admin-sidebar-intro"><span className="admin-status-dot" /> Admin workspace <span className="admin-sidebar-edition">01 / HQ</span></div>
      <nav aria-label="Main admin navigation" className="admin-sidebar-nav"><NavigationLinks pathname={pathname} /></nav>
      <div className="admin-sidebar-bottom"><Link href="/" className="admin-site-link" target="_blank" rel="noopener noreferrer">View website <AdminIcon name="external" size={17} /></Link><div className="admin-user-card"><span className="admin-avatar">{initials}</span><span className="admin-user-copy"><strong>{user.name}</strong><small>Administrator</small></span><SignOutButton /></div></div>
    </aside>
    <div className="admin-main-column">
      <header className="admin-topbar"><div className="admin-topbar-title"><span className="admin-topbar-kicker">THE WEBLISH / ADMIN</span><strong>{current?.label || "Workspace"}</strong></div><div className="admin-topbar-actions"><AdminConnectivityIndicator /><Link href="/admin/profile/" className="admin-topbar-avatar" aria-label="Open profile">{initials}</Link></div></header>
      <details className="admin-mobile-navigation"><summary><span>Menu</span><span aria-hidden="true">☰</span></summary><nav aria-label="Mobile admin navigation"><NavigationLinks pathname={pathname} /><div className="admin-mobile-extras"><Link href="/">View website</Link><SignOutButton /></div></nav></details>
      <div className="admin-content">{children}</div>
    </div>
  </div>;
}
