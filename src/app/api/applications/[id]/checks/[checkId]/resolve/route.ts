import { NextRequest } from "next/server";
import { resolveIssueSchema } from "@/lib/schemas";
import { checksRepository } from "@/lib/repositories/checks.repository";
import { resolutionsRepository } from "@/lib/repositories/resolutions.repository";
import { applicationsRepository } from "@/lib/repositories/applications.repository";
import { auditRepository } from "@/lib/repositories/audit.repository";
import { generateResolution } from "@/lib/ai/resolution";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; checkId: string }> }
) {
  const { id, checkId } = await params;
  const body = await request.json();
  const parsed = resolveIssueSchema.safeParse({ ...body, checkId });

  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const application = await applicationsRepository.getApplicationById(id);
  if (!application) {
    return Response.json({ error: "Application not found" }, { status: 404 });
  }

  const allChecks = await checksRepository.listByApplication(id);
  const check = allChecks.find((c) => c.id === checkId);
  if (!check) {
    return Response.json({ error: "Check not found" }, { status: 404 });
  }

  let resolution = await resolutionsRepository.findByCheckId(checkId);
  if (!resolution) {
    const fixResult = await generateResolution(check.ruleId, check.message);
    resolution = await resolutionsRepository.createResolution({
      checkId,
      plainLanguageFix: fixResult.plainLanguageFix,
    });
  }

  await resolutionsRepository.markResolved(resolution.id);

  await auditRepository.logEvent(id, "issue_resolved", {
    checkId,
    ruleId: check.ruleId,
    resolutionId: resolution.id,
  });

  const blockerCount = await checksRepository.getBlockerCount(id);
  if (blockerCount === 0 && application.status !== "submitted") {
    await applicationsRepository.updateApplicationStatus(id, "ready");
  }

  return Response.json({ resolution });
}
