import { CheckCircle2, FileSearch, FileText, FolderUp, ListChecks, Send, Wrench } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  ["01", FileText, "Select service", "Choose the Rajasthan Family Income Certificate rule pack."],
  ["02", FolderUp, "Provide documents", "Add the family record, proofs, and photo collected by the operator."],
  ["03", FileSearch, "Extract and normalize", "OCR reads each document; deterministic code standardizes formats only."],
  ["04", ListChecks, "Run service rules", "The rule matrix checks completeness, consistency, and extraction confidence."],
  ["05", Wrench, "Resolve issues", "Plain-language guidance explains what needs attention before submission."],
  ["06", CheckCircle2, "Prepare the packet", "Citizen confirms a ready packet. Final verification stays with the department."],
  ["07", Send, "Reviewer Gateway", "A clearly labeled prototype shows the evidence trail a Tehsildar could review."],
] as const;

export function HowItWorks() {
  return <section className="section-rule scroll-mt-24" id="how-it-works"><div className="section-shell py-20 lg:py-28"><p className="utility text-xs text-[var(--accent)]">03 / OPERATOR JOURNEY</p><h2 className="display mt-4 max-w-3xl text-3xl sm:text-4xl">One operator flow, from documents to a clearer review trail.</h2><p className="mt-5 max-w-2xl leading-7 text-[var(--ink-muted)]">Preflight sits before official submission. It never replaces departmental verification.</p><ol className="mt-10 flex snap-x gap-4 overflow-x-auto pb-4 [scrollbar-width:thin] lg:overflow-visible">{steps.map(([number, Icon, title, description]) => <li key={number} className="min-w-64 flex-1 snap-start lg:min-w-0"><Card className="h-full rounded-2xl bg-[var(--bg-elevated)] shadow-[0_10px_30px_rgb(28_27_26_/_0.06)]"><CardContent className="p-2"><p className="utility text-xs text-[var(--accent)]">{number}</p><Icon size={19} className="mt-7 text-[var(--ink)]"/><h3 className="mt-4 text-base font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">{description}</p></CardContent></Card></li>)}</ol></div></section>;
}
