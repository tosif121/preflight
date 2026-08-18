import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/server";
import { addFamilyMemberSchema } from "@/lib/schemas";
import { familyMembersRepository } from "@/lib/repositories/family-members.repository";
import { auditRepository } from "@/lib/repositories/audit.repository";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const parsed = addFamilyMemberSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const member = await familyMembersRepository.add({
    applicationId: id,
    ...parsed.data,
  });

  await auditRepository.logEvent(id, "family_member_added", {
    memberId: member.id,
    fullName: member.fullName,
  });

  return Response.json({ member }, { status: 201 });
}
