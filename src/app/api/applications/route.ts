import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/server";
import { createApplicationSchema } from "@/lib/schemas";
import { applicationsRepository } from "@/lib/repositories/applications.repository";
import { familyMembersRepository } from "@/lib/repositories/family-members.repository";
import { documentsRepository } from "@/lib/repositories/documents.repository";
import { checksRepository } from "@/lib/repositories/checks.repository";
import { rulePacksRepository } from "@/lib/repositories/rule-packs.repository";
import { statesRepository } from "@/lib/repositories/states.repository";
import { servicesRepository } from "@/lib/repositories/services.repository";
import { auditRepository } from "@/lib/repositories/audit.repository";

export async function GET(_request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const apps = await applicationsRepository.listByOperator(user.id);

  // Enrich each application with metadata for the dashboard
  const enriched = await Promise.all(
    apps.map(async (app) => {
      const [state, service, members, docs, checks, latestAudit] = await Promise.all([
        statesRepository.findById(app.stateId),
        servicesRepository.findById(app.serviceId),
        familyMembersRepository.listByApplication(app.id),
        documentsRepository.listByApplication(app.id),
        checksRepository.listByApplication(app.id),
        auditRepository.listByApplication(app.id),
      ]);

      const blockers = checks.filter((c) => c.severity === "blocker" && c.result !== "pass").length;
      const warnings = checks.filter((c) => c.severity === "warning" && c.result !== "pass").length;
      const passed = checks.filter((c) => c.result === "pass").length;
      const total = checks.length;
      const earningMembers = members.filter((m) => m.isEarning).length;

      // Determine next step
      let nextStep = "";
      let nextHref = "";
      if (app.status === "draft") {
        nextStep = "Upload documents";
        nextHref = `/applications/${app.id}/documents`;
      } else if (blockers > 0) {
        nextStep = `Fix ${blockers} issue${blockers > 1 ? "s" : ""}`;
        nextHref = `/applications/${app.id}/checks`;
      } else if (warnings > 0) {
        nextStep = `Review ${warnings} item${warnings > 1 ? "s" : ""}`;
        nextHref = `/applications/${app.id}/checks`;
      } else if (app.status === "ready") {
        nextStep = "Review packet";
        nextHref = `/applications/${app.id}/packet`;
      } else if (app.status === "submitted") {
        nextStep = "View packet";
        nextHref = `/applications/${app.id}/packet`;
      } else {
        nextStep = "Continue";
        nextHref = `/applications/${app.id}/documents`;
      }

      // Last activity from audit
      const lastEvent = latestAudit[0];
      let lastActivity = "";
      if (lastEvent) {
        const mins = Math.round((Date.now() - new Date(lastEvent.createdAt).getTime()) / 60000);
        if (mins < 1) lastActivity = "Just now";
        else if (mins < 60) lastActivity = `${mins} min ago`;
        else if (mins < 1440) lastActivity = `${Math.round(mins / 60)} hours ago`;
        else lastActivity = `${Math.round(mins / 1440)} days ago`;
      }

      // Determine step progress
      let stepProgress = 0;
      if (app.status === "draft") stepProgress = docs.length > 0 ? 2 : 1;
      else if (app.status === "checking" || app.status === "blocked") stepProgress = 3;
      else if (app.status === "ready") stepProgress = 4;
      else if (app.status === "submitted") stepProgress = 5;

      return {
        id: app.id,
        citizenName: app.citizenName,
        status: app.status,
        createdAt: app.createdAt,
        stateId: app.stateId,
        stateName: state?.name ?? app.stateId,
        portalName: state?.portalName ?? "",
        serviceId: app.serviceId,
        serviceName: service?.name ?? app.serviceId,
        serviceCategory: service?.category ?? "certificate",
        memberCount: members.length,
        earningMembers,
        docCount: docs.length,
        checksTotal: total,
        checksPassed: passed,
        blockers,
        warnings,
        nextStep,
        nextHref,
        lastActivity,
        stepProgress,
      };
    })
  );

  return Response.json(enriched);
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
