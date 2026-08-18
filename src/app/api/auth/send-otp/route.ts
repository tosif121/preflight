import { NextRequest } from "next/server";
import { requestOtpSchema } from "@/lib/schemas";
import { otpRepository } from "@/lib/repositories/otp.repository";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = requestOtpSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { phone } = parsed.data;
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await otpRepository.create(phone, code, expiresAt);

  return Response.json({
    message: "OTP sent",
    demo_code: code,
    demo_note: "Demo mode: SMS is mocked. Use the code shown here.",
  });
}
