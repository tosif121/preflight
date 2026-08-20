import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/server";
import { documentsRepository } from "@/lib/repositories/documents.repository";
import { getPresignedUrl } from "@/lib/s3";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { docId } = await params;
  const doc = await documentsRepository.findById(docId);
  if (!doc) return Response.json({ error: "Not found" }, { status: 404 });

  if (doc.s3Key) {
    const url = await getPresignedUrl(doc.s3Key);
    return Response.json({ url });
  }

  return Response.json({ url: doc.mockImageUrl });
}
