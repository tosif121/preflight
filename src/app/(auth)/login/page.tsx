"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Phone, KeyRound, User, ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { setAuthUser, type UserRole } from "@/lib/auth/client";
import { STATES } from "@/lib/config/catalog";

type Step = "phone" | "otp" | "role" | "state";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("operator");
  const [stateId, setStateId] = useState("");

  const handlePhoneSubmit = () => {
    if (phone.length < 10) return;
    setStep("otp");
  };

  const handleOtpSubmit = () => {
    if (otp === "123456") {
      setOtpError("");
      setStep("role");
    } else {
      setOtpError("Invalid OTP. Use 123456 for demo.");
    }
  };

  const handleRoleSubmit = () => {
    if (!name.trim()) return;
    setStep("state");
  };

  const handleStateSubmit = () => {
    if (!stateId) return;
    const userId = `usr_${Date.now()}`;
    setAuthUser({
      id: userId,
      phone,
      name: name.trim(),
      role,
      stateId,
    });
    router.push("/dashboard");
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
              {step === "phone" && "Enter your phone number"}
              {step === "otp" && "Verify OTP"}
              {step === "role" && "Select your role"}
              {step === "state" && "Select your state"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                  onClick={handlePhoneSubmit}
                  disabled={phone.length < 10}
                  className="w-full bg-[#C85A40] hover:bg-[#A84C36] text-white"
                >
                  Send OTP
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <p className="text-xs text-center text-[#B0ACA8]">
                  Demo OTP: <span className="font-mono font-bold">123456</span>
                </p>
              </>
            )}

            {step === "otp" && (
              <>
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
                      className="pl-10 font-mono text-lg tracking-widest"
                      maxLength={6}
                    />
                  </div>
                  {otpError && (
                    <p className="text-xs text-[#C85A40] mt-1">{otpError}</p>
                  )}
                </div>
                <Button
                  onClick={handleOtpSubmit}
                  disabled={otp.length < 6}
                  className="w-full bg-[#C85A40] hover:bg-[#A84C36] text-white"
                >
                  Verify
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <p className="text-xs text-center text-[#B0ACA8]">
                  OTP sent to +91 {phone}
                </p>
              </>
            )}

            {step === "role" && (
              <>
                <div>
                  <Label htmlFor="name">Your Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#B0ACA8]" />
                    <Input
                      id="name"
                      placeholder="e.g. Amit Verma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label>I am a</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {([
                      { value: "operator", label: "Service Operator", desc: "File applications for citizens" },
                      { value: "citizen", label: "Citizen", desc: "Submit my own application" },
                    ] as const).map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setRole(opt.value)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          role === opt.value
                            ? "border-[#C85A40] bg-[#C85A40]/5"
                            : "border-[#EAE5DC] hover:border-[#C85A40]/30"
                        }`}
                      >
                        <p className="text-sm font-bold text-[#1C1B1A]">{opt.label}</p>
                        <p className="text-xs text-[#7A7771] mt-1">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <Button
                  onClick={handleRoleSubmit}
                  disabled={!name.trim()}
                  className="w-full bg-[#C85A40] hover:bg-[#A84C36] text-white"
                >
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </>
            )}

            {step === "state" && (
              <>
                <div>
                  <Label>Select State</Label>
                  <div className="space-y-2 mt-2">
                    {STATES.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setStateId(s.id)}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                          stateId === s.id
                            ? "border-[#C85A40] bg-[#C85A40]/5"
                            : "border-[#EAE5DC] hover:border-[#C85A40]/30"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <MapPin className="h-4 w-4 text-[#C85A40]" />
                          <div>
                            <p className="text-sm font-bold text-[#1C1B1A]">{s.name}</p>
                            <p className="text-xs text-[#7A7771]">
                              {s.services.filter((sv) => sv.enabled).length} service(s) available
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <Button
                  onClick={handleStateSubmit}
                  disabled={!stateId}
                  className="w-full bg-[#C85A40] hover:bg-[#A84C36] text-white"
                >
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
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
