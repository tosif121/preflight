import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/server";
import { resolveIssueSchema } from "@/lib/schemas";
import { resolutionsRepository } from "@/lib/repositories/resolutions.repository";
import { auditRepository } from "@/lib/repositories/audit.repository";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const parsed = resolveIssueSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { checkId } = parsed.data;

  const existing = await resolutionsRepository.findByCheckId(checkId);
  if (existing) {
    return Response.json({ error: "Already resolved" }, { status: 400 });
  }

  const resolution = await resolutionsRepository.create({
    checkId,
    plainLanguageFix: "Operator has reviewed and resolved this issue.",
  });

  await resolutionsRepository.markResolved(resolution.id);

  await auditRepository.logEvent(id, "check_resolved", {
    checkId,
    resolutionId: resolution.id,
  });

  return Response.json({ resolution });
}
