import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { documents, type Document } from "@/lib/db/schema";

export type DocType =
  | "identity_proof"
  | "address_proof"
  | "income_proof_salaried"
  | "income_proof_nonsalaried"
  | "photo"
  | "community_proof"
  | "residence_proof"
  | "death_certificate"
  | "age_proof"
  | "bank_account_proof"
  | "prior_caste_certificate"
  | "community_reference";

export interface AddDocumentInput {
  applicationId: string;
  familyMemberId?: string | null;
  docType: DocType;
  mockFileName: string;
  mockImageUrl: string;
  s3Key?: string | null;
}

export const documentsRepository = {
  async add(input: AddDocumentInput): Promise<Document> {
    const rows = await db
      .insert(documents)
      .values({
        applicationId: input.applicationId,
        familyMemberId: input.familyMemberId ?? null,
        docType: input.docType,
        mockFileName: input.mockFileName,
        mockImageUrl: input.mockImageUrl,
        s3Key: input.s3Key ?? null,
      })
      .returning();
    return rows[0];
  },

  async findById(id: string): Promise<Document | undefined> {
    const rows = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id))
      .limit(1);
    return rows[0];
  },

  async listByApplication(applicationId: string): Promise<Document[]> {
    return db
      .select()
      .from(documents)
      .where(eq(documents.applicationId, applicationId));
  },

  async updateOcrResult(
    id: string,
    input: {
      ocrStatus: "pending" | "complete" | "failed";
      ocrConfidence?: number | null;
      extractedData?: Record<string, unknown> | null;
    }
  ): Promise<Document | undefined> {
    const rows = await db
      .update(documents)
      .set({
        ocrStatus: input.ocrStatus,
        ocrConfidence: input.ocrConfidence ?? null,
        extractedData: (input.extractedData as Record<string, unknown>) ?? null,
      })
      .where(eq(documents.id, id))
      .returning();
    return rows[0];
  },
};
