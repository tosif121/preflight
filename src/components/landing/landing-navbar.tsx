"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "FAQ", href: "/#faqs" },
];

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const updateScrolled = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", updateScrolled, { passive: true });
    return () => window.removeEventListener("scroll", updateScrolled);
  }, []);

  return (
    <>
      <nav
        className={`fixed z-50 top-0 left-0 right-0 transition-all duration-500 ${
          scrolled
            ? "shadow-[0_8px_32px_rgba(0,0,0,0.05)]"
            : "backdrop-blur-xl"
        } bg-[#FCF8F4]/70`}
      >
        <div
          className={`flex max-w-[1400px] items-center justify-between mx-auto px-4 sm:px-6 lg:px-8 py-3 transition-all duration-500 ${
            scrolled ? "bg-[#FCF8F4]" : "bg-[#FCF8F4]/70"
          }`}
        >
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#C85A40] flex items-center justify-center">
              <ShieldCheck className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-[#1C1B1A]">
              Pre<span className="text-[#C85A40]">flight</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="text-sm font-semibold text-black/65 hover:text-[#C85A40] transition-colors tracking-wide uppercase"
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/dashboard">
              <Button
                variant="outline"
                size="sm"
                className="border-[#EAE5DC] text-[#1C1B1A] hover:bg-[#F5F2EB]"
              >
                Dashboard
              </Button>
            </Link>
            <Link href="/applications/new">
              <Button
                size="sm"
                className="bg-[#C85A40] hover:bg-[#A84C36] text-white"
              >
                New Application
              </Button>
            </Link>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <Link href="/applications/new">
              <Button
                size="sm"
                className="text-xs px-3 bg-[#C85A40] hover:bg-[#A84C36] text-white"
              >
                New App
              </Button>
            </Link>
            <button
              className="w-10 h-10 flex items-center justify-center rounded-full bg-black/5 transition-all active:scale-95 hover:bg-black/10"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              <div className="w-5 flex flex-col gap-1">
                <span
                  className={`h-0.5 bg-black transition-all duration-300 ${
                    open ? "rotate-45 translate-y-[4px]" : ""
                  }`}
                />
                <span
                  className={`h-0.5 bg-black transition-all duration-300 ${
                    open ? "opacity-0" : ""
                  }`}
                />
                <span
                  className={`h-0.5 bg-black transition-all duration-300 ${
                    open ? "-rotate-45 -translate-y-[4px]" : ""
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {open && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm md:hidden"
            onClick={() => setOpen(false)}
          />

          <div className="fixed top-0 left-0 z-[70] h-full w-[80vw] max-w-[320px] bg-white flex flex-col md:hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#EAE5DC]">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-lg bg-[#C85A40] flex items-center justify-center">
                  <ShieldCheck className="h-4 w-4 text-white" />
                </div>
                <span className="text-base font-bold text-[#1C1B1A]">
                  Pre<span className="text-[#C85A40]">flight</span>
                </span>
              </Link>
              <button
                className="w-9 h-9 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 active:scale-95 transition-all"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                <X size={16} />
              </button>
            </div>

            <nav className="flex flex-col px-4 py-4 gap-1 flex-1 overflow-y-auto">
              {NAV_LINKS.map((l, i) => (
                <Link
                  key={l.label}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold text-black/70 hover:text-[#C85A40] hover:bg-[#C85A40]/5 transition-all tracking-wide uppercase"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C85A40] shrink-0" />
                  {l.label}
                </Link>
              ))}
            </nav>

            <div className="px-4 py-4 border-t border-[#EAE5DC] space-y-2">
              <Link href="/dashboard" onClick={() => setOpen(false)}>
                <Button
                  variant="outline"
                  className="w-full border-[#EAE5DC] text-[#1C1B1A]"
                >
                  Dashboard
                </Button>
              </Link>
              <Link href="/applications/new" onClick={() => setOpen(false)}>
                <Button className="w-full bg-[#C85A40] hover:bg-[#A84C36] text-white">
                  New Application
                </Button>
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}
