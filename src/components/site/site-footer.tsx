import Link from "next/link";
import { primaryNavigation, serviceNavigation } from "@/config/navigation";
import { getPublishedServiceCards, isNewManagedService } from "@/features/services/public";
import { servicePath } from "@/features/services/validation";

export async function SiteFooter() {
  const managed = await getPublishedServiceCards();
  const overrides = new Map(managed.map((service) => [service.slug, service]));
  const footerServices = [
    ...serviceNavigation.filter((service) => service.href !== "/website-development/").map((service) => ({ ...service, label: overrides.get(service.href.slice(1, -1))?.title || service.label })),
    ...managed.filter((service) => isNewManagedService(service.slug)).map((service) => ({ label: service.title, href: servicePath(service.slug) })),
  ];
  return <footer className="site-footer">
    <div className="footer-parallax-art" aria-hidden="true"><span className="footer-art-grid" /><span className="footer-art-orbit" /><span className="footer-art-glow" /><span className="footer-art-type">The Weblish</span></div>
    <div className="site-container">
    <div className="footer-top"><div><p className="eyebrow eyebrow-on-dark">The Weblish</p><h2>Let&apos;s make your next<br />digital move count.</h2><Link href="/contact/" className="button button-yellow">Start a conversation <span aria-hidden="true">↗</span></Link></div><p className="footer-intro">Websites, design, and digital marketing conversations start here. Tell us what you need, and we&apos;ll discuss the right next step.</p></div>
    <div className="footer-grid"><div><h3>Explore</h3>{primaryNavigation.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}</div><div><h3>Services</h3>{footerServices.slice(0, 5).map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}</div><div><h3>More services</h3>{footerServices.slice(5).map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}</div><div><h3>Get in touch</h3><Link href="/contact/">Contact The Weblish</Link><Link href="/support/">Raise a ticket</Link><Link href="/customer-satisfaction/">Customer satisfaction</Link></div></div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} Weblish Technologies Pvt. Ltd.</span><span>Designer of your success</span></div>
    </div>
  </footer>;
}
