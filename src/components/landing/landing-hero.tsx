"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, FileSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignInModal } from "@/components/sign-in-modal";
import Image from "next/image";

const POINTS = [
  "Catch document errors before submission",
  "AI-powered OCR with plain-language fixes",
  "Zero blockers = ready to submit",
];

export default function LandingHero() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 flex flex-col justify-center overflow-hidden">
      <div className="relative grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
        <div className="order-2 lg:order-1">
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

          <div className="flex flex-col gap-4 mb-8">
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
            <Button
              size="lg"
              onClick={() => setModalOpen(true)}
              className="w-full sm:w-auto bg-[#C85A40] hover:bg-[#A84C36] text-white shadow-[0_4px_16px_rgba(200,90,64,0.35)] hover:shadow-[0_6px_20px_rgba(200,90,64,0.45)] transition-all py-3 px-6 text-base"
            >
              <FileSearch className="h-4 w-4 mr-2" />
              Get Started
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => setModalOpen(true)}
              className="w-full sm:w-auto border-[#EAE5DC] text-[#1C1B1A] hover:bg-[#F5F2EB] py-3 px-6 text-base"
            >
              View Dashboard
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>

        <div className="order-1 lg:order-2 flex items-center justify-center lg:justify-end">
          <div className="relative w-full max-w-[500px] lg:max-w-none">
            <div>
              <Image
                src="/images/hero.png"
                alt="Preflight — document verification dashboard"
                width={600}
                height={450}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      <SignInModal open={modalOpen} onOpenChange={setModalOpen} />
    </section>
  );
}
