"use client";

import { ArrowRight, CheckCircle2, ShieldCheck, FileSearch, MapPin } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { STATES } from "@/lib/config/catalog";

const POINTS = [
  "Catch document errors before submission",
  "AI-powered OCR with plain-language fixes",
  "Zero blockers = ready to submit",
];

export default function LandingHero() {
  return (
    <section className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 flex flex-col justify-center overflow-hidden">
      <div className="relative grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
        <div className="order-2 lg:order-1">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#EAE5DC] text-[13px] font-medium text-[#C85A40] mb-7 tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C85A40] animate-pulse" />
            Pre-submission quality checks — {STATES.length} states
          </div>

          <h1
            className="font-bold tracking-tight leading-[1.08] text-[#1C1B1A] mb-5"
            style={{ fontSize: "clamp(32px, 5.5vw, 64px)" }}
          >
            Submit with
            <br />
            <span className="relative inline-block text-[#C85A40]">
              Confidence.
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
            Preflight catches completeness and consistency problems in your
            government service applications before they go to the department.
            Fix issues now, not after rejection.
          </p>

          <div className="flex flex-col gap-2.5 mb-8">
            {POINTS.map((p, i) => (
              <div
                key={i}
                className="flex items-center gap-3 text-sm font-semibold text-[#333230]/70"
              >
                <span className="w-5 h-5 rounded-full bg-[#F0F7F3] flex items-center justify-center shrink-0">
                  <CheckCircle2 size={13} className="text-[#4A7A59]" />
                </span>
                {p}
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8 sm:max-w-xl">
            <Link href="/login">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-[#C85A40] hover:bg-[#A84C36] text-white shadow-[0_4px_16px_rgba(200,90,64,0.35)] hover:shadow-[0_6px_20px_rgba(200,90,64,0.45)] transition-all"
              >
                <FileSearch className="h-4 w-4 mr-2" />
                Get Started
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>

            <Link href="/login">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-[#EAE5DC] text-[#1C1B1A] hover:bg-[#F5F2EB]"
              >
                View Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {STATES.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#EAE5DC] text-xs font-medium text-[#7A7771]"
              >
                <MapPin size={11} className="text-[#C85A40]" />
                {s.name}
              </div>
            ))}
          </div>
        </div>

        <div className="order-1 lg:order-2 flex items-center justify-center lg:justify-end">
          <div className="relative w-full max-w-[500px] lg:max-w-none">
            <div className="rounded-3xl border border-[#EAE5DC] bg-[#FCF8F4] p-6 sm:p-8 shadow-[0_12px_40px_rgba(200,90,64,0.06)]">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-[#C85A40]/10 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-[#C85A40]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1C1B1A]">
                    Preflight Score
                  </p>
                  <p className="text-xs text-[#7A7771]">
                    Family Income Certificate
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {[
                  { label: "Name Consistency", color: "bg-[#C85A40]" },
                  { label: "Income Coverage", color: "bg-[#C85A40]" },
                  { label: "Address Consistency", color: "bg-[#F59E0B]" },
                  { label: "Document Quality", color: "bg-[#4A7A59]" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between p-3 rounded-lg border border-[#EAE5DC] bg-white"
                  >
                    <span className="text-sm text-[#1C1B1A]">
                      {item.label}
                    </span>
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${item.color}`}
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-[#C85A40]/5 border border-[#C85A40]/20">
                <span className="text-sm font-medium text-[#1C1B1A]">
                  Readiness
                </span>
                <span className="text-sm font-bold text-[#C85A40]">
                  12/14 — 2 blockers
                </span>
              </div>
            </div>

            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#C85A40]/10 rounded-full blur-2xl" />
            <div className="absolute -top-4 -left-4 w-16 h-16 bg-[#C85A40]/5 rounded-full blur-xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
