import { NextRequest } from "next/server";
import { applicationsRepository } from "@/lib/repositories/applications.repository";
import { checksRepository } from "@/lib/repositories/checks.repository";
import { auditRepository } from "@/lib/repositories/audit.repository";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const application = await applicationsRepository.getApplicationById(id);
  if (!application) {
    return Response.json({ error: "Application not found" }, { status: 404 });
  }

  if (application.status !== "ready") {
    return Response.json(
      {
        error:
          "Application is not ready for submission. Resolve all blockers first.",
      },
      { status: 400 }
    );
  }

  const blockerCount = await checksRepository.getBlockerCount(id);
  if (blockerCount > 0) {
    return Response.json(
      {
        error: `${blockerCount} blocker(s) remain. Resolve all blockers before submitting.`,
      },
      { status: 400 }
    );
  }

  await applicationsRepository.updateApplicationStatus(id, "submitted");

  await auditRepository.logEvent(id, "submitted_mock", {
    citizenName: application.citizenName,
    operatorName: application.operatorName,
    submittedAt: new Date().toISOString(),
    mockFee: "₹40",
  });

  return Response.json({
    message: "Application submitted (mock — no real government system contacted)",
    applicationId: id,
    status: "submitted",
  });
}
