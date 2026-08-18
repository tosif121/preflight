import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { auditEvents, type AuditEvent } from "@/lib/db/schema";

export const auditRepository = {
  async logEvent(
    applicationId: string,
    eventType: string,
    payload?: Record<string, unknown>
  ): Promise<AuditEvent> {
    const rows = await db
      .insert(auditEvents)
      .values({
        applicationId,
        eventType,
        payload: payload ?? {},
      })
      .returning();
    return rows[0];
  },

  async listByApplication(applicationId: string): Promise<AuditEvent[]> {
    return db
      .select()
      .from(auditEvents)
      .where(eq(auditEvents.applicationId, applicationId))
      .orderBy(desc(auditEvents.createdAt));
  },
};
