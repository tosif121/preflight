import { db } from "@/lib/db";
import {
  states,
  services,
  rulePacks,
  operators,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  certificateTemplate,
  vitalEventCertificateTemplate,
  pensionTemplate,
  welfareRegistrationTemplate,
} from "@/lib/rules/templates";

const SEED_STATES = [
  { id: "andhra_pradesh", name: "Andhra Pradesh", code: "AP", portalName: "MeeSeva", portalUrl: "https://meeseva.ap.gov.in", status: "active" as const },
  { id: "arunachal_pradesh", name: "Arunachal Pradesh", code: "AR", portalName: "ArunOnline", portalUrl: "https://arunonline.gov.in", status: "active" as const },
  { id: "assam", name: "Assam", code: "AS", portalName: "Sewa Setu", portalUrl: "https://sewasetu.assam.gov.in", status: "active" as const },
  { id: "bihar", name: "Bihar", code: "BR", portalName: "RTPS", portalUrl: "https://serviceonline.bihar.gov.in", status: "active" as const },
  { id: "chhattisgarh", name: "Chhattisgarh", code: "CG", portalName: "e-District", portalUrl: "https://edistrict.cgstate.gov.in", status: "active" as const },
  { id: "goa", name: "Goa", code: "GA", portalName: "Goa Online", portalUrl: "https://goaonline.gov.in", status: "active" as const },
  { id: "gujarat", name: "Gujarat", code: "GJ", portalName: "Digital Seva", portalUrl: "https://digitalseva.gujarat.gov.in", status: "active" as const },
  { id: "haryana", name: "Haryana", code: "HR", portalName: "Antyodaya SARAL", portalUrl: "https://saralharyana.gov.in", status: "active" as const },
  { id: "himachal_pradesh", name: "Himachal Pradesh", code: "HP", portalName: "e-District", portalUrl: "https://edistrict.hp.gov.in", status: "active" as const },
  { id: "jharkhand", name: "Jharkhand", code: "JH", portalName: "Jharsewa", portalUrl: "https://jharsewa.jharkhand.gov.in", status: "active" as const },
  { id: "karnataka", name: "Karnataka", code: "KA", portalName: "Seva Sindhu", portalUrl: "https://sevasindhu.karnataka.gov.in", status: "active" as const },
  { id: "kerala", name: "Kerala", code: "KL", portalName: "e-District", portalUrl: "https://edistrict.kerala.gov.in", status: "active" as const },
  { id: "madhya_pradesh", name: "Madhya Pradesh", code: "MP", portalName: "MP e-District", portalUrl: "https://mpedistrict.gov.in", status: "active" as const },
  { id: "maharashtra", name: "Maharashtra", code: "MH", portalName: "Aaple Sarkar", portalUrl: "https://aaplesarkar.mahaonline.gov.in", status: "active" as const },
  { id: "manipur", name: "Manipur", code: "MN", portalName: "e-District", portalUrl: "https://edistrict.manipur.gov.in", status: "active" as const },
  { id: "meghalaya", name: "Meghalaya", code: "ML", portalName: "Meghalaya Services", portalUrl: "https://meghalaya.gov.in", status: "active" as const },
  { id: "mizoram", name: "Mizoram", code: "MZ", portalName: "e-District", portalUrl: "https://edistrict.mizoram.gov.in", status: "active" as const },
  { id: "nagaland", name: "Nagaland", code: "NL", portalName: "e-District", portalUrl: "https://edistrict.nagaland.gov.in", status: "active" as const },
  { id: "odisha", name: "Odisha", code: "OR", portalName: "e-District", portalUrl: "https://edistrict.odisha.gov.in", status: "active" as const },
  { id: "punjab", name: "Punjab", code: "PB", portalName: "Sewa Kendra", portalUrl: "https://saral Punjab.gov.in", status: "active" as const },
  { id: "rajasthan", name: "Rajasthan", code: "RJ", portalName: "eMitra", portalUrl: "https://emitra.rajasthan.gov.in", status: "active" as const },
  { id: "sikkim", name: "Sikkim", code: "SK", portalName: "e-Services", portalUrl: "https://sikkim.gov.in", status: "active" as const },
  { id: "tamil_nadu", name: "Tamil Nadu", code: "TN", portalName: "e-Sevai", portalUrl: "https://esevai.tn.gov.in", status: "active" as const },
  { id: "telangana", name: "Telangana", code: "TS", portalName: "MeeSeva", portalUrl: "https://meeseva.telangana.gov.in", status: "active" as const },
  { id: "tripura", name: "Tripura", code: "TR", portalName: "e-District", portalUrl: "https://edistrict.tripura.gov.in", status: "active" as const },
  { id: "uttar_pradesh", name: "Uttar Pradesh", code: "UP", portalName: "e-District", portalUrl: "https://edistrict.up.gov.in", status: "active" as const },
  { id: "uttarakhand", name: "Uttarakhand", code: "UK", portalName: "e-District", portalUrl: "https://edistrict.uk.gov.in", status: "active" as const },
  { id: "west_bengal", name: "West Bengal", code: "WB", portalName: "Paras", portalUrl: "https://paras.wb.gov.in", status: "active" as const },
  { id: "andaman_nicobar", name: "Andaman & Nicobar Islands", code: "AN", portalName: "e-District", portalUrl: "https://andaman.gov.in", status: "active" as const },
  { id: "chandigarh", name: "Chandigarh", code: "CH", portalName: "e-District", portalUrl: "https://chandigarh.gov.in", status: "active" as const },
  { id: "dadra_nagar_haveli", name: "Dadra & Nagar Haveli and Daman & Diu", code: "DD", portalName: "e-District", portalUrl: "https://dnh.gov.in", status: "active" as const },
  { id: "delhi", name: "Delhi", code: "DL", portalName: "e-District Delhi", portalUrl: "https://edistrict.delhigovt.nic.in", status: "active" as const },
  { id: "jammu_kashmir", name: "Jammu & Kashmir", code: "JK", portalName: "e-District", portalUrl: "https://edistrict.jk.gov.in", status: "active" as const },
  { id: "ladakh", name: "Ladakh", code: "LA", portalName: "e-District", portalUrl: "https://ladakh.gov.in", status: "active" as const },
  { id: "lakshadweep", name: "Lakshadweep", code: "LD", portalName: "e-District", portalUrl: "https://lakshadweep.gov.in", status: "active" as const },
  { id: "puducherry", name: "Puducherry", code: "PY", portalName: "e-District", portalUrl: "https://py.gov.in", status: "active" as const },
];

interface ServiceDef {
  slug: string;
  name: string;
  category: "certificate" | "pension" | "welfare";
  description: string;
  template: "certificate" | "vital_event" | "pension" | "welfare";
  extraDocType?: string;
}

const SERVICE_CATALOG: ServiceDef[] = [
  { slug: "income", name: "Income Certificate", category: "certificate", description: "Income verification for scholarships, fee waivers, and subsidies", template: "certificate" },
  { slug: "caste", name: "Caste Certificate", category: "certificate", description: "SC/ST/OBC caste verification for reservation benefits", template: "certificate" },
  { slug: "domicile", name: "Domicile Certificate", category: "certificate", description: "Proof of residence for state schemes", template: "certificate" },
  { slug: "birth", name: "Birth Certificate", category: "certificate", description: "Official birth registration and certificate", template: "vital_event" },
  { slug: "death", name: "Death Certificate", category: "certificate", description: "Official death registration and certificate", template: "vital_event" },
  { slug: "widow-pension", name: "Widow Pension", category: "pension", description: "Monthly pension eligibility for widows under state welfare", template: "pension", extraDocType: "death_certificate" },
  { slug: "old-age-pension", name: "Old Age Pension", category: "pension", description: "Monthly pension for senior citizens below income threshold", template: "pension" },
  { slug: "disability-pension", name: "Disability Pension", category: "pension", description: "Monthly pension for persons with disabilities", template: "pension" },
  { slug: "ration-card", name: "Ration Card", category: "welfare", description: "Public distribution system ration card registration", template: "welfare" },
  { slug: "scholarship", name: "Scholarship Application", category: "welfare", description: "State scholarship application for eligible students", template: "welfare" },
];

// Rajasthan Family Income Certificate is the ONLY verified, hand-researched pack
const VERIFIED_SERVICES: Record<string, Record<string, { name: string; rules: unknown }>> = {
  rajasthan: {
    "family-income": {
      name: "Family Income Certificate",
      rules: {
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
      },
    },
  },
};

function generateRules(stateName: string, svc: ServiceDef) {
  switch (svc.template) {
    case "certificate":
      return certificateTemplate(`${stateName} ${svc.name}`, svc.extraDocType);
    case "vital_event":
      return vitalEventCertificateTemplate(`${stateName} ${svc.name}`);
    case "pension":
      return pensionTemplate(`${stateName} ${svc.name}`, svc.extraDocType);
    case "welfare":
      return welfareRegistrationTemplate(`${stateName} ${svc.name}`);
  }
}

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

  console.log("Seeding services and rule packs...");
  let serviceCount = 0;
  let packCount = 0;

  for (const state of SEED_STATES) {
    for (const svc of SERVICE_CATALOG) {
      const serviceId = `${state.code.toLowerCase()}-${svc.slug}`;
      const serviceName = `${svc.name}`;

      // Check if this is a verified service (Rajasthan Family Income)
      const verifiedPack = VERIFIED_SERVICES[state.id]?.[svc.slug];

      const serviceStatus = verifiedPack ? "live" : "beta";

      await db
        .insert(services)
        .values({
          id: serviceId,
          stateId: state.id,
          name: serviceName,
          slug: svc.slug,
          category: svc.category,
          description: svc.description,
          status: serviceStatus,
        })
        .onConflictDoNothing({ target: services.id });
      serviceCount++;

      // Skip rule pack generation for verified services — they already have one
      if (verifiedPack) continue;

      // Check if rule pack already exists
      const existing = await db
        .select()
        .from(rulePacks)
        .where(eq(rulePacks.serviceId, serviceId))
        .limit(1);

      if (existing.length > 0) continue;

      const rules = generateRules(state.name, svc);

      await db.insert(rulePacks).values({
        serviceId,
        rules,
        verificationLevel: "simplified",
        sourceMetadata: {
          generated: true,
          template: svc.template,
          note: "Auto-generated from a generic category template — not verified against this state's actual process. Placeholder thresholds where applicable.",
        },
        status: "published",
        publishedAt: new Date(),
      });
      packCount++;
    }
  }

  console.log(`Seeded ${serviceCount} services, ${packCount} rule packs.`);

  console.log("Seeding operators...");
  for (const op of SEED_OPERATORS) {
    const existing = await db.select().from(operators).where(eq(operators.phone, op.phone)).limit(1);
    if (existing.length === 0) {
      await db.insert(operators).values(op);
    }
  }

  console.log("Seed complete.");
}
