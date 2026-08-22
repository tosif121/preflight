"use client";

import { useState } from "react";
import { HelpCircle, Plus, Minus } from "lucide-react";

interface FAQ {
  q: string;
  a: string;
}

const FAQS: FAQ[] = [
  {
    q: "What is Preflight?",
    a: "Preflight is a pre-submission quality checker for the Rajasthan Family Income Certificate (issued via eMitra). It catches completeness, consistency, and document quality problems before you submit to the department.",
  },
  {
    q: "Does Preflight officially verify my application?",
    a: "No. Preflight is an advisory tool only. It runs pre-submission checks and gives you fix instructions, but final verification and approval always stay with the department (Tehsildar).",
  },
  {
    q: "What checks does it run?",
    a: "Name consistency across documents, address consistency, income proof coverage for every earning family member, certificate validity period, and document image quality (OCR confidence).",
  },
  {
    q: "Do I need an OpenAI API key?",
    a: "No. When OPENAI_API_KEY is not set, Preflight uses deterministic mock OCR responses so the full experience works without any API key. When a key is set, it uses a real vision model for extraction.",
  },
  {
    q: "Can I use this for other certificate types?",
    a: "Currently only the Family Income Certificate rule pack is implemented. The rule engine is designed to support additional certificate types by adding new JSON rule packs.",
  },
  {
    q: "Is real personal data used?",
    a: "No. All documents and data are synthetic — fake names, masked ID numbers, and SVG placeholder images. No real Aadhaar/PAN numbers or personal data are used anywhere.",
  },
];

export default function LandingFAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const toggle = (i: number) => setActiveIndex(activeIndex === i ? null : i);

  return (
    <section
      id="faqs"
      className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 border-t border-[#EAE5DC]"
    >
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#FED7C9] text-[11px] font-semibold text-[#C85A40] tracking-[0.15em] uppercase shadow-sm mb-5">
          <HelpCircle size={13} />
          FAQ
        </div>

        <h2
          className="font-bold tracking-tight leading-[1.1] text-[#050505] mb-4"
          style={{ fontSize: "clamp(24px, 5vw, 44px)" }}
        >
          Got Questions?{" "}
          <span className="text-[#C85A40]">We Have Answers.</span>
        </h2>

        <p className="text-[#62605D] text-base md:text-lg leading-relaxed max-w-xl mx-auto">
          Everything you need to know about Preflight checks, rules, and data
          handling.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-3">
        {FAQS.map((faq, index) => {
          const isOpen = activeIndex === index;
          return (
            <div
              key={index}
              className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                isOpen
                  ? "bg-white border-[#C85A40] shadow-[0_12px_24px_rgba(200,90,64,0.06)]"
                  : "bg-white/70 border-[#EAE5DC] hover:border-[#FED7C9] hover:bg-white"
              }`}
            >
              <button
                onClick={() => toggle(index)}
                className="w-full px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C85A40]"
              >
                <span className="flex items-center gap-3 text-[15px] sm:text-[17px] font-semibold text-[#13110E] leading-snug">
                  <HelpCircle
                    size={18}
                    className={`shrink-0 transition-colors ${
                      isOpen ? "text-[#C85A40]" : "text-[#C8B4A8]"
                    }`}
                    strokeWidth={1.5}
                  />
                  {faq.q}
                </span>
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                    isOpen
                      ? "bg-[#C85A40]/10 text-[#C85A40]"
                      : "bg-[#F6F2EE] text-[#7A7771]"
                  }`}
                >
                  {isOpen ? <Minus size={15} /> : <Plus size={15} />}
                </span>
              </button>

              <div
                className={`transition-all duration-300 ease-in-out ${
                  isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                } overflow-hidden`}
              >
                <div className="px-5 sm:px-6 pb-5 pt-1 border-t border-[#F2ECE7] bg-[#FFFDFB]/50">
                  <p className="text-[14px] sm:text-[15px] leading-relaxed text-[#5C5752] pt-3">
                    {faq.a}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
