import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/server";
import { uploadDocumentSchema } from "@/lib/schemas";
import { applicationsRepository } from "@/lib/repositories/applications.repository";
import { documentsRepository } from "@/lib/repositories/documents.repository";
import { auditRepository } from "@/lib/repositories/audit.repository";
import { extractOcr } from "@/lib/ai/ocr";
import { normalizeOcrOutput } from "@/lib/normalizer";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const parsed = uploadDocumentSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const application = await applicationsRepository.findById(id);
  if (!application) {
    return Response.json({ error: "Application not found" }, { status: 404 });
  }

  const { docType, familyMemberId, mockFileName } = parsed.data;
  const mockImageUrl = `/mock-docs/${mockFileName}`;

  const doc = await documentsRepository.add({
    applicationId: id,
    familyMemberId: familyMemberId ?? null,
    docType,
    mockFileName,
    mockImageUrl,
  });

  const ocrResult = await extractOcr(mockFileName, docType);
  const normalized = normalizeOcrOutput(
    Object.fromEntries(
      Object.entries(ocrResult.fields).map(([k, v]) => [k, v.value])
    )
  );

  const extractedData: Record<string, unknown> = {
    ...Object.fromEntries(
      Object.entries(ocrResult.fields).map(([k, v]) => [k, v.value])
    ),
    normalized,
  };

  await documentsRepository.updateOcrResult(doc.id, {
    ocrStatus: "complete",
    ocrConfidence: ocrResult.overallConfidence,
    extractedData,
  });

  await auditRepository.logEvent(id, "document_uploaded", {
    documentId: doc.id,
    docType,
    mockFileName,
    ocrConfidence: ocrResult.overallConfidence,
  });

  const updatedDoc = await documentsRepository.findById(doc.id);
  return Response.json({ document: updatedDoc });
}
