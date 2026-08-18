export interface CheckResult {
  ruleId: string;
  severity: "blocker" | "warning";
  status: "pass" | "fail" | "manual_review";
  message: string;
  evidence?: Record<string, unknown>;
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

interface RulePackRules {
  cross_checks?: Array<{
    id: string;
    severity: "blocker" | "warning";
    description: string;
    check_type: string;
  }>;
  [key: string]: unknown;
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
            message: `Name mismatch for "${member.fullName}": identity proof shows "${idName}" but income proof shows "${incName}".`,
            evidence: { memberId: member.id, idName, incName },
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
          message: `Name on identity proof ("${idName}") doesn't match the registered name ("${member.fullName}").`,
          evidence: { memberId: member.id, idName, registeredName: member.fullName },
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
      message: "Cannot verify address consistency — missing identity or address proof.",
    };
  }

  const idData = identityDocs[0]?.extractedData;
  const addrData = addressDocs[0]?.extractedData;

  if (!idData?.address || !addrData?.address) {
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
      message: `Address mismatch: identity proof lists city "${idAddr.city}" but address proof lists "${addrAddr.city}".`,
      evidence: { idCity: idAddr.city, addrCity: addrAddr.city },
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
      message: `Missing income proof for earning member(s): ${missingMembers.join(", ")}.`,
      evidence: { missingMembers },
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
      message: `Intended use deadline (${intendedUseDeadline}) is beyond the 12-month validity.`,
      evidence: { deadline: intendedUseDeadline },
    };
  }

  if (deadline < now) {
    return {
      ruleId: "certificate_use_by_date",
      severity: "blocker",
      status: "fail",
      message: `Intended use deadline (${intendedUseDeadline}) has already passed.`,
      evidence: { deadline: intendedUseDeadline },
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
      message: `Low OCR confidence detected for: ${names}. Re-upload a clearer scan.`,
      evidence: { lowQualityDocs: lowQuality.map((d) => d.mockFileName) },
    };
  }

  return {
    ruleId: "document_quality",
    severity: "warning",
    status: "pass",
    message: "All document quality scores are above threshold.",
  };
}

function checkLineageReference(docs: DocRecord[]): CheckResult {
  const hasPrior = docs.some(
    (d) =>
      d.docType === "prior_caste_certificate" ||
      d.docType === "community_reference"
  );

  if (!hasPrior) {
    return {
      ruleId: "lineage_reference_present",
      severity: "blocker",
      status: "fail",
      message: "No prior caste certificate or community reference found. This is a common rejection reason.",
    };
  }

  return {
    ruleId: "lineage_reference_present",
    severity: "blocker",
    status: "pass",
    message: "Caste lineage reference document present.",
  };
}

function checkAgeEligibility(docs: DocRecord[]): CheckResult {
  const ageDoc = docs.find((d) => d.docType === "age_proof");
  if (!ageDoc?.extractedData?.dateOfBirth) {
    return {
      ruleId: "age_eligibility",
      severity: "blocker",
      status: "manual_review",
      message: "Age proof not uploaded or date of birth not extracted. Manual review required.",
    };
  }

  const dob = new Date(ageDoc.extractedData.dateOfBirth as string);
  const age = Math.floor(
    (Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  );

  if (age < 18 || age > 59) {
    return {
      ruleId: "age_eligibility",
      severity: "blocker",
      status: "fail",
      message: `Applicant age (${age}) falls outside the 18-59 eligibility band (placeholder — verify real threshold).`,
      evidence: { age, dob: ageDoc.extractedData.dateOfBirth },
    };
  }

  return {
    ruleId: "age_eligibility",
    severity: "blocker",
    status: "pass",
    message: `Applicant age (${age}) is within eligibility band.`,
  };
}

function checkIncomeCeiling(docs: DocRecord[]): CheckResult {
  const incomeDoc = docs.find(
    (d) =>
      d.docType === "income_proof_salaried" ||
      d.docType === "income_proof_nonsalaried"
  );

  if (!incomeDoc?.extractedData?.annualIncome) {
    return {
      ruleId: "income_ceiling",
      severity: "warning",
      status: "manual_review",
      message: "Income amount not extracted. Manual review recommended.",
    };
  }

  const income = Number(incomeDoc.extractedData.annualIncome);
  if (income > 200000) {
    return {
      ruleId: "income_ceiling",
      severity: "warning",
      status: "fail",
      message: `Annual income (₹${income.toLocaleString("en-IN")}) may exceed the pension threshold (placeholder — verify real limit).`,
      evidence: { annualIncome: income },
    };
  }

  return {
    ruleId: "income_ceiling",
    severity: "warning",
    status: "pass",
    message: "Income appears within eligible range.",
  };
}

function checkBankAccountPresent(docs: DocRecord[]): CheckResult {
  const hasBank = docs.some((d) => d.docType === "bank_account_proof");

  if (!hasBank) {
    return {
      ruleId: "bank_account_proof_present",
      severity: "blocker",
      status: "fail",
      message: "Bank account proof is required for pension disbursement.",
    };
  }

  return {
    ruleId: "bank_account_proof_present",
    severity: "blocker",
    status: "pass",
    message: "Bank account proof present.",
  };
}

export function evaluateRules(
  rulePackRules: Record<string, unknown>,
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

  const pack = rulePackRules as RulePackRules;
  const crossChecks = pack.cross_checks ?? [];
  const results: CheckResult[] = [];

  for (const rule of crossChecks) {
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
      case "lineage_reference_present":
        result = checkLineageReference(docs);
        break;
      case "age_eligibility":
        result = checkAgeEligibility(docs);
        break;
      case "income_ceiling":
        result = checkIncomeCeiling(docs);
        break;
      case "bank_account_proof_present":
        result = checkBankAccountPresent(docs);
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
