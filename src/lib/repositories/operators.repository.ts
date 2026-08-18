import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { operators, type Operator } from "@/lib/db/schema";

export const operatorsRepository = {
  async findByPhone(phone: string): Promise<Operator | undefined> {
    const rows = await db.select().from(operators).where(eq(operators.phone, phone)).limit(1);
    return rows[0];
  },

  async findById(id: string): Promise<Operator | undefined> {
    const rows = await db.select().from(operators).where(eq(operators.id, id)).limit(1);
    return rows[0];
  },

  async createIfNotExists(phone: string): Promise<Operator> {
    const existing = await this.findByPhone(phone);
    if (existing) return existing;

    const rows = await db
      .insert(operators)
      .values({ phone, role: "operator" })
      .returning();
    return rows[0];
  },

  async upsert(phone: string, fullName?: string): Promise<Operator> {
    const existing = await this.findByPhone(phone);
    if (existing) {
      if (fullName && !existing.fullName) {
        const [updated] = await db
          .update(operators)
          .set({ fullName })
          .where(eq(operators.id, existing.id))
          .returning();
        return updated;
      }
      return existing;
    }

    const rows = await db
      .insert(operators)
      .values({ phone, fullName: fullName ?? null, role: "operator" })
      .returning();
    return rows[0];
  },
};
