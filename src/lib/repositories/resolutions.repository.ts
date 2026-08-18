import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { resolutions, type Resolution } from "@/lib/db/schema";

export interface CreateResolutionInput {
  checkId: string;
  plainLanguageFix: string;
}

export const resolutionsRepository = {
  async createResolution(input: CreateResolutionInput): Promise<Resolution> {
    const rows = await db
      .insert(resolutions)
      .values({
        checkId: input.checkId,
        plainLanguageFix: input.plainLanguageFix,
      })
      .returning();
    return rows[0];
  },

  async markResolved(id: string): Promise<Resolution | undefined> {
    const rows = await db
      .update(resolutions)
      .set({ resolved: true, resolvedAt: new Date() })
      .where(eq(resolutions.id, id))
      .returning();
    return rows[0];
  },

  async listByApplication(applicationId: string): Promise<Resolution[]> {
    const { checks } = await import("@/lib/db/schema");
    return db
      .select()
      .from(resolutions)
      .innerJoin(checks, eq(resolutions.checkId, checks.id))
      .where(eq(checks.applicationId, applicationId))
      .then((rows) => rows.map((r) => r.resolutions));
  },

  async findByCheckId(checkId: string): Promise<Resolution | undefined> {
    const rows = await db
      .select()
      .from(resolutions)
      .where(eq(resolutions.checkId, checkId))
      .limit(1);
    return rows[0];
  },
};
