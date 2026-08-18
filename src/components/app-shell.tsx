"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, LayoutDashboard, FileText } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/applications/new", label: "New Application", icon: FileText },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7]">
      <header className="border-b border-[#EAE5DC] bg-[#FCF8F4] sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#C85A40] flex items-center justify-center">
              <ShieldCheck className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-base text-[#1C1B1A]">
              Pre<span className="text-[#C85A40]">flight</span>
            </span>
          </Link>
          <div className="hidden sm:inline text-[10px] tracking-widest uppercase text-[#B0ACA8]">
            eMitra Pre-submission Checker
          </div>
          <nav className="ml-auto flex gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? "bg-[#C85A40] text-white shadow-sm"
                      : "text-[#7A7771] hover:bg-[#F5F2EB] hover:text-[#1C1B1A]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-[#EAE5DC] py-3 text-center text-xs text-[#B0ACA8] bg-[#FCF8F4]">
        Preflight is a pre-submission checker — not a government system. Final
        verification stays with the department (Tehsildar).
      </footer>
    </div>
  );
}
