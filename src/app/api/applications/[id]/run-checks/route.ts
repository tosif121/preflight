import { NextRequest } from "next/server";
import { applicationsRepository } from "@/lib/repositories/applications.repository";
import { familyMembersRepository } from "@/lib/repositories/family-members.repository";
import { documentsRepository } from "@/lib/repositories/documents.repository";
import { checksRepository } from "@/lib/repositories/checks.repository";
import { auditRepository } from "@/lib/repositories/audit.repository";
import { evaluateRules } from "@/lib/rules/engine";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const application = await applicationsRepository.getApplicationById(id);
  if (!application) {
    return Response.json({ error: "Application not found" }, { status: 404 });
  }

  const members = await familyMembersRepository.listByApplication(id);
  const docs = await documentsRepository.listByApplication(id);

  await checksRepository.clearChecks(id);

  const ruleResults = evaluateRules(
    application.state,
    application.serviceId,
    members,
    docs.map((d) => ({
      id: d.id,
      familyMemberId: d.familyMemberId,
      docType: d.docType,
      mockFileName: d.mockFileName,
      ocrConfidence: d.ocrConfidence,
      extractedData: d.extractedData as unknown,
    })),
    application.intendedUseDeadline
  );

  const insertedChecks = await checksRepository.bulkInsertChecks(
    id,
    ruleResults.map((r) => ({
      ruleId: r.ruleId,
      severity: r.severity,
      status: r.status,
      message: r.message,
    }))
  );

  const blockerCount = await checksRepository.getBlockerCount(id);
  const newStatus = blockerCount > 0 ? "blocked" : "ready";
  await applicationsRepository.updateApplicationStatus(id, newStatus);

  await auditRepository.logEvent(id, "checks_run", {
    totalChecks: ruleResults.length,
    blockers: blockerCount,
    warnings: ruleResults.filter(
      (r) => r.severity === "warning" && r.status !== "pass"
    ).length,
    readiness: newStatus,
    state: application.state,
    serviceId: application.serviceId,
  });

  const passed = ruleResults.filter((r) => r.status === "pass").length;
  const total = ruleResults.length;
  const warnings = ruleResults.filter(
    (r) => r.severity === "warning" && r.status !== "pass"
  ).length;

  return Response.json({
    checks: insertedChecks,
    readiness: { passed, total, blockers: blockerCount, warnings },
  });
}
