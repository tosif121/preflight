import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/server";
import { applicationsRepository } from "@/lib/repositories/applications.repository";
import { auditRepository } from "@/lib/repositories/audit.repository";

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

  await applicationsRepository.updateStatus(id, "submitted");

  await auditRepository.logEvent(id, "application_submitted", {
    submittedBy: user.id,
  });

  return Response.json({ message: "Application submitted (mock)", applicationId: id });
}
