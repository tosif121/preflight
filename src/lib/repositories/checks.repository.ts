import { eq, and, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { preflightChecks, type PreflightCheck } from "@/lib/db/schema";

export interface BulkCheckInput {
  ruleId: string;
  severity: "blocker" | "warning";
  result: "pass" | "fail" | "manual_review";
  evidence?: unknown;
  message: string;
}

export const checksRepository = {
  async bulkInsert(
    applicationId: string,
    checks: BulkCheckInput[]
  ): Promise<PreflightCheck[]> {
    if (checks.length === 0) return [];
    const rows = await db
      .insert(preflightChecks)
      .values(
        checks.map((c) => ({
          applicationId,
          ruleId: c.ruleId,
          severity: c.severity,
          result: c.result,
          evidence: c.evidence ?? null,
          message: c.message,
        }))
      )
      .returning();
    return rows;
  },

  async listByApplication(applicationId: string): Promise<PreflightCheck[]> {
    return db
      .select()
      .from(preflightChecks)
      .where(eq(preflightChecks.applicationId, applicationId));
  },

  async clearByApplication(applicationId: string): Promise<void> {
    await db
      .delete(preflightChecks)
      .where(eq(preflightChecks.applicationId, applicationId));
  },

  async getBlockerCount(applicationId: string): Promise<number> {
    const rows = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(preflightChecks)
      .where(
        and(
          eq(preflightChecks.applicationId, applicationId),
          eq(preflightChecks.severity, "blocker"),
          eq(preflightChecks.result, "fail")
        )
      );
    return rows[0]?.count ?? 0;
  },
};
