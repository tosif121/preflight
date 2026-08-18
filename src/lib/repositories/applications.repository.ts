import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { applications, type Application, type NewApplication } from "@/lib/db/schema";

export interface CreateApplicationInput {
  serviceId?: string;
  state?: string;
  operatorName: string;
  citizenName: string;
  intendedUseDeadline?: string | null;
}

export const applicationsRepository = {
  async createApplication(input: CreateApplicationInput): Promise<Application> {
    const rows = await db
      .insert(applications)
      .values({
        serviceId: input.serviceId ?? "rj_family_income_certificate",
        state: input.state ?? "rajasthan",
        operatorName: input.operatorName,
        citizenName: input.citizenName,
        intendedUseDeadline: input.intendedUseDeadline ?? null,
        status: "draft",
      })
      .returning();
    return rows[0];
  },

  async getApplicationById(id: string): Promise<Application | undefined> {
    const rows = await db
      .select()
      .from(applications)
      .where(eq(applications.id, id))
      .limit(1);
    return rows[0];
  },

  async listApplications(): Promise<Application[]> {
    return db
      .select()
      .from(applications)
      .orderBy(desc(applications.createdAt));
  },

  async updateApplicationStatus(
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
