import "server-only";
import nodemailer from "nodemailer";
import type { Enquiry } from "@/features/leads/validation";
import type { ContactInput } from "@/features/contacts/validation";

function smtpTransport(host: string, portValue: string, user: string, password: string) {
  const port = Number(portValue);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid SMTP port.");
  return nodemailer.createTransport({
    host, port, secure: port === 465, requireTLS: port !== 465,
    auth: { user, pass: password },
    connectionTimeout: 5000, greetingTimeout: 5000, socketTimeout: 10000,
  });
}

export async function notifyLead(id: string, enquiry: Enquiry) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, MAIL_FROM, LEAD_NOTIFICATION_TO } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD || !MAIL_FROM || !LEAD_NOTIFICATION_TO) return;
  const transport = smtpTransport(SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD);
  await transport.sendMail({
    from: MAIL_FROM,
    to: LEAD_NOTIFICATION_TO,
    subject: "New website development enquiry",
    text: `Lead ID: ${id}\nName: ${enquiry.name}\nPhone: ${enquiry.phone}\nEmail: ${enquiry.email ?? ""}\nService: ${enquiry.serviceInterest}\nBudget: ${enquiry.budgetRange}\nSource: ${enquiry.landingPageUrl}\nMessage:\n${enquiry.message}`,
  });
}

export async function notifyContact(id: string, contact: ContactInput) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, MAIL_FROM, CONTACT_NOTIFICATION_TO } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD || !MAIL_FROM || !CONTACT_NOTIFICATION_TO) {
    if (process.env.NODE_ENV === "development") console.info("Contact SMTP notification skipped: SMTP is unconfigured.");
    return;
  }
  const transport = smtpTransport(SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD);
  await transport.sendMail({
    from: MAIL_FROM, to: CONTACT_NOTIFICATION_TO,
    subject: "New contact message",
    text: `Contact ID: ${id}\nName: ${contact.name}\nEmail: ${contact.email}\nPhone: ${contact.phone}\nSubject: ${contact.subject}\nSource: ${contact.sourcePage}\nMessage:\n${contact.message}`,
  });
}
