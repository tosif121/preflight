"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, KeyRound, ArrowRight, ShieldCheck } from "lucide-react";

interface SignInModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SignInModal({ open: controlledOpen, onOpenChange }: SignInModalProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setPhone("");
    setOtp("");
    setStep("phone");
    setError("");
  };

  const handleSendOtp = async () => {
    if (phone.length < 10) return;
    setStep("otp");
  };

  const handleVerify = async () => {
    if (otp.length < 6) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Sign in failed");
      setOpen(false);
      reset();
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#C85A40] flex items-center justify-center">
              <ShieldCheck className="h-4 w-4 text-white" />
            </div>
            Sign in
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {error && (
            <div className="p-3 rounded-lg bg-[#C85A40]/10 border border-[#C85A40]/20 text-sm text-[#C85A40]">
              {error}
            </div>
          )}

          {step === "phone" && (
            <>
              <div>
                <Label htmlFor="modal-phone">Mobile Number</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-[#7A7771]">
                    +91
                  </span>
                  <Input
                    id="modal-phone"
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="pl-12"
                    maxLength={10}
                  />
                </div>
              </div>
              <Button
                onClick={handleSendOtp}
                disabled={phone.length < 10 || loading}
                className="w-full bg-[#C85A40] hover:bg-[#A84C36] text-white"
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </>
          )}

          {step === "otp" && (
            <>
              <div>
                <Label htmlFor="modal-otp">Enter OTP</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#B0ACA8]" />
                  <Input
                    id="modal-otp"
                    type="text"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="pl-10 font-mono text-lg tracking-widest text-center"
                    maxLength={6}
                  />
                </div>
              </div>
              <Button
                onClick={handleVerify}
                disabled={otp.length < 6 || loading}
                className="w-full bg-[#C85A40] hover:bg-[#A84C36] text-white"
              >
                {loading ? "Verifying..." : "Sign In"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <button
                onClick={() => { setStep("phone"); setOtp(""); setError(""); }}
                className="text-sm text-[#7A7771] hover:text-[#C85A40] w-full text-center"
              >
                Change number
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
