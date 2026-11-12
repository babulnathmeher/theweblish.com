"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminConnectivityIndicator } from "@/components/admin/admin-connectivity-indicator";
import { SignOutButton } from "@/components/admin/sign-out-button";

const links = [
  { href: "/studio/", label: "Overview", symbol: "◫" },
  { href: "/studio/blogs/", label: "Blog posts", symbol: "▤" },
  { href: "/studio/profile/", label: "Profile", symbol: "◉" },
];

export function StudioShell({ children, user }: { children: React.ReactNode; user: { name: string; role: "editor" | "author" } }) {
  const pathname = usePathname();
  const current = links.find((link) => link.href === "/studio/" ? pathname === link.href : pathname.startsWith(link.href));
  const initials = user.name.trim().split(/\s+/).map((part) => part.charAt(0)).slice(0, 2).join("").toUpperCase() || "TW";
  const label = user.role === "editor" ? "Editor" : "Author";
  return <div className="admin-shell studio-shell"><aside className="admin-sidebar" aria-label={`${label} navigation`}><Link href="/studio/" className="admin-brand"><span className="admin-brand-mark"><Image src="/images/logo.png" alt="The Weblish" width={150} height={24} priority /></span><span className="admin-brand-caption">STUDIO</span></Link><div className="admin-sidebar-intro"><span className="admin-status-dot" /> {label} workspace <span className="admin-sidebar-edition">CONTENT</span></div><nav className="admin-sidebar-nav" aria-label="Content studio navigation"><div className="admin-nav-group"><p className="admin-nav-label">Content studio</p>{links.map((link) => { const active = current?.href === link.href; return <Link key={link.href} href={link.href} className={`admin-nav-link${active ? " is-active" : ""}`} aria-current={active ? "page" : undefined}><span className="admin-nav-icon" aria-hidden="true">{link.symbol}</span><span className="admin-nav-link-label">{link.label}</span></Link>; })}</div></nav><div className="admin-sidebar-bottom"><Link href="/" className="admin-site-link" target="_blank" rel="noopener noreferrer">View website <span aria-hidden="true">↗</span></Link><div className="admin-user-card"><span className="admin-avatar">{initials}</span><span className="admin-user-copy"><strong>{user.name}</strong><small>{label}</small></span><SignOutButton /></div></div></aside><div className="admin-main-column"><header className="admin-topbar"><div className="admin-topbar-title"><span className="admin-topbar-kicker">THE WEBLISH / {label.toUpperCase()} STUDIO</span><strong>{current?.label || "Workspace"}</strong></div><div className="admin-topbar-actions"><AdminConnectivityIndicator /><Link href="/studio/profile/" className="admin-topbar-avatar" aria-label="Open profile">{initials}</Link></div></header><details className="admin-mobile-navigation"><summary><span>Menu</span><span aria-hidden="true">☰</span></summary><nav aria-label="Mobile content studio navigation"><div className="admin-nav-group">{links.map((link) => <Link key={link.href} href={link.href} className="admin-nav-link">{link.label}</Link>)}</div><div className="admin-mobile-extras"><Link href="/">View website</Link><SignOutButton /></div></nav></details><div className="admin-content">{children}</div></div></div>;
}
