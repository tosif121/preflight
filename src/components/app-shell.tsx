"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ShieldCheck, LayoutDashboard, FileText, LogOut, MapPin } from "lucide-react";
import { getAuthUser, clearAuthUser, type AuthUser } from "@/lib/auth/client";
import { getStateById } from "@/lib/config/catalog";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/applications/new", label: "New Application", icon: FileText },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [auth, setAuth] = useState<AuthUser | null>(null);

  useEffect(() => {
    const user = getAuthUser();
    if (!user) {
      router.push("/login");
      return;
    }
    setAuth(user);
  }, [router]);

  const handleLogout = () => {
    clearAuthUser();
    router.push("/login");
  };

  if (!auth) return null;

  const stateName = getStateById(auth.stateId)?.name ?? auth.stateId;

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7]">
      <header className="border-b border-[#EAE5DC] bg-[#FCF8F4] sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#C85A40] flex items-center justify-center">
              <ShieldCheck className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-base text-[#1C1B1A]">
              Pre<span className="text-[#C85A40]">flight</span>
            </span>
          </Link>
          <div className="hidden sm:flex items-center gap-2 text-[10px] tracking-widest uppercase text-[#B0ACA8]">
            <MapPin className="h-3 w-3" />
            {stateName}
          </div>
          <nav className="ml-auto flex items-center gap-1">
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
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-[#7A7771] hover:bg-[#F5F2EB] hover:text-[#1C1B1A] transition-all ml-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
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
