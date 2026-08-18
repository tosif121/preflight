import { cookies } from "next/headers";
import { sessionsRepository } from "@/lib/repositories/sessions.repository";

const SESSION_COOKIE = "preflight_session";
const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}

export async function getCurrentUser() {
  const token = await getSessionToken();
  if (!token) return null;

  const result = await sessionsRepository.findByIdWithOperator(token);
  if (!result) return null;

  if (new Date(result.session.expiresAt) < new Date()) {
    await sessionsRepository.deleteById(result.session.id);
    return null;
  }

  return result.operator;
}

export async function setSessionCookie(sessionId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export { SESSION_COOKIE, SESSION_MAX_AGE };
