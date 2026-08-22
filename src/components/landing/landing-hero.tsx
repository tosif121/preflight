"use client";

import { useState } from "react";
import {
  ArrowRight,
  Check,
  AlertTriangle,
  FileText,
  Sparkles,
  RefreshCw,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignInModal } from "@/components/sign-in-modal";

const FLOW_STEPS = [
  { icon: FileText, label: "Documents" },
  { icon: Sparkles, label: "AI reads" },
  { icon: AlertTriangle, label: "Problem found" },
  { icon: ArrowRight, label: "Fix" },
  { icon: RefreshCw, label: "Re-check" },
  { icon: Check, label: "Ready" },
];

export default function LandingHero() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 flex flex-col justify-center overflow-hidden">
      <div className="relative grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
        <div className="order-2 lg:order-1">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#C85A40]/8 border border-[#C85A40]/15 text-xs font-medium text-[#C85A40] mb-5">
            <Zap size={12} />
            Pre-submission copilot for UMANG
          </div>

          <h1
            className="font-bold tracking-tight leading-[1.08] text-[#1C1B1A] mb-5"
            style={{ fontSize: "clamp(32px, 5.5vw, 64px)" }}
          >
            Know what&apos;s wrong
            <br />
            <span className="relative inline-block text-[#C85A40]">
              before you submit.
              <svg
                className="absolute -bottom-1 left-0 w-full text-[#C85A40]/25"
                height="6"
                viewBox="0 0 300 6"
                fill="none"
                preserveAspectRatio="none"
              >
                <path
                  d="M1 5C60 1.5 180 0.5 299 4"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="text-[15px] text-[#7A7771] max-w-[420px] leading-relaxed mb-7">
            Bring the documents you already have. Preflight checks your
            application before submission, explains problems in plain
            language, and guides you through fixing them.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6 sm:max-w-xl">
            <Button
              size="lg"
              onClick={() => setModalOpen(true)}
              className="w-full sm:w-auto bg-[#C85A40] hover:bg-[#A84C36] text-white shadow-[0_4px_16px_rgba(200,90,64,0.35)] hover:shadow-[0_6px_20px_rgba(200,90,64,0.45)] transition-all py-3 px-6 text-base"
            >
              Start with Preflight
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => setModalOpen(true)}
              className="w-full sm:w-auto border-[#EAE5DC] text-[#1C1B1A] hover:bg-[#F5F2EB] py-3 px-6 text-base"
            >
              Try 2-minute demo
            </Button>
          </div>

          <p className="text-xs text-[#B0ACA8] mb-8">
            Demo: enter any phone number and any 6-digit code to sign in.
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xs text-[#7A7771]">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FCF8F4] border border-[#EAE5DC]">
              <Sparkles size={11} className="text-[#C85A40]" />
              Powered by OpenAI Vision
            </span>
            <span className="text-[#B0ACA8]">|</span>
            <span>Synthetic data only. Not a government service.</span>
          </div>
        </div>

        <div className="order-1 lg:order-2 flex items-center justify-center lg:justify-end">
          <div className="w-full max-w-[500px]">
            <div className="rounded-2xl border border-[#EAE5DC] bg-white p-6 shadow-sm">
              <div className="text-xs font-semibold text-[#7A7771] uppercase tracking-wider mb-4">
                How Preflight works
              </div>
              <div className="flex flex-col gap-3">
                {FLOW_STEPS.map((step, i) => {
                  const Icon = step.icon;
                  const isProblem = step.label === "Problem found";
                  const isReady = step.label === "Ready";
                  return (
                    <div key={i}>
                      <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${
                        isReady
                          ? "bg-[#F0F7F3] border border-[#4A7A59]/20"
                          : isProblem
                          ? "bg-[#FEF7E8] border border-[#F59E0B]/20"
                          : "bg-[#FCF8F4] border border-[#EAE5DC]"
                      }`}>
                        <Icon size={16} className={
                          isReady
                            ? "text-[#4A7A59]"
                            : isProblem
                            ? "text-[#F59E0B]"
                            : "text-[#C85A40]"
                        } />
                        <span className={`text-sm font-medium ${
                          isReady
                            ? "text-[#4A7A59]"
                            : isProblem
                            ? "text-[#92600A]"
                            : "text-[#1C1B1A]"
                        }`}>
                          {step.label}
                        </span>
                        {isReady && (
                          <Check size={14} className="text-[#4A7A59] ml-auto" />
                        )}
                      </div>
                      {i < FLOW_STEPS.length - 1 && (
                        <div className="flex justify-center py-0.5">
                          <div className="w-px h-2 bg-[#EAE5DC]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-3 border-t border-[#EAE5DC] text-[11px] text-[#B0ACA8] text-center">
                Verified before you submit to UMANG
              </div>
            </div>
          </div>
        </div>
      </div>

      <SignInModal open={modalOpen} onOpenChange={setModalOpen} />
    </section>
  );
}
