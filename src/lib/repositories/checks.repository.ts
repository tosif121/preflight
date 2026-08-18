import { eq, and, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { checks, type Check } from "@/lib/db/schema";

export interface BulkInsertCheckInput {
  applicationId: string;
  ruleId: string;
  severity: "blocker" | "warning";
  status: "pass" | "fail" | "manual_review";
  message: string;
}

export const checksRepository = {
  async bulkInsertChecks(
    applicationId: string,
    checkResults: Omit<BulkInsertCheckInput, "applicationId">[]
  ): Promise<Check[]> {
    const values = checkResults.map((c) => ({
      applicationId,
      ruleId: c.ruleId,
      severity: c.severity,
      status: c.status,
      message: c.message,
    }));

    return db.insert(checks).values(values).returning();
  },

  async listByApplication(applicationId: string): Promise<Check[]> {
    return db
      .select()
      .from(checks)
      .where(eq(checks.applicationId, applicationId));
  },

  async getBlockerCount(applicationId: string): Promise<number> {
    const rows = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(checks)
      .where(
        and(
          eq(checks.applicationId, applicationId),
          eq(checks.severity, "blocker"),
          eq(checks.status, "fail")
        )
      );
    return rows[0]?.count ?? 0;
  },

  async clearChecks(applicationId: string): Promise<void> {
    await db.delete(checks).where(eq(checks.applicationId, applicationId));
  },
};
