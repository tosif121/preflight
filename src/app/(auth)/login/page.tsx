"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Phone, KeyRound, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Step = "phone" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [demoCode, setDemoCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (phone.length < 10) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send OTP");
      setDemoCode(data.demo_code);
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Verification failed");
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#C85A40] flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-[#1C1B1A]">
              Pre<span className="text-[#C85A40]">flight</span>
            </span>
          </div>
          <p className="text-sm text-[#7A7771]">
            Pre-submission quality checks for government services
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {step === "phone" ? "Enter your phone number" : "Enter OTP"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-[#C85A40]/10 border border-[#C85A40]/20 text-sm text-[#C85A40]">
                {error}
              </div>
            )}

            {step === "phone" && (
              <>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#B0ACA8]" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      className="pl-10"
                      maxLength={10}
                    />
                  </div>
                </div>
                <Button
                  onClick={handleSendOtp}
                  disabled={phone.length < 10 || loading}
                  className="w-full bg-[#C85A40] hover:bg-[#A84C36] text-white"
                >
                  {loading ? "Sending..." : "Send OTP"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <div className="p-3 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/20">
                  <p className="text-xs font-medium text-[#F59E0B]">
                    Demo mode: No real SMS sent. OTP will be shown on the next screen.
                  </p>
                </div>
              </>
            )}

            {step === "otp" && (
              <>
                {demoCode && (
                  <div className="p-4 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-center">
                    <p className="text-xs font-medium text-[#F59E0B] mb-1">
                      Demo Mode — SMS is mocked
                    </p>
                    <p className="text-2xl font-mono font-bold text-[#1C1B1A] tracking-widest">
                      {demoCode}
                    </p>
                    <p className="text-xs text-[#7A7771] mt-1">
                      Use this code to sign in
                    </p>
                  </div>
                )}
                <div>
                  <Label htmlFor="otp">One-Time Password</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#B0ACA8]" />
                    <Input
                      id="otp"
                      type="text"
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="pl-10 font-mono text-lg tracking-widest text-center"
                      maxLength={6}
                    />
                  </div>
                </div>
                <Button
                  onClick={handleVerifyOtp}
                  disabled={otp.length < 6 || loading}
                  className="w-full bg-[#C85A40] hover:bg-[#A84C36] text-white"
                >
                  {loading ? "Verifying..." : "Verify & Sign In"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <button
                  onClick={() => { setStep("phone"); setOtp(""); setDemoCode(""); setError(""); }}
                  className="text-sm text-[#7A7771] hover:text-[#C85A40] w-full text-center"
                >
                  Change phone number
                </button>
              </>
            )}
          </CardContent>
        </Card>

        <p className="text-xs text-center text-[#B0ACA8] mt-6">
          Independent hackathon prototype — not a government system.
        </p>
      </div>
    </div>
  );
}
