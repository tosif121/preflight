import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/server";
import { createApplicationSchema } from "@/lib/schemas";
import { applicationsRepository } from "@/lib/repositories/applications.repository";
import { familyMembersRepository } from "@/lib/repositories/family-members.repository";
import { rulePacksRepository } from "@/lib/repositories/rule-packs.repository";
import { auditRepository } from "@/lib/repositories/audit.repository";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const apps = await applicationsRepository.listByOperator(user.id);
  return Response.json(apps);
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = createApplicationSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { stateId, serviceId, citizenName, intendedUseDeadline, familyMembers } =
    parsed.data;

  const latestPack = await rulePacksRepository.getLatestPublished(serviceId);

  const application = await applicationsRepository.create({
    operatorId: user.id,
    stateId,
    serviceId,
    rulePackId: latestPack?.id ?? null,
    citizenName,
    intendedUseDeadline: intendedUseDeadline ?? null,
  });

  for (const member of familyMembers) {
    await familyMembersRepository.add({
      applicationId: application.id,
      fullName: member.fullName,
      relation: member.relation,
      isEarning: member.isEarning,
    });
  }

  await auditRepository.logEvent(application.id, "application_created", {
    citizenName,
    stateId,
    serviceId,
    memberCount: familyMembers.length,
  });

  const members = await familyMembersRepository.listByApplication(application.id);

  return Response.json({ application, members }, { status: 201 });
}
