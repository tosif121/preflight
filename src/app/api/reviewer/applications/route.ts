import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/server";
import { applicationsRepository } from "@/lib/repositories/applications.repository";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const apps = await applicationsRepository.listAll();
  return Response.json(apps);
}
