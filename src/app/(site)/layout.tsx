import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { ScrollEffects } from "@/components/site/scroll-effects";
import "lenis/dist/lenis.css";

export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <><a className="skip-link" href="#main-content">Skip to content</a><ScrollEffects /><SiteHeader /><div id="main-content">{children}</div><SiteFooter /></>;
}
