import type { Enquiry } from "@/features/leads/validation";

type SavedLead = { id: string };

export interface EnquiryRepository {
  upsertByPhone(input: Enquiry): Promise<SavedLead>;
  appendSubmission(leadId: string, input: Enquiry): Promise<void>;
}

export async function persistEnquiry(
  input: Enquiry,
  transaction: (work: (repository: EnquiryRepository) => Promise<string>) => Promise<string>,
) {
  return transaction(async (repository) => {
    const lead = await repository.upsertByPhone(input);
    await repository.appendSubmission(lead.id, input);
    return lead.id;
  });
}
