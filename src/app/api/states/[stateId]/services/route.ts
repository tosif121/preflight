import { NextRequest } from "next/server";
import { servicesRepository } from "@/lib/repositories/services.repository";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ stateId: string }> }
) {
  const { stateId } = await params;
  const svcs = await servicesRepository.listByState(stateId);
  return Response.json(svcs);
}
