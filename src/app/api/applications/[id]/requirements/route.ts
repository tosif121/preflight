import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/server";
import { applicationsRepository } from "@/lib/repositories/applications.repository";
import { familyMembersRepository } from "@/lib/repositories/family-members.repository";
import { servicesRepository } from "@/lib/repositories/services.repository";

interface DocumentRequirement {
  id: string;
  docType: string;
  label: string;
  description: string;
  scope: "family_member" | "earning_member" | "application";
  required: boolean;
  memberHint?: string;
  reason?: string;
}

const SERVICE_DOC_REQUIREMENTS: Record<string, (members: { id: string; fullName: string; isEarning: boolean }[]) => DocumentRequirement[]> = {
  // Income certificate - needs identity + income for all earning members
  income: (members) => [
    ...members.flatMap((m) => [
      {
        id: `identity-${m.id}`,
        docType: "identity_proof",
        label: `Identity Proof - ${m.fullName}`,
        description: `Aadhaar, PAN, or Voter ID for ${m.fullName.split(" ")[0]}`,
        scope: "family_member" as const,
        required: true,
        memberHint: m.id,
        reason: `Required to verify ${m.fullName}'s identity`,
      },
      ...(m.isEarning
        ? [{
            id: `income-${m.id}`,
            docType: "income_proof_salaried",
            label: `Income Proof - ${m.fullName}`,
            description: `Salary slip, ITR, or income certificate for ${m.fullName.split(" ")[0]}`,
            scope: "earning_member" as const,
            required: true,
            memberHint: m.id,
            reason: `${m.fullName} is marked as an earning member - we need to verify total family income`,
          }]
        : []),
    ]),
    {
      id: "address-proof",
      docType: "address_proof",
      label: "Address Proof",
      description: "Electricity bill, rent agreement, or utility bill",
      scope: "application",
      required: true,
      reason: "Required to verify residential address for the application",
    },
    {
      id: "photo",
      docType: "photo",
      label: "Passport Photo",
      description: "Recent passport-size photograph",
      scope: "application",
      required: true,
      reason: "Required for official records",
    },
  ],

  // Caste certificate
  caste: (members) => [
    ...members.map((m) => ({
      id: `identity-${m.id}`,
      docType: "identity_proof",
      label: `Identity Proof - ${m.fullName}`,
      description: `Aadhaar, PAN, or Voter ID for ${m.fullName.split(" ")[0]}`,
      scope: "family_member" as const,
      required: true,
      memberHint: m.id,
      reason: `Required to verify ${m.fullName}'s identity`,
    })),
    {
      id: "community-proof",
      docType: "community_proof",
      label: "Caste Evidence",
      description: "Community certificate, parent's caste certificate, or school records",
      scope: "application",
      required: true,
      reason: "Required to verify caste category for the certificate",
    },
    {
      id: "address-proof",
      docType: "address_proof",
      label: "Address Proof",
      description: "Electricity bill, rent agreement, or utility bill",
      scope: "application",
      required: true,
      reason: "Required to verify residential address",
    },
    {
      id: "photo",
      docType: "photo",
      label: "Passport Photo",
      description: "Recent passport-size photograph",
      scope: "application",
      required: true,
      reason: "Required for official records",
    },
  ],

  // Pension services
  "widow-pension": (members) => [
    ...members.map((m) => ({
      id: `identity-${m.id}`,
      docType: "identity_proof",
      label: `Identity Proof - ${m.fullName}`,
      description: `Aadhaar, PAN, or Voter ID for ${m.fullName.split(" ")[0]}`,
      scope: "family_member" as const,
      required: true,
      memberHint: m.id,
      reason: `Required to verify ${m.fullName}'s identity`,
    })),
    {
      id: "age-proof",
      docType: "age_proof",
      label: "Age Proof",
      description: "Birth certificate, school certificate, or Aadhaar with DOB",
      scope: "application",
      required: true,
      reason: "Required to verify age eligibility for pension",
    },
    {
      id: "income-proof",
      docType: "income_proof_salaried",
      label: "Income Proof",
      description: "Income certificate, salary slip, or BPL certificate",
      scope: "application",
      required: true,
      reason: "Required to verify income eligibility for pension",
    },
    {
      id: "death-certificate",
      docType: "death_certificate",
      label: "Death Certificate",
      description: "Death certificate of the deceased spouse",
      scope: "application",
      required: true,
      reason: "Required to verify widow status for pension eligibility",
    },
    {
      id: "bank-proof",
      docType: "bank_account_proof",
      label: "Bank Account Proof",
      description: "Bank passbook, cancelled cheque, or bank statement",
      scope: "application",
      required: true,
      reason: "Required for pension disbursement",
    },
    {
      id: "address-proof",
      docType: "address_proof",
      label: "Address Proof",
      description: "Electricity bill, rent agreement, or utility bill",
      scope: "application",
      required: true,
      reason: "Required to verify residential address",
    },
    {
      id: "photo",
      docType: "photo",
      label: "Passport Photo",
      description: "Recent passport-size photograph",
      scope: "application",
      required: true,
      reason: "Required for official records",
    },
  ],

  "old-age-pension": (members) => [
    ...members.map((m) => ({
      id: `identity-${m.id}`,
      docType: "identity_proof",
      label: `Identity Proof - ${m.fullName}`,
      description: `Aadhaar, PAN, or Voter ID for ${m.fullName.split(" ")[0]}`,
      scope: "family_member" as const,
      required: true,
      memberHint: m.id,
      reason: `Required to verify ${m.fullName}'s identity`,
    })),
    {
      id: "age-proof",
      docType: "age_proof",
      label: "Age Proof",
      description: "Birth certificate, school certificate, or Aadhaar with DOB",
      scope: "application",
      required: true,
      reason: "Required to verify age eligibility (60+ years)",
    },
    {
      id: "income-proof",
      docType: "income_proof_salaried",
      label: "Income Proof",
      description: "Income certificate or BPL certificate",
      scope: "application",
      required: true,
      reason: "Required to verify income eligibility for pension",
    },
    {
      id: "bank-proof",
      docType: "bank_account_proof",
      label: "Bank Account Proof",
      description: "Bank passbook, cancelled cheque, or bank statement",
      scope: "application",
      required: true,
      reason: "Required for pension disbursement",
    },
    {
      id: "address-proof",
      docType: "address_proof",
      label: "Address Proof",
      description: "Electricity bill, rent agreement, or utility bill",
      scope: "application",
      required: true,
      reason: "Required to verify residential address",
    },
    {
      id: "photo",
      docType: "photo",
      label: "Passport Photo",
      description: "Recent passport-size photograph",
      scope: "application",
      required: true,
      reason: "Required for official records",
    },
  ],

  "disability-pension": (members) => [
    ...members.map((m) => ({
      id: `identity-${m.id}`,
      docType: "identity_proof",
      label: `Identity Proof - ${m.fullName}`,
      description: `Aadhaar, PAN, or Voter ID for ${m.fullName.split(" ")[0]}`,
      scope: "family_member" as const,
      required: true,
      memberHint: m.id,
      reason: `Required to verify ${m.fullName}'s identity`,
    })),
    {
      id: "disability-proof",
      docType: "community_proof",
      label: "Disability Certificate",
      description: "UDID card or medical certificate from government hospital",
      scope: "application",
      required: true,
      reason: "Required to verify disability status",
    },
    {
      id: "income-proof",
      docType: "income_proof_salaried",
      label: "Income Proof",
      description: "Income certificate or BPL certificate",
      scope: "application",
      required: true,
      reason: "Required to verify income eligibility for pension",
    },
    {
      id: "bank-proof",
      docType: "bank_account_proof",
      label: "Bank Account Proof",
      description: "Bank passbook, cancelled cheque, or bank statement",
      scope: "application",
      required: true,
      reason: "Required for pension disbursement",
    },
    {
      id: "address-proof",
      docType: "address_proof",
      label: "Address Proof",
      description: "Electricity bill, rent agreement, or utility bill",
      scope: "application",
      required: true,
      reason: "Required to verify residential address",
    },
    {
      id: "photo",
      docType: "photo",
      label: "Passport Photo",
      description: "Recent passport-size photograph",
      scope: "application",
      required: true,
      reason: "Required for official records",
    },
  ],

  // Domicile certificate
  domicile: (members) => [
    ...members.map((m) => ({
      id: `identity-${m.id}`,
      docType: "identity_proof",
      label: `Identity Proof - ${m.fullName}`,
      description: `Aadhaar, PAN, or Voter ID for ${m.fullName.split(" ")[0]}`,
      scope: "family_member" as const,
      required: true,
      memberHint: m.id,
      reason: `Required to verify ${m.fullName}'s identity`,
    })),
    {
      id: "residence-proof",
      docType: "residence_proof",
      label: "Residence Proof",
      description: "Ration card, utility bills, or rent agreement showing 3+ years",
      scope: "application",
      required: true,
      reason: "Required to prove domicile/residence in the state",
    },
    {
      id: "address-proof",
      docType: "address_proof",
      label: "Address Proof",
      description: "Electricity bill, rent agreement, or utility bill",
      scope: "application",
      required: true,
      reason: "Required to verify current residential address",
    },
    {
      id: "photo",
      docType: "photo",
      label: "Passport Photo",
      description: "Recent passport-size photograph",
      scope: "application",
      required: true,
      reason: "Required for official records",
    },
  ],

  // Scholarship
  scholarship: (members) => [
    ...members.flatMap((m) => [
      {
        id: `identity-${m.id}`,
        docType: "identity_proof",
        label: `Identity Proof - ${m.fullName}`,
        description: `Aadhaar, PAN, or Voter ID for ${m.fullName.split(" ")[0]}`,
        scope: "family_member" as const,
        required: true,
        memberHint: m.id,
        reason: `Required to verify ${m.fullName}'s identity`,
      },
      ...(m.isEarning
        ? [{
            id: `income-${m.id}`,
            docType: "income_proof_salaried",
            label: `Income Proof - ${m.fullName}`,
            description: `Salary slip, ITR, or income certificate for ${m.fullName.split(" ")[0]}`,
            scope: "earning_member" as const,
            required: true,
            memberHint: m.id,
            reason: `${m.fullName} is marked as an earning member - family income affects scholarship eligibility`,
          }]
        : []),
    ]),
    {
      id: "address-proof",
      docType: "address_proof",
      label: "Address Proof",
      description: "Electricity bill, rent agreement, or utility bill",
      scope: "application",
      required: true,
      reason: "Required to verify residential address",
    },
    {
      id: "photo",
      docType: "photo",
      label: "Passport Photo",
      description: "Recent passport-size photograph",
      scope: "application",
      required: true,
      reason: "Required for official records",
    },
  ],

  // Default fallback for other services
  default: (members) => [
    ...members.map((m) => ({
      id: `identity-${m.id}`,
      docType: "identity_proof",
      label: `Identity Proof - ${m.fullName}`,
      description: `Aadhaar, PAN, or Voter ID for ${m.fullName.split(" ")[0]}`,
      scope: "family_member" as const,
      required: true,
      memberHint: m.id,
      reason: `Required to verify ${m.fullName}'s identity`,
    })),
    {
      id: "address-proof",
      docType: "address_proof",
      label: "Address Proof",
      description: "Electricity bill, rent agreement, or utility bill",
      scope: "application",
      required: true,
      reason: "Required to verify residential address",
    },
    {
      id: "photo",
      docType: "photo",
      label: "Passport Photo",
      description: "Recent passport-size photograph",
      scope: "application",
      required: true,
      reason: "Required for official records",
    },
  ],
};

function getRequirementsForService(
  serviceSlug: string,
  members: { id: string; fullName: string; isEarning: boolean }[]
): DocumentRequirement[] {
  // Try exact match first
  if (SERVICE_DOC_REQUIREMENTS[serviceSlug]) {
    return SERVICE_DOC_REQUIREMENTS[serviceSlug](members);
  }

  // Try partial match (e.g., "rj-income" matches "income")
  for (const [key, fn] of Object.entries(SERVICE_DOC_REQUIREMENTS)) {
    if (serviceSlug.includes(key)) {
      return fn(members);
    }
  }

  // Fallback to default
  return SERVICE_DOC_REQUIREMENTS.default(members);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const application = await applicationsRepository.findById(id);
  if (!application) {
    return Response.json({ error: "Application not found" }, { status: 404 });
  }

  const service = await servicesRepository.findById(application.serviceId);
  if (!service) {
    return Response.json({ error: "Service not found" }, { status: 404 });
  }

  const members = await familyMembersRepository.listByApplication(id);

  // Extract service slug (e.g., "rj-income" -> "income")
  const serviceSlug = service.id.replace(/^[a-z]{2}-/, "");

  const requirements = getRequirementsForService(serviceSlug, members);

  return Response.json({
    serviceId: service.id,
    serviceName: service.name,
    serviceCategory: service.category,
    verificationLevel: "simplified",
    requirements,
    summary: {
      total: requirements.length,
      required: requirements.filter((r) => r.required).length,
      memberDocs: requirements.filter((r) => r.scope === "family_member" || r.scope === "earning_member").length,
      generalDocs: requirements.filter((r) => r.scope === "application").length,
    },
  });
}
