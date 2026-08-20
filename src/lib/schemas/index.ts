import { z } from "zod";

export const createApplicationSchema = z.object({
  stateId: z.string().min(1, "State is required"),
  serviceId: z.string().min(1, "Service is required"),
  citizenName: z.string().min(1, "Citizen name is required"),
  intendedUseDeadline: z.string().optional().nullable(),
  familyMembers: z
    .array(
      z.object({
        fullName: z.string().min(1, "Member name is required"),
        relation: z.string().min(1, "Relation is required"),
        isEarning: z.boolean(),
      })
    )
    .min(1, "At least one family member is required"),
});

export const addFamilyMemberSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  relation: z.string().min(1, "Relation is required"),
  isEarning: z.boolean(),
});

export const uploadDocumentSchema = z.object({
  docType: z.enum([
    "identity_proof",
    "address_proof",
    "income_proof_salaried",
    "income_proof_nonsalaried",
    "photo",
    "community_proof",
    "residence_proof",
    "death_certificate",
    "age_proof",
    "bank_account_proof",
    "prior_caste_certificate",
    "community_reference",
  ]),
  familyMemberId: z.string().uuid().optional().nullable(),
  mockFileName: z.string().min(1, "File name is required"),
});

export const resolveIssueSchema = z.object({
  checkId: z.string().uuid(),
  note: z.string().optional(),
});

export const createRulePackDraftSchema = z.object({
  serviceId: z.string().min(1),
  rules: z.record(z.string(), z.unknown()),
  verificationLevel: z.enum(["verified", "simplified"]),
  sourceMetadata: z.record(z.string(), z.unknown()).optional(),
});

export const publishRulePackSchema = z.object({
  rulePackId: z.string().uuid(),
});
