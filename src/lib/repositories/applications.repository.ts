import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { applications, type Application } from "@/lib/db/schema";

export interface CreateApplicationInput {
  operatorId: string;
  stateId: string;
  serviceId: string;
  rulePackId?: string | null;
  citizenName: string;
  intendedUseDeadline?: string | null;
}

export const applicationsRepository = {
  async create(input: CreateApplicationInput): Promise<Application> {
    const rows = await db
      .insert(applications)
      .values({
        operatorId: input.operatorId,
        stateId: input.stateId,
        serviceId: input.serviceId,
        rulePackId: input.rulePackId ?? null,
        citizenName: input.citizenName,
        intendedUseDeadline: input.intendedUseDeadline ?? null,
        status: "draft",
      })
      .returning();
    return rows[0];
  },

  async findById(id: string): Promise<Application | undefined> {
    const rows = await db
      .select()
      .from(applications)
      .where(eq(applications.id, id))
      .limit(1);
    return rows[0];
  },

  async listByOperator(operatorId: string): Promise<Application[]> {
    return db
      .select()
      .from(applications)
      .where(eq(applications.operatorId, operatorId))
      .orderBy(desc(applications.createdAt));
  },

  async listByState(stateId: string): Promise<Application[]> {
    return db
      .select()
      .from(applications)
      .where(eq(applications.stateId, stateId))
      .orderBy(desc(applications.createdAt));
  },

  async listAll(): Promise<Application[]> {
    return db.select().from(applications).orderBy(desc(applications.createdAt));
  },

  async updateStatus(
    id: string,
    status: Application["status"]
  ): Promise<Application | undefined> {
    const rows = await db
      .update(applications)
      .set({ status, updatedAt: new Date() })
      .where(eq(applications.id, id))
      .returning();
    return rows[0];
  },
};
