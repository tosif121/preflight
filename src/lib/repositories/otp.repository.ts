import { eq, and, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { otpCodes, type OtpCode } from "@/lib/db/schema";

export const otpRepository = {
  async create(phone: string, code: string, expiresAt: Date): Promise<OtpCode> {
    const rows = await db
      .insert(otpCodes)
      .values({ phone, code, expiresAt })
      .returning();
    return rows[0];
  },

  async getLatestUnconsumed(phone: string): Promise<OtpCode | undefined> {
    const rows = await db
      .select()
      .from(otpCodes)
      .where(and(eq(otpCodes.phone, phone), eq(otpCodes.consumed, false)))
      .orderBy(desc(otpCodes.createdAt))
      .limit(1);
    return rows[0];
  },

  async markConsumed(id: string): Promise<void> {
    await db.update(otpCodes).set({ consumed: true }).where(eq(otpCodes.id, id));
  },
};
