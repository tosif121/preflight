import { readFileSync } from "fs";
import { join } from "path";

interface RulePack {
  id: string;
  name: string;
  cross_checks: Array<{
    id: string;
    severity: "blocker" | "warning";
    description: string;
    check_type: string;
  }>;
  required_documents: Array<{
    doc_type: string;
    scope: string;
    description: string;
  }>;
}

export interface CheckResult {
  ruleId: string;
  severity: "blocker" | "warning";
  status: "pass" | "fail" | "manual_review";
  message: string;
}

interface FamilyMember {
  id: string;
  fullName: string;
  relation: string;
  isEarning: boolean;
}

interface DocRecord {
  id: string;
  familyMemberId: string | null;
  docType: string;
  mockFileName: string;
  ocrConfidence: number | null;
  extractedData: Record<string, unknown> | null;
}

function loadRulePack(stateId: string, serviceId: string): RulePack {
  const stateDir = stateId.replace(/_/g, "-");
  const serviceFile = serviceId
    .replace(/^rj_/, "")
    .replace(/^up_/, "")
    .replace(/^ka_/, "")
    .replace(/_certificate$/, "")
    .replace(/_pension$/, "")
    .replace(/-certificate$/, "")
    .replace(/-pension$/, "");

  let raw: string;
  try {
    raw = readFileSync(
      join(process.cwd(), `src/lib/rules/${stateDir}/${serviceFile}.json`),
      "utf-8"
    );
  } catch {
    raw = readFileSync(
      join(process.cwd(), "src/lib/rules/rajasthan/family-income.json"),
      "utf-8"
    );
  }
  return JSON.parse(raw);
}

function checkNameConsistency(
  members: FamilyMember[],
  docs: DocRecord[]
): CheckResult {
  const identityDocs = docs.filter((d) => d.docType === "identity_proof");
  const incomeDocs = docs.filter(
    (d) =>
      d.docType === "income_proof_salaried" ||
      d.docType === "income_proof_nonsalaried"
  );

  for (const member of members) {
    const memberIdentity = identityDocs.find(
      (d) => d.familyMemberId === member.id
    );
    const memberIncome = incomeDocs.find(
      (d) => d.familyMemberId === member.id
    );

    if (memberIdentity?.extractedData && memberIncome?.extractedData) {
      const idName = memberIdentity.extractedData.name;
      const incName = memberIncome.extractedData.name;

      if (typeof idName === "string" && typeof incName === "string") {
        const normalize = (s: string) =>
          s.toLowerCase().replace(/\s+/g, " ").trim();
        if (normalize(idName) !== normalize(incName)) {
          return {
            ruleId: "name_consistency",
            severity: "blocker",
            status: "fail",
            message: `Name mismatch for "${member.fullName}": identity proof shows "${idName}" but income proof shows "${incName}". Upload a corrected document.`,
          };
        }
      }
    }

    if (memberIdentity?.extractedData) {
      const idName = memberIdentity.extractedData.name;
      if (
        typeof idName === "string" &&
        idName.toLowerCase().replace(/\s+/g, "").trim() !==
          member.fullName.toLowerCase().replace(/\s+/g, "").trim()
      ) {
        return {
          ruleId: "name_consistency",
          severity: "blocker",
          status: "fail",
          message: `Name on identity proof ("${idName}") doesn't match the registered name ("${member.fullName}"). Please re-upload the correct identity proof.`,
        };
      }
    }
  }

  return {
    ruleId: "name_consistency",
    severity: "blocker",
    status: "pass",
    message: "Name consistency check passed across all documents.",
  };
}

function checkAddressConsistency(docs: DocRecord[]): CheckResult {
  const identityDocs = docs.filter((d) => d.docType === "identity_proof");
  const addressDocs = docs.filter((d) => d.docType === "address_proof");

  if (identityDocs.length === 0 || addressDocs.length === 0) {
    return {
      ruleId: "address_consistency",
      severity: "warning",
      status: "manual_review",
      message:
        "Cannot verify address consistency — missing identity or address proof.",
    };
  }

  const idData = identityDocs[0]?.extractedData;
  const addrData = addressDocs[0]?.extractedData;

  if (
    !idData ||
    !idData.address ||
    !addrData ||
    !addrData.address
  ) {
    return {
      ruleId: "address_consistency",
      severity: "warning",
      status: "manual_review",
      message: "Address fields not fully extracted. Manual review recommended.",
    };
  }

  const idAddr = idData.address as Record<string, string>;
  const addrAddr = addrData.address as Record<string, string>;

  const idCity = (idAddr.city ?? "").toLowerCase().trim();
  const addrCity = (addrAddr.city ?? "").toLowerCase().trim();

  if (idCity && addrCity && idCity !== addrCity) {
    return {
      ruleId: "address_consistency",
      severity: "warning",
      status: "fail",
      message: `Address mismatch: identity proof lists city as "${idAddr.city}" but address proof lists "${addrAddr.city}". Please verify and re-upload if needed.`,
    };
  }

  return {
    ruleId: "address_consistency",
    severity: "warning",
    status: "pass",
    message: "Address consistency check passed.",
  };
}

function checkIncomeCoverage(
  members: FamilyMember[],
  docs: DocRecord[]
): CheckResult {
  const earningMembers = members.filter((m) => m.isEarning);
  const incomeDocs = docs.filter(
    (d) =>
      d.docType === "income_proof_salaried" ||
      d.docType === "income_proof_nonsalaried"
  );

  const missingMembers: string[] = [];
  for (const member of earningMembers) {
    const hasIncomeDoc = incomeDocs.some(
      (d) => d.familyMemberId === member.id
    );
    if (!hasIncomeDoc) {
      missingMembers.push(member.fullName);
    }
  }

  if (missingMembers.length > 0) {
    return {
      ruleId: "income_coverage",
      severity: "blocker",
      status: "fail",
      message: `Missing income proof for earning member(s): ${missingMembers.join(", ")}. Upload a salary slip, Form 16, ITR, or bank statement for each.`,
    };
  }

  return {
    ruleId: "income_coverage",
    severity: "blocker",
    status: "pass",
    message: "All earning family members have income proof documents.",
  };
}

function checkCertificateUseByDate(
  intendedUseDeadline: string | null
): CheckResult {
  if (!intendedUseDeadline) {
    return {
      ruleId: "certificate_use_by_date",
      severity: "blocker",
      status: "pass",
      message: "No intended use deadline set — skipping validity check.",
    };
  }

  const deadline = new Date(intendedUseDeadline);
  const now = new Date();
  const twelveMonthsFromNow = new Date(now);
  twelveMonthsFromNow.setMonth(twelveMonthsFromNow.getMonth() + 12);

  if (deadline > twelveMonthsFromNow) {
    return {
      ruleId: "certificate_use_by_date",
      severity: "blocker",
      status: "fail",
      message: `Intended use deadline (${intendedUseDeadline}) is beyond the 12-month certificate validity. Certificates must be used within 12 months of issuance. Please adjust the deadline.`,
    };
  }

  if (deadline < now) {
    return {
      ruleId: "certificate_use_by_date",
      severity: "blocker",
      status: "fail",
      message: `Intended use deadline (${intendedUseDeadline}) has already passed. Please update to a future date.`,
    };
  }

  return {
    ruleId: "certificate_use_by_date",
    severity: "blocker",
    status: "pass",
    message: `Intended use deadline (${intendedUseDeadline}) is within the validity window.`,
  };
}

function checkDocumentQuality(docs: DocRecord[]): CheckResult {
  const threshold = 0.75;
  const lowQuality = docs.filter(
    (d) => d.ocrConfidence !== null && d.ocrConfidence < threshold
  );

  if (lowQuality.length > 0) {
    const names = lowQuality.map((d) => d.mockFileName).join(", ");
    return {
      ruleId: "document_quality",
      severity: "warning",
      status: "fail",
      message: `Low OCR confidence detected for: ${names}. Re-upload a clearer scan for more reliable extraction.`,
    };
  }

  return {
    ruleId: "document_quality",
    severity: "warning",
    status: "pass",
    message: "All document quality scores are above threshold.",
  };
}

export function evaluateRules(
  stateId: string,
  serviceId: string,
  members: FamilyMember[],
  rawDocs: Array<{
    id: string;
    familyMemberId: string | null;
    docType: string;
    mockFileName: string;
    ocrConfidence: number | null;
    extractedData: unknown;
  }>,
  intendedUseDeadline: string | null
): CheckResult[] {
  const docs: DocRecord[] = rawDocs.map((d) => ({
    ...d,
    extractedData:
      d.extractedData && typeof d.extractedData === "object"
        ? (d.extractedData as Record<string, unknown>)
        : null,
  }));

  const pack = loadRulePack(stateId, serviceId);
  const results: CheckResult[] = [];

  for (const rule of pack.cross_checks) {
    let result: CheckResult;
    switch (rule.id) {
      case "name_consistency":
        result = checkNameConsistency(members, docs);
        break;
      case "address_consistency":
        result = checkAddressConsistency(docs);
        break;
      case "income_coverage":
        result = checkIncomeCoverage(members, docs);
        break;
      case "certificate_use_by_date":
        result = checkCertificateUseByDate(intendedUseDeadline);
        break;
      case "document_quality":
        result = checkDocumentQuality(docs);
        break;
      default:
        result = {
          ruleId: rule.id,
          severity: rule.severity as "blocker" | "warning",
          status: "manual_review",
          message: `Rule "${rule.id}" has no implementation yet.`,
        };
    }
    results.push(result);
  }

  return results;
}
