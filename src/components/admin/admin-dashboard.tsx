import Link from "next/link";
import { AdminIcon } from "@/components/admin/admin-shell";
import { serviceNavigation } from "@/config/navigation";
import { isNewManagedService, servicePath } from "@/features/services/validation";
import { serviceCmsEnabled } from "@/features/services/config";
import { prisma } from "@/lib/prisma";

const dateFormat = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });

function countOf(result: PromiseSettledResult<number>) {
  return result.status === "fulfilled" ? result.value.toLocaleString("en-IN") : "—";
}

export async function AdminDashboard() {
  const [leadCount, contactCount, blogCount, publishedCount, ticketCount, recentLeads, recentContacts, managedServices] = await Promise.allSettled([
    prisma.lead.count(),
    prisma.contactMessage.count(),
    prisma.blogPost.count(),
    prisma.blogPost.count({ where: { status: "PUBLISHED", publishedAt: { lte: new Date() } } }),
    prisma.supportTicket.count({ where: { status: { in: ["OPEN", "IN_PROGRESS", "WAITING_ON_CLIENT"] } } }),
    prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 4, select: { id: true, name: true, serviceInterest: true, status: true, createdAt: true } }),
    prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 4, select: { id: true, name: true, subject: true, status: true, createdAt: true } }),
    serviceCmsEnabled() ? prisma.service.findMany({ where: { status: "PUBLISHED", publishedAt: { lte: new Date() } }, select: { slug: true, title: true }, orderBy: { createdAt: "asc" } }) : Promise.resolve([] as { slug: string; title: string }[]),
  ]);
  const liveServices = managedServices.status === "fulfilled" ? managedServices.value : [];
  const serviceNames = new Map(liveServices.map((service) => [service.slug, service.title]));
  const serviceLinks = [
    ...serviceNavigation.map((service) => ({ ...service, label: serviceNames.get(service.href.slice(1, -1)) || service.label })),
    ...liveServices.filter((service) => isNewManagedService(service.slug)).map((service) => ({ label: service.title, href: servicePath(service.slug) })),
  ];
  const metrics = [
    { label: "Services", value: serviceLinks.length.toLocaleString("en-IN"), detail: "Public service pages", href: "/admin/services/", icon: "services" as const, tone: "yellow" },
    { label: "Enquiries", value: countOf(leadCount), detail: "All sales leads", href: "/admin/leads/", icon: "leads" as const, tone: "white" },
    { label: "Contact", value: countOf(contactCount), detail: "General messages", href: "/admin/contacts/", icon: "contact" as const, tone: "white" },
    { label: "Blog posts", value: countOf(blogCount), detail: publishedCount.status === "fulfilled" ? `${publishedCount.value} published` : "Published count unavailable", href: "/admin/blogs/", icon: "blog" as const, tone: "dark" },
  ];

  return <main className="admin-dashboard">
    <div className="admin-page-heading"><div><p className="admin-eyebrow">OVERVIEW / THE WEBLISH</p><h1>Good to have you <em>here.</em></h1><p>Keep track of enquiries, conversations, and content in one place.</p></div><Link href="/admin/blogs/new/" className="admin-primary-link">Create blog post <span aria-hidden="true">↗</span></Link></div>
    <section aria-labelledby="dashboard-overview-title"><div className="admin-section-heading"><div><p className="admin-eyebrow">THE NUMBERS</p><h2 id="dashboard-overview-title">Workspace overview</h2></div><span>Live database totals</span></div><div className="admin-metric-grid">{metrics.map((metric, index) => <Link href={metric.href} className={`admin-metric admin-metric-${metric.tone}`} key={metric.label}><div className="admin-metric-top"><span className="admin-metric-icon"><AdminIcon name={metric.icon} size={22} /></span><span className="admin-metric-index">0{index + 1}</span></div><div><strong>{metric.value}</strong><h3>{metric.label}</h3><p>{metric.detail}</p></div><span className="admin-metric-arrow" aria-hidden="true">↗</span></Link>)}</div></section>
    <div className="admin-dashboard-grid">
      <section className="admin-panel" aria-labelledby="dashboard-inbox-title"><div className="admin-panel-head"><div><p className="admin-eyebrow">INBOX / LATEST</p><h2 id="dashboard-inbox-title">New conversations</h2></div><Link href="/admin/leads/">All enquiries ↗</Link></div>
        {recentLeads.status === "fulfilled" && recentLeads.value.length ? <div className="admin-activity-list">{recentLeads.value.map((lead) => <Link className="admin-activity-row" href={`/admin/leads/${lead.id}/`} key={lead.id}><span className="admin-activity-avatar">{lead.name.charAt(0).toUpperCase()}</span><span className="admin-activity-copy"><strong>{lead.name}</strong><small>{lead.serviceInterest || "Website enquiry"}</small></span><span className="admin-activity-meta"><span>{lead.status.toLowerCase()}</span><small>{dateFormat.format(lead.createdAt)}</small></span></Link>)}</div> : <p className="admin-empty">{recentLeads.status === "rejected" ? "Enquiries are temporarily unavailable." : "No enquiries yet."}</p>}
      </section>
      <section className="admin-panel" aria-labelledby="dashboard-contact-title"><div className="admin-panel-head"><div><p className="admin-eyebrow">CONTACT / LATEST</p><h2 id="dashboard-contact-title">Recent messages</h2></div><Link href="/admin/contacts/">Open inbox ↗</Link></div>
        {recentContacts.status === "fulfilled" && recentContacts.value.length ? <div className="admin-activity-list">{recentContacts.value.map((contact) => <Link className="admin-activity-row" href={`/admin/contacts/${contact.id}/`} key={contact.id}><span className="admin-activity-avatar admin-activity-avatar-light">{contact.name.charAt(0).toUpperCase()}</span><span className="admin-activity-copy"><strong>{contact.name}</strong><small>{contact.subject || "General message"}</small></span><span className="admin-activity-meta"><span>{contact.status.toLowerCase()}</span><small>{dateFormat.format(contact.createdAt)}</small></span></Link>)}</div> : <p className="admin-empty">{recentContacts.status === "rejected" ? "Contact messages are temporarily unavailable." : "No contact messages yet."}</p>}
      </section>
    </div>
    <section className="admin-services-panel" aria-labelledby="dashboard-services-title"><div className="admin-panel-head"><div><p className="admin-eyebrow">WHAT WE OFFER</p><h2 id="dashboard-services-title">Services directory</h2></div><Link href="/admin/services/">Open directory ↗</Link></div><div className="admin-service-list">{serviceLinks.map((service, index) => <Link href={service.href} target="_blank" rel="noopener noreferrer" key={service.href}><span>{String(index + 1).padStart(2, "0")}</span><strong>{service.label}</strong><AdminIcon name="external" size={17} /></Link>)}</div></section>
    <div className="admin-dashboard-note"><span className="admin-status-dot" /><span>{ticketCount.status === "fulfilled" ? `${ticketCount.value} support tickets currently need attention.` : "Support ticket total is unavailable."}</span><Link href="/admin/tickets/">Review tickets ↗</Link></div>
  </main>;
}
