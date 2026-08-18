import { statesRepository } from "@/lib/repositories/states.repository";

export async function GET() {
  const allStates = await statesRepository.listAll();
  return Response.json(allStates);
}
