import type { Enquiry } from "@/features/leads/validation";
import { persistEnquiry } from "@/features/leads/persistence";
import { prisma } from "@/lib/prisma";

export async function saveEnquiry(input: Enquiry) {
  return persistEnquiry(input, (work) => prisma.$transaction(async (tx) => work({
    async upsertByPhone(value) {
      return tx.lead.upsert({
        where: { phone: value.phone },
        create: {
          name: value.name,
          phone: value.phone,
          email: value.email,
          serviceInterest: value.serviceInterest,
          budgetRange: value.budgetRange,
          message: value.message,
          consentAt: new Date(),
          sourcePage: value.landingPageUrl,
          utmSource: value.utmSource,
          utmMedium: value.utmMedium,
          utmCampaign: value.utmCampaign,
          utmTerm: value.utmTerm,
          utmContent: value.utmContent,
        },
        update: {
          name: value.name,
          email: value.email,
          serviceInterest: value.serviceInterest,
          budgetRange: value.budgetRange,
          message: value.message,
          consentAt: new Date(),
          sourcePage: value.landingPageUrl,
          utmSource: value.utmSource,
          utmMedium: value.utmMedium,
          utmCampaign: value.utmCampaign,
          utmTerm: value.utmTerm,
          utmContent: value.utmContent,
        },
        select: { id: true },
      });
    },
    async appendSubmission(leadId, value) {
      await tx.leadActivity.create({
        data: {
          leadId,
          type: "SUBMISSION",
          submission: {
            name: value.name, phone: value.phone, email: value.email,
            serviceInterest: value.serviceInterest, budgetRange: value.budgetRange,
            message: value.message, consent: value.consent,
            landingPageUrl: value.landingPageUrl,
            utmSource: value.utmSource, utmMedium: value.utmMedium,
            utmCampaign: value.utmCampaign, utmTerm: value.utmTerm,
            utmContent: value.utmContent,
          },
        },
      });
    },
  })));
}
