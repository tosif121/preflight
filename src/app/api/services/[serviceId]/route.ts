import { NextRequest } from "next/server";
import { servicesRepository } from "@/lib/repositories/services.repository";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  const { serviceId } = await params;
  const service = await servicesRepository.findById(serviceId);
  if (!service) {
    return Response.json({ error: "Service not found" }, { status: 404 });
  }
  return Response.json(service);
}
