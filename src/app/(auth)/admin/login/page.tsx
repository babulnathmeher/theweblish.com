import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "@/components/admin/login-form";
import "@/app/admin.css";

export const metadata: Metadata = { title: "Admin login", robots: { index: false, follow: false } };

export default function AdminLoginPage() {
  return <main className="admin-login-shell"><div className="admin-login-layout"><section className="admin-login-story" aria-label="The Weblish workspace"><Link href="/" className="admin-login-brand"><Image src="/images/logo.png" alt="The Weblish" width={210} height={34} priority /></Link><div className="admin-login-story-copy"><span className="admin-login-kicker"><span /> THE WEBLISH WORKSPACE</span><h1>Make room for <em>what&apos;s next.</em></h1><p>One thoughtful place for your enquiries, content, and conversations.</p></div><div className="admin-login-story-bottom"><span>PRIVATE ADMIN ACCESS</span><span>DESIGN · BUILD · GROW</span></div><div className="admin-login-orbit admin-login-orbit-one" aria-hidden="true" /><div className="admin-login-orbit admin-login-orbit-two" aria-hidden="true" /></section><section className="admin-login-form-panel" aria-labelledby="admin-login-title"><div className="admin-login-panel-top"><span className="admin-login-panel-mark">TW<span>.</span></span><Link href="/">Back to website ↗</Link></div><div className="admin-login-form-wrap"><p className="admin-eyebrow">WELCOME BACK / ADMIN ACCESS</p><h2 id="admin-login-title">Sign in to your workspace<span>.</span></h2><p>Enter your administrator credentials to continue.</p><LoginForm /></div><p className="admin-login-panel-foot">The Weblish · Private workspace</p></section></div></main>;
}
