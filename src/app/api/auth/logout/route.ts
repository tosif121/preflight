import { getSessionToken, clearSessionCookie } from "@/lib/auth/server";
import { sessionsRepository } from "@/lib/repositories/sessions.repository";

export async function POST() {
  const token = await getSessionToken();
  if (token) {
    await sessionsRepository.deleteById(token);
  }
  await clearSessionCookie();
  return Response.json({ message: "Logged out" });
}
