import { NextRequest } from "next/server";
import { rulePacksRepository } from "@/lib/repositories/rule-packs.repository";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  const { serviceId } = await params;
  const pack = await rulePacksRepository.getLatestPublished(serviceId);
  if (!pack) {
    return Response.json({ error: "No published rule pack found" }, { status: 404 });
  }
  return Response.json(pack);
}
