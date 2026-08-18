import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { services, rulePacks, type Service } from "@/lib/db/schema";

export const servicesRepository = {
  async findById(id: string): Promise<Service | undefined> {
    const rows = await db.select().from(services).where(eq(services.id, id)).limit(1);
    return rows[0];
  },

  async listByState(stateId: string): Promise<Service[]> {
    return db.select().from(services).where(eq(services.stateId, stateId));
  },

  async listAll(): Promise<Service[]> {
    return db.select().from(services);
  },

  async listAllWithLatestPack(): Promise<Array<Service & { latestPack: typeof rulePacks.$inferSelect | null }>> {
    const rows = await db
      .select({
        service: services,
        pack: rulePacks,
      })
      .from(services)
      .leftJoin(
        rulePacks,
        sql`${rulePacks.serviceId} = ${services.id} AND ${rulePacks.status} = 'published'`
      )
      .orderBy(sql`${rulePacks.version} DESC NULLS LAST`);

    const byService = new Map<string, { service: Service; pack: typeof rulePacks.$inferSelect | null }>();
    for (const row of rows) {
      if (!byService.has(row.service.id)) {
        byService.set(row.service.id, { service: row.service, pack: row.pack });
      }
    }

    return Array.from(byService.values()).map(({ service, pack }) => ({
      ...service,
      latestPack: pack,
    }));
  },
};
