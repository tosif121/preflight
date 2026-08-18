import { z } from "zod";

const docTypeEnum = z.enum([
  "identity_proof",
  "address_proof",
  "income_proof_salaried",
  "income_proof_nonsalaried",
  "photo",
  "community_proof",
  "residence_proof",
  "death_certificate",
]);

export const createApplicationSchema = z.object({
  citizenName: z.string().min(1, "Citizen name is required"),
  operatorName: z.string().min(1, "Operator name is required"),
  stateId: z.string().min(1, "State is required"),
  serviceId: z.string().min(1, "Service is required"),
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

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;

export const addFamilyMemberSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  relation: z.string().min(1, "Relation is required"),
  isEarning: z.boolean(),
});

export type AddFamilyMemberInput = z.infer<typeof addFamilyMemberSchema>;

export const uploadDocumentSchema = z.object({
  docType: docTypeEnum,
  familyMemberId: z.string().uuid().optional().nullable(),
  mockFileName: z.string().min(1, "File name is required"),
});

export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;

export const runChecksResponseSchema = z.object({
  checks: z.array(
    z.object({
      id: z.string().uuid(),
      ruleId: z.string(),
      severity: z.enum(["blocker", "warning"]),
      status: z.enum(["pass", "fail", "manual_review"]),
      message: z.string(),
    })
  ),
  readiness: z.object({
    passed: z.number(),
    total: z.number(),
    blockers: z.number(),
    warnings: z.number(),
  }),
});

export type RunChecksResponse = z.infer<typeof runChecksResponseSchema>;

export const resolveIssueSchema = z.object({
  checkId: z.string().uuid(),
  note: z.string().optional(),
});

export type ResolveIssueInput = z.infer<typeof resolveIssueSchema>;
