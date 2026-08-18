"use client";

import Link from "next/link";
import { ShieldCheck, Copyright, Heart } from "lucide-react";

const PRODUCT_LINKS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "New Application", href: "/applications/new" },
  { label: "Features", href: "/#features" },
  { label: "How It Works", href: "/#how-it-works" },
];

const RESOURCE_LINKS = [
  { label: "FAQ", href: "/#faqs" },
  { label: "Rule Pack", href: "#" },
  { label: "API Docs", href: "#" },
];

export default function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-[#EAE5DC] bg-[#FCF8F4]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div>
            <Link href="/" className="flex items-center gap-2.5 mb-4 w-fit">
              <div className="w-9 h-9 rounded-xl bg-[#C85A40] flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-lg font-bold leading-none text-[#151310]">
                  Pre<span className="text-[#C85A40]">flight</span>
                </div>
                <div className="text-[9px] tracking-[0.1em] uppercase text-[#C85A40] mt-0.5">
                  Pre-submission Checker
                </div>
              </div>
            </Link>
            <p className="text-sm text-[#54504B] leading-relaxed max-w-[260px] mb-4">
              Application-quality preflight tool for Rajasthan eMitra services.
              Catch errors before submission.
            </p>
            <p className="text-xs text-[#B0ACA8]">
              Prototype — not a government system.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[#151310] mb-3">
              Product
            </h4>
            <div className="w-8 h-0.5 bg-[#C85A40] rounded-full mb-5" />
            <div className="space-y-2.5">
              {PRODUCT_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block text-sm text-[#433F3B] hover:text-[#C85A40] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[#151310] mb-3">
              Resources
            </h4>
            <div className="w-8 h-0.5 bg-[#C85A40] rounded-full mb-5" />
            <div className="space-y-2.5">
              {RESOURCE_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block text-sm text-[#433F3B] hover:text-[#C85A40] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[#151310] mb-3">
              Disclaimer
            </h4>
            <div className="w-8 h-0.5 bg-[#C85A40] rounded-full mb-5" />
            <p className="text-sm text-[#54504B] leading-relaxed">
              Preflight is an advisory pre-submission checker. It does not
              perform official government verification. Final authority stays
              with the department (Tehsildar).
            </p>
          </div>
        </div>

        <div className="border-t border-[#E9DED7] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-[#5C5752]">
          <div className="flex items-center gap-1.5">
            <Copyright size={13} />
            {currentYear} Preflight. Built for hackathon demo.
          </div>

          <div className="flex items-center gap-1">
            Made with{" "}
            <Heart
              size={12}
              className="text-red-500"
              fill="currentColor"
            />{" "}
            for Rajasthan eMitra
          </div>

          <div className="flex items-center gap-2">
            <span>Not a government service</span>
            <span className="text-[#D7CAC1]">|</span>
            <span>All data is synthetic</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
