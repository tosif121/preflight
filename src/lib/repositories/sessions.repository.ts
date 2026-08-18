import { eq, lt } from "drizzle-orm";
import { db } from "@/lib/db";
import { sessions, operators, type Session } from "@/lib/db/schema";

export const sessionsRepository = {
  async create(operatorId: string, expiresAt: Date): Promise<Session> {
    const rows = await db
      .insert(sessions)
      .values({ operatorId, expiresAt })
      .returning();
    return rows[0];
  },

  async findByIdWithOperator(id: string): Promise<{ session: Session; operator: typeof operators.$inferSelect } | undefined> {
    const rows = await db
      .select({ session: sessions, operator: operators })
      .from(sessions)
      .innerJoin(operators, eq(sessions.operatorId, operators.id))
      .where(eq(sessions.id, id))
      .limit(1);
    return rows[0] ?? undefined;
  },

  async deleteById(id: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.id, id));
  },

  async deleteExpired(): Promise<void> {
    await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
  },
};
