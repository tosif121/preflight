export interface CrossCheck {
  id: string;
  severity: "blocker" | "warning";
  description: string;
  check_type: string;
}

export interface GeneratedRules {
  cross_checks: CrossCheck[];
  required_documents: string[];
  generated: true;
  template: string;
}

export function certificateTemplate(
  serviceName: string,
  extraDocType?: string
): GeneratedRules {
  const docs = ["identity_proof", "address_proof", "photo"];
  if (extraDocType) docs.push(extraDocType);

  return {
    generated: true,
    template: "certificate",
    required_documents: docs,
    cross_checks: [
      {
        id: "name_consistency",
        severity: "blocker",
        description: "Name must match across identity and address documents",
        check_type: "consistency",
      },
      {
        id: "address_consistency",
        severity: "warning",
        description: "Address should match across documents",
        check_type: "consistency",
      },
      {
        id: "document_quality",
        severity: "warning",
        description: "Documents should be legible with sufficient OCR confidence",
        check_type: "quality",
      },
    ],
  };
}

export function vitalEventCertificateTemplate(serviceName: string): GeneratedRules {
  return {
    generated: true,
    template: "vital_event_certificate",
    required_documents: ["identity_proof", "address_proof", "photo"],
    cross_checks: [
      {
        id: "name_consistency",
        severity: "blocker",
        description: "Applicant name must match across identity documents",
        check_type: "consistency",
      },
      {
        id: "document_quality",
        severity: "warning",
        description: "Documents should be legible with sufficient OCR confidence",
        check_type: "quality",
      },
    ],
  };
}

export function pensionTemplate(
  serviceName: string,
  extraDocType?: string
): GeneratedRules {
  const docs = [
    "identity_proof",
    "address_proof",
    "age_proof",
    "income_proof_salaried",
    "bank_account_proof",
    "photo",
  ];
  if (extraDocType) docs.push(extraDocType);

  const checks: CrossCheck[] = [
    {
      id: "name_consistency",
      severity: "blocker",
      description: "Name must match across all documents",
      check_type: "consistency",
    },
    {
      id: "age_eligibility",
      severity: "blocker",
      description: "Placeholder — age eligibility thresholds not verified for this state",
      check_type: "eligibility",
    },
    {
      id: "income_ceiling",
      severity: "warning",
      description: "Placeholder — income ceiling thresholds not verified for this state",
      check_type: "eligibility",
    },
    {
      id: "bank_account_proof_present",
      severity: "blocker",
      description: "Bank account proof required for pension disbursement",
      check_type: "completeness",
    },
    {
      id: "document_quality",
      severity: "warning",
      description: "Documents should be legible with sufficient OCR confidence",
      check_type: "quality",
    },
  ];

  return {
    generated: true,
    template: "pension",
    required_documents: docs,
    cross_checks: checks,
  };
}

export function welfareRegistrationTemplate(serviceName: string): GeneratedRules {
  return {
    generated: true,
    template: "welfare_registration",
    required_documents: [
      "identity_proof",
      "address_proof",
      "income_proof_salaried",
      "photo",
    ],
    cross_checks: [
      {
        id: "name_consistency",
        severity: "blocker",
        description: "Name must match across identity and address documents",
        check_type: "consistency",
      },
      {
        id: "address_consistency",
        severity: "warning",
        description: "Address should match across documents",
        check_type: "consistency",
      },
      {
        id: "document_quality",
        severity: "warning",
        description: "Documents should be legible with sufficient OCR confidence",
        check_type: "quality",
      },
    ],
  };
}
