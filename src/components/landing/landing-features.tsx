"use client";

import {
  ScanLine,
  FileCheck,
  ShieldCheck,
  AlertTriangle,
  Zap,
  RotateCcw,
  Eye,
  FileText,
  CheckCircle2,
  MapPin,
} from "lucide-react";

const FEATURES = [
  {
    icon: MapPin,
    title: "Multi-State Support",
    description:
      "Rajasthan, Uttar Pradesh, Karnataka — and more coming. Each state gets its own rule pack and service catalog.",
    color: "text-[#C85A40]",
    bg: "bg-[#C85A40]/10",
  },
  {
    icon: ScanLine,
    title: "AI OCR Extraction",
    description:
      "Vision model reads identity proofs, salary slips, and ITRs — extracts names, addresses, and amounts automatically.",
    color: "text-blue-600",
    bg: "bg-blue-500/10",
  },
  {
    icon: FileCheck,
    title: "Completeness Check",
    description:
      "Every earning family member must have income proof. Preflight catches gaps before submission.",
    color: "text-[#4A7A59]",
    bg: "bg-[#4A7A59]/10",
  },
  {
    icon: AlertTriangle,
    title: "Name & Address Consistency",
    description:
      "Cross-references names and addresses across identity proof, income proof, and address proof documents.",
    color: "text-[#F59E0B]",
    bg: "bg-[#F59E0B]/10",
  },
  {
    icon: Zap,
    title: "Document Quality Scoring",
    description:
      "Flags blurry or low-confidence scans so you can re-upload clearer documents before the department rejects them.",
    color: "text-[#C85A40]",
    bg: "bg-[#C85A40]/10",
  },
  {
    icon: RotateCcw,
    title: "Live Re-checking",
    description:
      "Fix an issue, re-run checks instantly. The readiness score updates in real time.",
    color: "text-[#5B6FA6]",
    bg: "bg-[#5B6FA6]/10",
  },
  {
    icon: Eye,
    title: "Reviewer Evidence Trail",
    description:
      "Structured audit log showing claim, evidence, rule, and result for every field — ready for department review.",
    color: "text-[#C85A40]",
    bg: "bg-[#C85A40]/10",
  },
  {
    icon: ShieldCheck,
    title: "Advisory Only",
    description:
      "Preflight never claims official verification. It is a quality gate — final authority stays with the Tehsildar.",
    color: "text-[#4A7A59]",
    bg: "bg-[#4A7A59]/10",
  },
  {
    icon: FileText,
    title: "Rule Pack Pattern",
    description:
      "State-specific rule packs. One engine, many services. Today Rajasthan Income Certificate — tomorrow any certificate.",
    color: "text-[#A0522D]",
    bg: "bg-[#A0522D]/10",
  },
];

export default function LandingFeatures() {
  return (
    <section
      id="features"
      className="bg-[#FCF8F4] border-t border-[#EAE5DC]"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="rounded-[28px] border border-[#EEDFD5] bg-gradient-to-b from-[#FCFBFA] to-[#F8F4F0] px-6 py-10 shadow-[0_12px_40px_rgba(200,90,64,0.06)]">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#FED7C9] text-[11px] font-semibold text-[#C85A40] tracking-[0.15em] uppercase shadow-sm mb-5">
              <ShieldCheck size={13} />
              Complete Package
            </div>

            <h2
              className="font-bold tracking-tight leading-tight text-[#050505] mb-3"
              style={{ fontSize: "clamp(22px, 3.8vw, 40px)" }}
            >
              Everything You Need to{" "}
              <span className="text-[#C85A40]">Submit Clean</span>
            </h2>

            <p className="text-[#62605D] text-base max-w-xl mx-auto leading-relaxed">
              OCR extraction, cross-document consistency, completeness coverage,
              quality scoring, and a reviewer audit trail — all in one tool.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group flex gap-4 p-5 bg-white border border-[#EAE5DC] rounded-2xl hover:border-[#FED7C9] hover:shadow-[0_8px_24px_rgba(200,90,64,0.07)] hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div
                    className={`w-11 h-11 ${feature.bg} rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300`}
                  >
                    <Icon
                      size={20}
                      className={feature.color}
                      strokeWidth={1.5}
                    />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-[#1C1B1A] mb-1 group-hover:text-[#C85A40] transition-colors duration-200">
                      {feature.title}
                    </h3>
                    <p className="text-[13px] text-[#62605D] leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
