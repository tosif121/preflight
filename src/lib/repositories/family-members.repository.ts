import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { familyMembers, type FamilyMember } from "@/lib/db/schema";

export interface AddFamilyMemberInput {
  applicationId: string;
  fullName: string;
  relation: string;
  isEarning: boolean;
}

export const familyMembersRepository = {
  async add(input: AddFamilyMemberInput): Promise<FamilyMember> {
    const rows = await db
      .insert(familyMembers)
      .values({
        applicationId: input.applicationId,
        fullName: input.fullName,
        relation: input.relation,
        isEarning: input.isEarning,
      })
      .returning();
    return rows[0];
  },

  async listByApplication(applicationId: string): Promise<FamilyMember[]> {
    return db
      .select()
      .from(familyMembers)
      .where(eq(familyMembers.applicationId, applicationId));
  },

  async deleteByApplication(applicationId: string): Promise<void> {
    await db
      .delete(familyMembers)
      .where(eq(familyMembers.applicationId, applicationId));
  },
};
