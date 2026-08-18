import { eq, desc, and, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { rulePacks, services, type RulePack } from "@/lib/db/schema";

export interface CreateDraftInput {
  serviceId: string;
  rules: unknown;
  verificationLevel: "verified" | "simplified";
  sourceMetadata?: unknown;
}

export const rulePacksRepository = {
  async findById(id: string): Promise<RulePack | undefined> {
    const rows = await db.select().from(rulePacks).where(eq(rulePacks.id, id)).limit(1);
    return rows[0];
  },

  async findByService(serviceId: string): Promise<RulePack[]> {
    return db
      .select()
      .from(rulePacks)
      .where(eq(rulePacks.serviceId, serviceId))
      .orderBy(desc(rulePacks.version));
  },

  async getLatestPublished(serviceId: string): Promise<RulePack | undefined> {
    const rows = await db
      .select()
      .from(rulePacks)
      .where(and(eq(rulePacks.serviceId, serviceId), eq(rulePacks.status, "published")))
      .orderBy(desc(rulePacks.version))
      .limit(1);
    return rows[0];
  },

  async createDraft(input: CreateDraftInput): Promise<RulePack> {
    const rows = await db
      .insert(rulePacks)
      .values({
        serviceId: input.serviceId,
        rules: input.rules,
        verificationLevel: input.verificationLevel,
        sourceMetadata: input.sourceMetadata ?? null,
        status: "draft",
      })
      .returning();
    return rows[0];
  },

  async publish(id: string): Promise<RulePack> {
    return db.transaction(async (tx) => {
      const pack = await tx
        .select()
        .from(rulePacks)
        .where(eq(rulePacks.id, id))
        .limit(1)
        .then((r) => r[0]);

      if (!pack) throw new Error("Rule pack not found");

      const [updated] = await tx
        .update(rulePacks)
        .set({ status: "published", publishedAt: new Date() })
        .where(eq(rulePacks.id, id))
        .returning();

      const derivedStatus = pack.verificationLevel === "verified" ? "live" : "beta";
      await tx
        .update(services)
        .set({ status: derivedStatus })
        .where(eq(services.id, pack.serviceId));

      return updated;
    });
  },
};
