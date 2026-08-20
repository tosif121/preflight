"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Users,
  ArrowRight,
  Lightbulb,
} from "lucide-react";

interface FamilyMember {
  id: string;
  fullName: string;
  isEarning: boolean;
}

interface Document {
  id: string;
  familyMemberId: string | null;
  docType: string;
}

interface Check {
  id: string;
  severity: string;
  status: string;
}

interface ApplicationHealthProps {
  members: FamilyMember[];
  docs: Document[];
  checks: Check[];
  requiredDocTypes: string[];
  currentStep: "documents" | "checks" | "packet";
  nextHref?: string;
}

function getNextAction(
  members: FamilyMember[],
  docs: Document[],
  checks: Check[],
  requiredDocTypes: string[],
  currentStep: string
): { text: string; href?: string } | null {
  // Step 1: Check if documents are complete
  if (currentStep === "documents") {
    for (const member of members) {
      const hasIdentity = docs.some(
        (d) => d.familyMemberId === member.id && d.docType === "identity_proof"
      );
      if (!hasIdentity) {
        return { text: `Upload identity proof for ${member.fullName.split(" ")[0]}` };
      }

      if (member.isEarning) {
        const hasIncome = docs.some(
          (d) =>
            d.familyMemberId === member.id &&
            (d.docType === "income_proof_salaried" || d.docType === "income_proof_nonsalaried")
        );
        if (!hasIncome) {
          return { text: `Upload income proof for ${member.fullName.split(" ")[0]}` };
        }
      }
    }

    const hasAddress = docs.some((d) => d.docType === "address_proof");
    if (!hasAddress) return { text: "Upload address proof" };

    const hasPhoto = docs.some((d) => d.docType === "photo");
    if (!hasPhoto) return { text: "Upload passport photo" };

    return { text: "All documents uploaded! Run checks →", href: checks.length === 0 ? "#run-checks" : undefined };
  }

  // Step 2: Check if there are issues to fix
  if (currentStep === "checks") {
    const issues = checks.filter((c) => c.severity === "blocker" && c.status !== "pass");
    if (issues.length > 0) {
      return { text: `Fix ${issues.length} issue${issues.length > 1 ? "s" : ""} before submitting` };
    }

    const warnings = checks.filter((c) => c.severity === "warning" && c.status !== "pass");
    if (warnings.length > 0) {
      return { text: `${warnings.length} item${warnings.length > 1 ? "s" : ""} need attention (not blocking)` };
    }

    if (checks.length === 0) {
      return { text: "Run checks to see if everything is ready" };
    }

    return { text: "All checks passed! Review packet →", href: "#view-packet" };
  }

  // Step 3: Packet
  if (currentStep === "packet") {
    return { text: "Review and submit your application" };
  }

  return null;
}

export function ApplicationHealth({
  members,
  docs,
  checks,
  requiredDocTypes,
  currentStep,
}: ApplicationHealthProps) {
  const passed = checks.filter((c) => c.status === "pass").length;
  const blockers = checks.filter((c) => c.severity === "blocker" && c.status !== "pass").length;
  const warnings = checks.filter((c) => c.severity === "warning" && c.status !== "pass").length;

  // Count required docs
  let totalRequired = 0;
  let uploaded = 0;

  for (const member of members) {
    totalRequired += 1; // identity
    const hasIdentity = docs.some(
      (d) => d.familyMemberId === member.id && d.docType === "identity_proof"
    );
    if (hasIdentity) uploaded++;

    if (member.isEarning) {
      totalRequired += 1; // income
      const hasIncome = docs.some(
        (d) =>
          d.familyMemberId === member.id &&
          (d.docType === "income_proof_salaried" || d.docType === "income_proof_nonsalaried")
      );
      if (hasIncome) uploaded++;
    }
  }

  totalRequired += 2; // address + photo
  const hasAddress = docs.some((d) => d.docType === "address_proof");
  const hasPhoto = docs.some((d) => d.docType === "photo");
  if (hasAddress) uploaded++;
  if (hasPhoto) uploaded++;

  const docsComplete = uploaded === totalRequired;
  const membersComplete = members.length > 0;
  const checksRun = checks.length > 0;
  const allPassed = checksRun && blockers === 0;

  const nextAction = getNextAction(members, docs, checks, requiredDocTypes, currentStep);

  return (
    <Card className="mb-6 border-[#EAE5DC]">
      <CardContent className="py-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-md bg-[#C85A40]/10 flex items-center justify-center">
            <Lightbulb className="h-3.5 w-3.5 text-[#C85A40]" />
          </div>
          <p className="text-sm font-semibold text-[#1C1B1A]">Application Health</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          {/* Documents */}
          <div className={`rounded-xl p-3 text-center ${docsComplete ? "bg-green-50" : "bg-[#F5F2EB]"}`}>
            <FileText className={`h-5 w-5 mx-auto mb-1 ${docsComplete ? "text-green-600" : "text-[#7A7771]"}`} />
            <p className="text-lg font-bold">{uploaded}/{totalRequired}</p>
            <p className="text-[11px] text-muted-foreground">Documents</p>
          </div>

          {/* Family */}
          <div className={`rounded-xl p-3 text-center ${membersComplete ? "bg-green-50" : "bg-[#F5F2EB]"}`}>
            <Users className={`h-5 w-5 mx-auto mb-1 ${membersComplete ? "text-green-600" : "text-[#7A7771]"}`} />
            <p className="text-lg font-bold">{members.length}</p>
            <p className="text-[11px] text-muted-foreground">Family Members</p>
          </div>

          {/* Checks */}
          <div className={`rounded-xl p-3 text-center ${allPassed ? "bg-green-50" : checksRun ? "bg-amber-50" : "bg-[#F5F2EB]"}`}>
            {allPassed ? (
              <CheckCircle2 className="h-5 w-5 mx-auto mb-1 text-green-600" />
            ) : blockers > 0 ? (
              <XCircle className="h-5 w-5 mx-auto mb-1 text-red-600" />
            ) : checksRun ? (
              <AlertTriangle className="h-5 w-5 mx-auto mb-1 text-amber-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 mx-auto mb-1 text-[#7A7771]" />
            )}
            <p className="text-lg font-bold">
              {checksRun ? (
                <>
                  <span className="text-green-600">{passed}</span>
                  {blockers > 0 && <span className="text-red-600 ml-1">{blockers}</span>}
                  {warnings > 0 && <span className="text-amber-600 ml-1">{warnings}</span>}
                </>
              ) : (
                "—"
              )}
            </p>
            <p className="text-[11px] text-muted-foreground">Checks</p>
          </div>
        </div>

        {/* Next Action */}
        {nextAction && (
          <div className={`rounded-xl p-3 flex items-center gap-3 ${
            nextAction.href
              ? "bg-[#4A7A59]/10 border border-[#4A7A59]/20"
              : "bg-[#C85A40]/5 border border-[#C85A40]/20"
          }`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              nextAction.href ? "bg-[#4A7A59]/10" : "bg-[#C85A40]/10"
            }`}>
              <ArrowRight className={`h-4 w-4 ${nextAction.href ? "text-[#4A7A59]" : "text-[#C85A40]"}`} />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground mb-0.5">Next step</p>
              <p className="text-sm font-medium text-[#1C1B1A]">{nextAction.text}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
