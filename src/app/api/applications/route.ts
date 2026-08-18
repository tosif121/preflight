import { NextRequest } from "next/server";
import { createApplicationSchema } from "@/lib/schemas";
import { applicationsRepository } from "@/lib/repositories/applications.repository";
import { familyMembersRepository } from "@/lib/repositories/family-members.repository";
import { auditRepository } from "@/lib/repositories/audit.repository";

export async function GET() {
  const apps = await applicationsRepository.listApplications();
  return Response.json(apps);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = createApplicationSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { citizenName, operatorName, intendedUseDeadline, familyMembers } =
    parsed.data;

  const application = await applicationsRepository.createApplication({
    citizenName,
    operatorName,
    intendedUseDeadline: intendedUseDeadline ?? null,
  });

  for (const member of familyMembers) {
    await familyMembersRepository.addFamilyMember({
      applicationId: application.id,
      fullName: member.fullName,
      relation: member.relation,
      isEarning: member.isEarning,
    });
  }

  await auditRepository.logEvent(application.id, "application_created", {
    citizenName,
    operatorName,
    memberCount: familyMembers.length,
  });

  const members = await familyMembersRepository.listByApplication(
    application.id
  );

  return Response.json({ application, members }, { status: 201 });
}
