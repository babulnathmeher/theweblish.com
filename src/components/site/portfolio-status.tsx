import Link from "next/link";

export function PortfolioStatus({ website = false }: { website?: boolean }) {
  return <div className="statement-panel"><p className="eyebrow">Selected work</p><h3>Real projects deserve the full story.</h3><p>{website ? "Website examples will appear here when the original project details and permissions are available." : "We are preparing verified project names, visuals, and context before sharing them publicly."}</p><Link href="/contact/" className="arrow-link">Ask about relevant work <span aria-hidden="true">↗</span></Link></div>;
}
