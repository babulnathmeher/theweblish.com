"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { primaryNavigation } from "@/config/navigation";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isWebsitePage = pathname === "/website-development/" || pathname === "/website-development";
  const navigation = isWebsitePage ? [
    { label: "Our work", href: "#work" },
    { label: "Our approach", href: "#approach" },
    { label: "FAQs", href: "#faq" },
  ] : primaryNavigation;
  useEffect(() => {
    function escape(event: KeyboardEvent) { if (event.key === "Escape") setOpen(false); }
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, []);
  useEffect(() => {
    const updateScrollState = () => setScrolled(window.scrollY > 48);
    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);
  return <header className={`site-header site-header-unified${scrolled ? " is-scrolled" : ""}`}>
    <div className="site-container header-inner">
      <Link href="/" className="site-name" aria-label="The Weblish home" onClick={() => setOpen(false)}><Image src="/images/logo.png" alt="" width={1230} height={200} priority unoptimized className="site-logo-image" /></Link>
      <nav className="desktop-nav" aria-label={isWebsitePage ? "Page sections" : "Primary navigation"}>{navigation.map((item) => <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined}>{item.label}</Link>)}</nav>
      <Link href="/contact/" className="button button-yellow header-cta">Let&apos;s talk <span aria-hidden="true">↗</span></Link>
      <button type="button" className="menu-toggle" aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((value) => !value)}><span /><span /><span /></button>
    </div>
    <nav id="mobile-navigation" className={`mobile-nav ${open ? "mobile-nav-open" : ""}`} aria-label="Mobile navigation" hidden={!open}>
      {navigation.map((item) => <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined} onClick={() => setOpen(false)}>{item.label}</Link>)}
      <Link href="/contact/" className="mobile-contact" onClick={() => setOpen(false)}>Let&apos;s talk <span aria-hidden="true">↗</span></Link>
    </nav>
  </header>;
}
