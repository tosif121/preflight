import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { states, type State } from "@/lib/db/schema";

export const statesRepository = {
  async findById(id: string): Promise<State | undefined> {
    const rows = await db.select().from(states).where(eq(states.id, id)).limit(1);
    return rows[0];
  },

  async listActive(): Promise<State[]> {
    return db.select().from(states).where(eq(states.status, "active"));
  },

  async listAll(): Promise<State[]> {
    return db.select().from(states);
  },
};
