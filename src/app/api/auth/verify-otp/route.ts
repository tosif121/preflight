import { NextRequest } from "next/server";
import { verifyOtpSchema } from "@/lib/schemas";
import { otpRepository } from "@/lib/repositories/otp.repository";
import { operatorsRepository } from "@/lib/repositories/operators.repository";
import { sessionsRepository } from "@/lib/repositories/sessions.repository";
import { setSessionCookie } from "@/lib/auth/server";

const SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = verifyOtpSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { phone, code } = parsed.data;

  const otp = await otpRepository.getLatestUnconsumed(phone);
  if (!otp) {
    return Response.json({ error: "No OTP found. Request a new one." }, { status: 400 });
  }

  if (new Date(otp.expiresAt) < new Date()) {
    return Response.json({ error: "OTP expired. Request a new one." }, { status: 400 });
  }

  if (otp.code !== code) {
    return Response.json({ error: "Invalid OTP code." }, { status: 400 });
  }

  await otpRepository.markConsumed(otp.id);

  const operator = await operatorsRepository.upsert(phone);
  const session = await sessionsRepository.create(
    operator.id,
    new Date(Date.now() + SESSION_MAX_AGE)
  );

  await setSessionCookie(session.id);

  return Response.json({
    operator: {
      id: operator.id,
      phone: operator.phone,
      fullName: operator.fullName,
      role: operator.role,
    },
  });
}
