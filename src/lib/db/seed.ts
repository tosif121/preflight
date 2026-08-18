import { db } from "@/lib/db";
import {
  states,
  services,
  rulePacks,
  operators,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const SEED_STATES = [
  { id: "rajasthan", name: "Rajasthan", code: "RJ", portalName: "eMitra", portalUrl: "https://emitra.rajasthan.gov.in", status: "active" as const },
  { id: "uttar_pradesh", name: "Uttar Pradesh", code: "UP", portalName: "e-District", portalUrl: "https://edistrict.up.gov.in", status: "active" as const },
  { id: "karnataka", name: "Karnataka", code: "KA", portalName: "Seva Sindhu", portalUrl: "https://sevasindhu.karnataka.gov.in", status: "active" as const },
];

const SEED_SERVICES = [
  // Rajasthan
  { id: "rj-family-income", stateId: "rajasthan", name: "Family Income Certificate", slug: "family-income", category: "certificate" as const, description: "Verify income for family welfare schemes, scholarships, and subsidies", status: "live" as const },
  { id: "rj-caste", stateId: "rajasthan", name: "Caste Certificate", slug: "caste", category: "certificate" as const, description: "SC/ST/OBC caste verification for reservation benefits", status: "beta" as const },
  { id: "rj-domicile", stateId: "rajasthan", name: "Mool Niwas (Domicile)", slug: "domicile", category: "certificate" as const, description: "Proof of residence in Rajasthan for state schemes", status: "beta" as const },
  { id: "rj-birth", stateId: "rajasthan", name: "Birth Certificate", slug: "birth", category: "certificate" as const, description: "Official birth registration and certificate", status: "coming_soon" as const },
  { id: "rj-death", stateId: "rajasthan", name: "Death Certificate", slug: "death", category: "certificate" as const, description: "Official death registration and certificate", status: "coming_soon" as const },
  { id: "rj-widow-pension", stateId: "rajasthan", name: "Widow Pension", slug: "widow-pension", category: "pension" as const, description: "Monthly pension eligibility for widows under state welfare", status: "beta" as const },
  { id: "rj-old-age-pension", stateId: "rajasthan", name: "Old Age Pension", slug: "old-age-pension", category: "pension" as const, description: "Monthly pension for senior citizens below income threshold", status: "beta" as const },
  // Uttar Pradesh
  { id: "up-income", stateId: "uttar_pradesh", name: "Income Certificate", slug: "income", category: "certificate" as const, description: "Income verification for scholarships, fee waivers, and subsidies", status: "beta" as const },
  { id: "up-caste", stateId: "uttar_pradesh", name: "Caste Certificate", slug: "caste", category: "certificate" as const, description: "SC/ST/OBC caste verification for reservation benefits", status: "beta" as const },
  { id: "up-domicile", stateId: "uttar_pradesh", name: "Domicile Certificate", slug: "domicile", category: "certificate" as const, description: "Proof of residence in Uttar Pradesh for state schemes", status: "beta" as const },
  { id: "up-birth", stateId: "uttar_pradesh", name: "Birth Certificate", slug: "birth", category: "certificate" as const, description: "Official birth registration and certificate", status: "coming_soon" as const },
  { id: "up-death", stateId: "uttar_pradesh", name: "Death Certificate", slug: "death", category: "certificate" as const, description: "Official death registration and certificate", status: "coming_soon" as const },
  // Karnataka
  { id: "ka-income", stateId: "karnataka", name: "Income Certificate", slug: "income", category: "certificate" as const, description: "Income verification for social welfare and education schemes", status: "beta" as const },
  { id: "ka-caste", stateId: "karnataka", name: "Caste Certificate", slug: "caste", category: "certificate" as const, description: "Caste verification for reservation and welfare benefits", status: "beta" as const },
  { id: "ka-residence", stateId: "karnataka", name: "Residence Certificate", slug: "residence", category: "certificate" as const, description: "Proof of residence in Karnataka for state schemes", status: "beta" as const },
  { id: "ka-birth", stateId: "karnataka", name: "Birth Certificate", slug: "birth", category: "certificate" as const, description: "Official birth registration and certificate", status: "coming_soon" as const },
  { id: "ka-death", stateId: "karnataka", name: "Death Certificate", slug: "death", category: "certificate" as const, description: "Official death registration and certificate", status: "coming_soon" as const },
];

function makeRjIncomeRules() {
  return {
    id: "rj-family-income",
    name: "Rajasthan Family Income Certificate",
    prerequisites: ["Jan Aadhaar family record must be available", "All earning family members must have income proof"],
    required_documents: [
      { doc_type: "identity_proof", scope: "per_member", description: "Aadhaar or equivalent identity proof for each family member" },
      { doc_type: "address_proof", scope: "per_application", description: "Address proof (utility bill, rent agreement, or address on Aadhaar)" },
      { doc_type: "income_proof_salaried", scope: "per_earning_member", description: "Salary slip, Form 16, or employer letter for salaried earning members" },
      { doc_type: "income_proof_nonsalaried", scope: "per_earning_member", description: "ITR, bank statement, or self-declaration for non-salaried earning members" },
      { doc_type: "photo", scope: "per_application", description: "Passport-size photo of the primary applicant" },
    ],
    cross_checks: [
      { id: "name_consistency", severity: "blocker", description: "Name on identity proof must match name on income proof and application", check_type: "consistency" },
      { id: "address_consistency", severity: "warning", description: "Address on identity proof should match address proof", check_type: "consistency" },
      { id: "income_coverage", severity: "blocker", description: "Every earning family member must have at least one income proof document", check_type: "completeness" },
      { id: "certificate_use_by_date", severity: "blocker", description: "Intended use deadline must fall within 12 months from today", check_type: "validity" },
      { id: "document_quality", severity: "warning", description: "Document OCR confidence should be above 0.75 for reliable extraction", check_type: "quality" },
    ],
  };
}

function makeGenericIncomeRules(stateId: string, name: string) {
  return {
    id: `${stateId}-income`,
    name,
    prerequisites: ["Applicant must be a resident of the state", "Income proof required for all earning members"],
    required_documents: [
      { doc_type: "identity_proof", scope: "per_member", description: "Aadhaar or equivalent identity proof" },
      { doc_type: "address_proof", scope: "per_application", description: "Address proof for state residence" },
      { doc_type: "income_proof_salaried", scope: "per_earning_member", description: "Salary slip, Form 16, or employer letter" },
      { doc_type: "income_proof_nonsalaried", scope: "per_earning_member", description: "ITR, bank statement, or self-declaration" },
      { doc_type: "photo", scope: "per_application", description: "Passport-size photo of the primary applicant" },
    ],
    cross_checks: [
      { id: "name_consistency", severity: "blocker", description: "Name must match across identity and income proof", check_type: "consistency" },
      { id: "address_consistency", severity: "warning", description: "Address should match across documents", check_type: "consistency" },
      { id: "income_coverage", severity: "blocker", description: "Every earning member must have income proof", check_type: "completeness" },
      { id: "certificate_use_by_date", severity: "blocker", description: "Use deadline within 12 months", check_type: "validity" },
      { id: "document_quality", severity: "warning", description: "OCR confidence above 0.75", check_type: "quality" },
    ],
  };
}

function makeCasteRules(stateId: string) {
  return {
    id: `${stateId}-caste`,
    name: "Caste Certificate",
    prerequisites: ["Applicant must belong to SC/ST/OBC category", "Community reference required"],
    required_documents: [
      { doc_type: "identity_proof", scope: "per_member", description: "Aadhaar or equivalent identity proof" },
      { doc_type: "address_proof", scope: "per_application", description: "Address proof" },
      { doc_type: "prior_caste_certificate", scope: "per_application", description: "Parent's or relative's prior caste certificate or community reference" },
      { doc_type: "photo", scope: "per_application", description: "Passport-size photo" },
    ],
    cross_checks: [
      { id: "name_consistency", severity: "blocker", description: "Name must match across identity and caste proof", check_type: "consistency" },
      { id: "lineage_reference_present", severity: "blocker", description: "A prior family caste reference document is required", check_type: "completeness" },
      { id: "document_quality", severity: "warning", description: "OCR confidence above 0.75", check_type: "quality" },
    ],
  };
}

function makeDomicileRules(stateId: string) {
  return {
    id: `${stateId}-domicile`,
    name: "Domicile / Residence Certificate",
    prerequisites: ["Applicant must have resided in the state for required duration", "Residence proof required"],
    required_documents: [
      { doc_type: "identity_proof", scope: "per_member", description: "Aadhaar or equivalent identity proof" },
      { doc_type: "address_proof", scope: "per_application", description: "Utility bill, rent agreement, or address on Aadhaar" },
      { doc_type: "residence_proof", scope: "per_application", description: "Proof of residence for required duration" },
      { doc_type: "photo", scope: "per_application", description: "Passport-size photo" },
    ],
    cross_checks: [
      { id: "name_consistency", severity: "blocker", description: "Name must match across identity and residence proof", check_type: "consistency" },
      { id: "address_consistency", severity: "blocker", description: "Address must be consistent — duration of residence is the core requirement", check_type: "consistency" },
      { id: "document_quality", severity: "warning", description: "OCR confidence above 0.75", check_type: "quality" },
    ],
  };
}

function makeWidowPensionRules(stateId: string) {
  return {
    id: `${stateId}-widow-pension`,
    name: "Widow Pension",
    prerequisites: ["Applicant must be a widow", "Income below state threshold", "Age 18-59 (placeholder — verify with state rules)"],
    required_documents: [
      { doc_type: "identity_proof", scope: "per_member", description: "Aadhaar or equivalent identity proof" },
      { doc_type: "address_proof", scope: "per_application", description: "Address proof" },
      { doc_type: "death_certificate", scope: "per_application", description: "Death certificate of spouse" },
      { doc_type: "income_proof_nonsalaried", scope: "per_application", description: "Income declaration or bank statement" },
      { doc_type: "bank_account_proof", scope: "per_application", description: "Bank passbook or cancelled cheque for pension disbursement" },
      { doc_type: "age_proof", scope: "per_application", description: "Age proof (Aadhaar DOB, birth certificate, or school leaving certificate)" },
    ],
    cross_checks: [
      { id: "name_consistency", severity: "blocker", description: "Applicant name must match across identity + death certificate as spouse", check_type: "consistency" },
      { id: "age_eligibility", severity: "blocker", description: "Flag if age falls outside 18-59 band (placeholder — real threshold varies by state)", check_type: "eligibility" },
      { id: "income_ceiling", severity: "warning", description: "Flag if income suggests above threshold (placeholder — verify real limit)", check_type: "eligibility" },
      { id: "bank_account_proof_present", severity: "blocker", description: "Pension cannot disburse without bank account proof", check_type: "completeness" },
      { id: "document_quality", severity: "warning", description: "OCR confidence above 0.75", check_type: "quality" },
    ],
  };
}

function makeOldAgePensionRules(stateId: string) {
  return {
    id: `${stateId}-old-age-pension`,
    name: "Old Age Pension",
    prerequisites: ["Applicant must be 60+ years", "Income below state threshold"],
    required_documents: [
      { doc_type: "identity_proof", scope: "per_member", description: "Aadhaar or equivalent identity proof" },
      { doc_type: "address_proof", scope: "per_application", description: "Address proof" },
      { doc_type: "age_proof", scope: "per_application", description: "Age proof (Aadhaar DOB, birth certificate)" },
      { doc_type: "income_proof_nonsalaried", scope: "per_application", description: "Income declaration or bank statement" },
      { doc_type: "bank_account_proof", scope: "per_application", description: "Bank passbook or cancelled cheque" },
    ],
    cross_checks: [
      { id: "age_eligibility", severity: "blocker", description: "Applicant must be 60+ (placeholder — verify real threshold)", check_type: "eligibility" },
      { id: "income_ceiling", severity: "warning", description: "Flag if income suggests above threshold (placeholder)", check_type: "eligibility" },
      { id: "bank_account_proof_present", severity: "blocker", description: "Pension cannot disburse without bank account proof", check_type: "completeness" },
      { id: "document_quality", severity: "warning", description: "OCR confidence above 0.75", check_type: "quality" },
    ],
  };
}

const SEED_PACKS: Array<{ serviceId: string; rules: unknown; verificationLevel: "verified" | "simplified"; sourceMetadata: unknown }> = [
  { serviceId: "rj-family-income", rules: makeRjIncomeRules(), verificationLevel: "verified", sourceMetadata: { researched: true, note: "Verified against eMitra portal documentation and common rejection patterns" } },
  { serviceId: "rj-caste", rules: makeCasteRules("rj"), verificationLevel: "simplified", sourceMetadata: { researched: false, note: "Placeholder — simplified shape for demo. Verify against Rajasthan caste certificate rules before production." } },
  { serviceId: "rj-domicile", rules: makeDomicileRules("rj"), verificationLevel: "simplified", sourceMetadata: { researched: false, note: "Placeholder — simplified shape for demo." } },
  { serviceId: "rj-widow-pension", rules: makeWidowPensionRules("rj"), verificationLevel: "simplified", sourceMetadata: { researched: false, note: "Placeholder. Age/income bands are explicitly unverified placeholders." } },
  { serviceId: "rj-old-age-pension", rules: makeOldAgePensionRules("rj"), verificationLevel: "simplified", sourceMetadata: { researched: false, note: "Placeholder. Age/income thresholds are unverified." } },
  { serviceId: "up-income", rules: makeGenericIncomeRules("up", "Uttar Pradesh Income Certificate"), verificationLevel: "simplified", sourceMetadata: { researched: false, note: "Placeholder — simplified shape for demo." } },
  { serviceId: "up-caste", rules: makeCasteRules("up"), verificationLevel: "simplified", sourceMetadata: { researched: false, note: "Placeholder — simplified shape for demo." } },
  { serviceId: "up-domicile", rules: makeDomicileRules("up"), verificationLevel: "simplified", sourceMetadata: { researched: false, note: "Placeholder — simplified shape for demo." } },
  { serviceId: "ka-income", rules: makeGenericIncomeRules("ka", "Karnataka Income Certificate"), verificationLevel: "simplified", sourceMetadata: { researched: false, note: "Placeholder — simplified shape for demo." } },
  { serviceId: "ka-caste", rules: makeCasteRules("ka"), verificationLevel: "simplified", sourceMetadata: { researched: false, note: "Placeholder — simplified shape for demo." } },
  { serviceId: "ka-residence", rules: makeDomicileRules("ka"), verificationLevel: "simplified", sourceMetadata: { researched: false, note: "Placeholder — simplified shape for demo." } },
];

const SEED_OPERATORS = [
  { phone: "9999900001", fullName: "Amit Verma", role: "operator" as const },
  { phone: "9999900002", fullName: "Priya Sharma", role: "operator" as const },
  { phone: "9999900003", fullName: "Rajesh Kumar", role: "admin" as const },
];

export async function seedDatabase() {
  console.log("Seeding states...");
  for (const s of SEED_STATES) {
    await db.insert(states).values(s).onConflictDoNothing({ target: states.id });
  }

  console.log("Seeding services...");
  for (const s of SEED_SERVICES) {
    await db.insert(services).values(s).onConflictDoNothing({ target: services.id });
  }

  console.log("Seeding rule packs...");
  for (const pack of SEED_PACKS) {
    const existing = await db
      .select()
      .from(rulePacks)
      .where(eq(rulePacks.serviceId, pack.serviceId))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(rulePacks).values({
        serviceId: pack.serviceId,
        rules: pack.rules,
        verificationLevel: pack.verificationLevel,
        sourceMetadata: pack.sourceMetadata,
        status: "published",
        publishedAt: new Date(),
      });
    }
  }

  console.log("Seeding operators...");
  for (const op of SEED_OPERATORS) {
    const existing = await db.select().from(operators).where(eq(operators.phone, op.phone)).limit(1);
    if (existing.length === 0) {
      await db.insert(operators).values(op);
    }
  }

  console.log("Seed complete.");
}
