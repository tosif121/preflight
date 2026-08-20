"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, X, LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignInModal } from "@/components/sign-in-modal";

const NAV_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "FAQ", href: "/#faqs" },
];

export default function LandingNavbar() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => { if (r.ok) setLoggedIn(true); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const updateScrolled = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", updateScrolled, { passive: true });
    return () => window.removeEventListener("scroll", updateScrolled);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setLoggedIn(false);
    router.push("/");
  };

  const openModal = () => { setOpen(false); setModalOpen(true); };

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
            {loggedIn ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push("/dashboard")}
                  className="gap-1.5"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleLogout}
                  className="gap-1.5"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                onClick={() => setModalOpen(true)}
                className="bg-[#C85A40] hover:bg-[#A84C36] text-white"
              >
                Sign In
              </Button>
            )}
          </div>

          <div className="md:hidden flex items-center gap-2">
            {loggedIn ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push("/dashboard")}
                  className="text-xs px-3 gap-1"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  Dashboard
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleLogout}
                  className="text-xs px-3 gap-1"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                onClick={() => setModalOpen(true)}
                className="text-xs px-3 bg-[#C85A40] hover:bg-[#A84C36] text-white"
              >
                Sign In
              </Button>
            )}
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

            <div className="px-4 py-4 border-t border-[#EAE5DC]">
              {loggedIn ? (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => { setOpen(false); router.push("/dashboard"); }}
                    className="flex-1 gap-1.5"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => { setOpen(false); handleLogout(); }}
                    className="gap-1.5"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={openModal}
                  className="w-full bg-[#C85A40] hover:bg-[#A84C36] text-white"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </>
      )}

      <SignInModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
