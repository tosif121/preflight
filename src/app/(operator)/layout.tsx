import { AppShell } from "@/components/app-shell";

export default function OperatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
