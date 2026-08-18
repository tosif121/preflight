import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/server";
import { applicationsRepository } from "@/lib/repositories/applications.repository";
import { familyMembersRepository } from "@/lib/repositories/family-members.repository";
import { documentsRepository } from "@/lib/repositories/documents.repository";
import { checksRepository } from "@/lib/repositories/checks.repository";
import { rulePacksRepository } from "@/lib/repositories/rule-packs.repository";
import { auditRepository } from "@/lib/repositories/audit.repository";
import { evaluateRules } from "@/lib/rules/engine";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const application = await applicationsRepository.findById(id);
  if (!application) {
    return Response.json({ error: "Application not found" }, { status: 404 });
  }

  if (!application.rulePackId) {
    return Response.json({ error: "No rule pack pinned" }, { status: 400 });
  }

  const rulePack = await rulePacksRepository.findById(application.rulePackId);
  if (!rulePack) {
    return Response.json({ error: "Rule pack not found" }, { status: 404 });
  }

  const members = await familyMembersRepository.listByApplication(id);
  const docs = await documentsRepository.listByApplication(id);

  await checksRepository.clearByApplication(id);

  const ruleResults = evaluateRules(
    rulePack.rules as Record<string, unknown>,
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

  const insertedChecks = await checksRepository.bulkInsert(
    id,
    ruleResults.map((r) => ({
      ruleId: r.ruleId,
      severity: r.severity,
      result: r.status,
      evidence: r.evidence ?? null,
      message: r.message,
    }))
  );

  const blockerCount = await checksRepository.getBlockerCount(id);
  const newStatus = blockerCount > 0 ? "blocked" : "ready";
  await applicationsRepository.updateStatus(id, newStatus);

  await auditRepository.logEvent(id, "checks_rerun", {
    rulePackVersion: rulePack.version,
    blockers: blockerCount,
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
