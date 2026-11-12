import Link from "next/link";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { storageConfig } from "@/features/media/storage";
import { serviceCmsEnabled } from "@/features/services/config";
import { ChangePasswordForm } from "@/components/admin/change-password-form";

export const dynamic = "force-dynamic";

type Check = { title: string; status: "Connected" | "Configured" | "Needs setup" | "Unavailable" | "Verify"; detail: string; href?: string };

function safeOrigin(value: string | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.username || url.password || url.pathname !== "/" || url.search || url.hash || !["http:", "https:"].includes(url.protocol) ? null : url.origin;
  } catch { return null; }
}

export default async function SettingsPage() {
  const session = await requireAdmin();
  let databaseConnected = false;
  let counts: [number | null, number | null, number | null] = [null, null, null];
  try {
    await prisma.$queryRaw`SELECT 1`;
    databaseConnected = true;
    const results = await Promise.allSettled([
      prisma.blogPost.count({ where: { status: "PUBLISHED", publishedAt: { lte: new Date() } } }),
      prisma.portfolioProject.count({ where: { status: "PUBLISHED", approvedAt: { not: null }, publishedAt: { lte: new Date() } } }),
      serviceCmsEnabled() ? prisma.service.count({ where: { status: "PUBLISHED", publishedAt: { lte: new Date() } } }) : Promise.resolve(0),
    ]);
    counts = results.map((result) => result.status === "fulfilled" ? result.value : null) as typeof counts;
  } catch {
    // Show an unavailable state without exposing database connection details.
  }

  const siteOrigin = safeOrigin(process.env.NEXT_PUBLIC_SITE_URL);
  const authOrigin = safeOrigin(process.env.BETTER_AUTH_URL);
  const local = Boolean(siteOrigin && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(siteOrigin));
  const originsConfigured = Boolean(siteOrigin && authOrigin && siteOrigin === authOrigin && (local || siteOrigin.startsWith("https://")));
  const secretsPresent = Boolean(process.env.BETTER_AUTH_SECRET && process.env.BETTER_AUTH_SECRET.length >= 32 && !process.env.BETTER_AUTH_SECRET.startsWith("replace-with") && process.env.ENQUIRY_HASH_SECRET && process.env.ENQUIRY_HASH_SECRET.length >= 32 && !process.env.ENQUIRY_HASH_SECRET.startsWith("replace-with"));
  const smtpPort = Number(process.env.SMTP_PORT);
  const smtpCommon = Boolean(process.env.SMTP_HOST && Number.isInteger(smtpPort) && smtpPort > 0 && smtpPort <= 65535 && process.env.SMTP_USER && process.env.SMTP_PASSWORD && process.env.MAIL_FROM);
  const mailConfigured = smtpCommon && Boolean(process.env.LEAD_NOTIFICATION_TO && process.env.CONTACT_NOTIFICATION_TO);
  const mediaConfigured = Boolean(storageConfig());
  const serviceEnabled = serviceCmsEnabled();
  const stagingNoindex = process.env.STAGING_NOINDEX === "true";
  const checks: Check[] = [
    { title: "Database", status: databaseConnected ? "Connected" : "Unavailable", detail: databaseConnected ? "Application queries respond. Restricted credentials and restore still need separate verification." : "Database queries failed. Check the service and server logs." },
    { title: "Site and sign-in URLs", status: originsConfigured ? "Configured" : "Needs setup", detail: originsConfigured ? `${local ? "Local" : "HTTPS"} origins match. Confirm the intended domain before release.` : "Set matching public and authentication origins; shared environments require HTTPS." },
    { title: "Authentication secrets", status: secretsPresent ? "Configured" : "Needs setup", detail: secretsPresent ? "Required secrets are present. Values are never displayed here." : "Set separate strong secrets in the host secret manager." },
    { title: "Object storage", status: mediaConfigured ? "Configured" : "Needs setup", detail: mediaConfigured ? "Settings are present. Test an upload and public image read in this environment." : "Configure server-side object storage before uploads.", href: "/admin/media/" },
    { title: "Email notifications", status: mailConfigured ? "Configured" : "Needs setup", detail: mailConfigured ? "SMTP and both recipients are set. Actual inbox delivery remains unverified." : "SMTP or a lead/contact recipient is missing. Forms still save to the database." },
    { title: "Service editor", status: serviceEnabled ? "Configured" : "Needs setup", detail: serviceEnabled ? "Enabled here. Publish only reviewed service content." : "Disabled until its migration and database are verified.", href: "/admin/services/" },
    { title: "Staging noindex", status: stagingNoindex ? "Configured" : "Verify", detail: stagingNoindex ? "Switch is on. Verify the response header and host access control." : "Off here. Enable it on staging; leave it off in production only after launch approval." },
  ];
  const publicCounts = [
    { title: "Published blog posts", value: counts[0], href: "/admin/blogs/" },
    { title: "Published case studies", value: counts[1], href: "/admin/portfolio/" },
    { title: "Published managed services", value: counts[2], href: "/admin/services/" },
  ];
  return <main className="admin-settings-page">
    <div className="admin-settings-hero"><div><p className="admin-eyebrow">WORKSPACE / SETTINGS</p><h1>Settings &amp; <em>operations.</em></h1><p>Check your services and account security, then review the release tasks below.</p></div><span>Current environment</span></div>
    <section className="admin-settings-section" aria-labelledby="settings-checks"><div className="admin-settings-section-head"><div><p className="admin-eyebrow">01 / LIVE SIGNALS</p><h2 id="settings-checks">Environment checks</h2></div></div><div className="admin-settings-check-grid">{checks.map((check) => <article className="admin-settings-check" key={check.title}><div><h3>{check.title}</h3><span className={`admin-settings-status is-${check.status.toLowerCase().replace(" ", "-")}`}>{check.status}</span></div><p>{check.detail}</p>{check.href && <Link href={check.href}>Open workspace <span aria-hidden="true">↗</span></Link>}</article>)}</div></section>
    <div className="admin-settings-columns"><section className="admin-settings-section admin-settings-surface" aria-labelledby="settings-publication"><div className="admin-settings-section-head"><div><p className="admin-eyebrow">02 / CONTENT</p><h2 id="settings-publication">Publication signals</h2></div></div><div className="admin-settings-content-list">{publicCounts.map((item) => <Link key={item.title} href={item.href}><span>{item.title}</span><strong>{item.value ?? "—"}</strong></Link>)}</div><p className="admin-settings-footnote">Published does not mean source material and permissions were reviewed.</p></section>
      <section className="admin-settings-section admin-settings-surface" aria-labelledby="settings-account"><div className="admin-settings-section-head"><div><p className="admin-eyebrow">03 / SECURITY</p><h2 id="settings-account">Your sign-in</h2></div></div><p className="admin-settings-account">Signed in as <strong>{session.user.email}</strong></p><ChangePasswordForm /></section></div>
    <section className="admin-settings-section admin-settings-surface" aria-labelledby="settings-release"><div className="admin-settings-section-head"><div><p className="admin-eyebrow">04 / RELEASE GATES</p><h2 id="settings-release">Verify outside this page</h2></div></div><ul className="admin-settings-release-list"><li><strong>Content and routes</strong><span>Approve article sources, project claims, canonical URLs, redirects, and sitemap entries.</span></li><li><strong>Database and recovery</strong><span>Use restricted credentials; restore a backup in staging and rehearse rollback.</span></li><li><strong>External services</strong><span>Test public images and email arrival; confirm form records persist when email fails.</span></li><li><strong>Operations</strong><span>Verify staging noindex, uptime alerts, logs, and scheduled rate-limit cleanup.</span></li></ul></section>
  </main>;
}
