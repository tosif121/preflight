import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { operatorsRepository } from "@/lib/repositories/operators.repository";
import { sessionsRepository } from "@/lib/repositories/sessions.repository";

const SESSION_COOKIE = "preflight_session";
const SESSION_MAX_AGE = 7 * 24 * 60 * 60;

const schema = z.object({
  phone: z.string().length(10),
  code: z.string().length(6),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: "Invalid phone or OTP" }, { status: 400 });
    }

    const { phone } = parsed.data;

    const operator = await operatorsRepository.upsert(phone);
    const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);
    const session = await sessionsRepository.create(operator.id, expiresAt);

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });

    return Response.json({
      ok: true,
      operator: { id: operator.id, phone: operator.phone, role: operator.role },
    });
  } catch (err) {
    console.error("Auth verify error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Sign in failed" },
      { status: 500 }
    );
  }
}
