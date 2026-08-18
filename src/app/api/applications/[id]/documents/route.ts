import { NextRequest } from "next/server";
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
  const { id } = await params;
  const body = await request.json();
  const parsed = uploadDocumentSchema.safeParse(body);

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

  const { docType, familyMemberId, mockFileName } = parsed.data;
  const mockImageUrl = `/mock-docs/${mockFileName}`;

  const doc = await documentsRepository.addDocument({
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

  await documentsRepository.updateOcrResult({
    id: doc.id,
    ocrStatus: "complete",
    ocrConfidence: ocrResult.overallConfidence,
    extractedData,
  });

  await auditRepository.logEvent(id, "documents_uploaded", {
    documentId: doc.id,
    docType,
    mockFileName,
    ocrConfidence: ocrResult.overallConfidence,
  });

  const updatedDoc = await documentsRepository.listByApplication(id);
  return Response.json({ document: updatedDoc.find((d) => d.id === doc.id) });
}
