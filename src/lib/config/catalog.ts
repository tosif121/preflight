export type VerificationLevel = "verified" | "simplified" | "planned";

export interface ServiceDefinition {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  verificationLevel: VerificationLevel;
  serviceType: "certificate" | "welfare_scheme";
  requiredDocuments: string[];
}

export interface StateDefinition {
  id: string;
  name: string;
  code: string;
  services: ServiceDefinition[];
}

export const STATES: StateDefinition[] = [
  {
    id: "rajasthan",
    name: "Rajasthan",
    code: "RJ",
    services: [
      {
        id: "rj_family_income_certificate",
        name: "Family Income Certificate",
        description: "Verify income for family welfare schemes, scholarships, and subsidies",
        enabled: true,
        verificationLevel: "verified",
        serviceType: "certificate",
        requiredDocuments: ["identity_proof", "address_proof", "income_proof", "photo"],
      },
      {
        id: "rj_domicile_certificate",
        name: "Mool Niwas (Domicile)",
        description: "Proof of residence in Rajasthan for state schemes",
        enabled: false,
        verificationLevel: "simplified",
        serviceType: "certificate",
        requiredDocuments: ["identity_proof", "address_proof", "residence_proof"],
      },
      {
        id: "rj_caste_certificate",
        name: "Caste Certificate",
        description: "SC/ST/OBC caste verification for reservation benefits",
        enabled: false,
        verificationLevel: "simplified",
        serviceType: "certificate",
        requiredDocuments: ["identity_proof", "address_proof", "community_proof"],
      },
      {
        id: "rj_widow_pension",
        name: "Widow Pension",
        description: "Monthly pension eligibility for widows under state welfare",
        enabled: false,
        verificationLevel: "simplified",
        serviceType: "welfare_scheme",
        requiredDocuments: ["identity_proof", "address_proof", "income_proof", "death_certificate", "bank_account_proof"],
      },
    ],
  },
  {
    id: "uttar_pradesh",
    name: "Uttar Pradesh",
    code: "UP",
    services: [
      {
        id: "up_income_certificate",
        name: "Income Certificate",
        description: "Income verification for scholarships, fee waivers, and subsidies",
        enabled: false,
        verificationLevel: "simplified",
        serviceType: "certificate",
        requiredDocuments: ["identity_proof", "address_proof", "income_proof"],
      },
      {
        id: "up_caste_certificate",
        name: "Caste Certificate",
        description: "SC/ST/OBC caste verification for reservation benefits",
        enabled: false,
        verificationLevel: "simplified",
        serviceType: "certificate",
        requiredDocuments: ["identity_proof", "address_proof", "community_proof"],
      },
      {
        id: "up_domicile_certificate",
        name: "Domicile Certificate",
        description: "Proof of residence in Uttar Pradesh for state schemes",
        enabled: false,
        verificationLevel: "simplified",
        serviceType: "certificate",
        requiredDocuments: ["identity_proof", "address_proof", "residence_proof"],
      },
    ],
  },
  {
    id: "karnataka",
    name: "Karnataka",
    code: "KA",
    services: [
      {
        id: "ka_income_certificate",
        name: "Income Certificate",
        description: "Income verification for social welfare and education schemes",
        enabled: false,
        verificationLevel: "simplified",
        serviceType: "certificate",
        requiredDocuments: ["identity_proof", "address_proof", "income_proof"],
      },
      {
        id: "ka_caste_certificate",
        name: "Caste Certificate",
        description: "Caste verification for reservation and welfare benefits",
        enabled: false,
        verificationLevel: "simplified",
        serviceType: "certificate",
        requiredDocuments: ["identity_proof", "address_proof", "community_proof"],
      },
      {
        id: "ka_residence_certificate",
        name: "Residence Certificate",
        description: "Proof of residence in Karnataka for state schemes",
        enabled: false,
        verificationLevel: "simplified",
        serviceType: "certificate",
        requiredDocuments: ["identity_proof", "address_proof", "residence_proof"],
      },
    ],
  },
  {
    id: "maharashtra",
    name: "Maharashtra",
    code: "MH",
    services: [
      {
        id: "mh_income_certificate",
        name: "Income Certificate",
        description: "Income verification for education, housing, and welfare schemes",
        enabled: false,
        verificationLevel: "simplified",
        serviceType: "certificate",
        requiredDocuments: ["identity_proof", "address_proof", "income_proof"],
      },
      {
        id: "mh_domicile_certificate",
        name: "Domicile Certificate",
        description: "Proof of residence in Maharashtra for state schemes",
        enabled: false,
        verificationLevel: "simplified",
        serviceType: "certificate",
        requiredDocuments: ["identity_proof", "address_proof", "residence_proof"],
      },
    ],
  },
];

export function getStateById(id: string): StateDefinition | undefined {
  return STATES.find((s) => s.id === id);
}

export function getServiceForState(stateId: string, serviceId: string): ServiceDefinition | undefined {
  const state = getStateById(stateId);
  return state?.services.find((s) => s.id === serviceId);
}

export function getEnabledServices(stateId: string): ServiceDefinition[] {
  const state = getStateById(stateId);
  return state?.services.filter((s) => s.enabled) ?? [];
}

export function formatServiceType(type: "certificate" | "welfare_scheme"): string {
  return type === "welfare_scheme" ? "Welfare Scheme" : "Certificate";
}

export function formatVerificationLevel(level: VerificationLevel): string {
  switch (level) {
    case "verified": return "Verified";
    case "simplified": return "Simplified";
    case "planned": return "Planned";
  }
}
