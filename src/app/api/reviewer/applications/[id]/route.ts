import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/server";
import { applicationsRepository } from "@/lib/repositories/applications.repository";
import { familyMembersRepository } from "@/lib/repositories/family-members.repository";
import { documentsRepository } from "@/lib/repositories/documents.repository";
import { checksRepository } from "@/lib/repositories/checks.repository";
import { resolutionsRepository } from "@/lib/repositories/resolutions.repository";
import { auditRepository } from "@/lib/repositories/audit.repository";

export async function GET(
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

  const members = await familyMembersRepository.listByApplication(id);
  const docs = await documentsRepository.listByApplication(id);
  const checks = await checksRepository.listByApplication(id);
  const resolutions = await resolutionsRepository.listByApplication(id);
  const audit = await auditRepository.listByApplication(id);

  return Response.json({
    application,
    members,
    documents: docs,
    checks,
    resolutions,
    auditEvents: audit,
  });
}
