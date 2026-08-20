"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Upload,
  Eye,
  ChevronDown,
  ChevronUp,
  MapPin,
  FileText,
  User,
  Users,
  Info,
  Loader2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Check {
  id: string;
  ruleId: string;
  severity: string;
  status: string;
  message: string;
  evidence: Record<string, unknown> | null;
}

interface Resolution {
  id: string;
  checkId: string;
  plainLanguageFix: string;
  resolved: boolean;
}

interface Application {
  id: string;
  citizenName: string;
  status: string;
  stateName: string;
  serviceName: string;
}

interface FamilyMember {
  id: string;
  fullName: string;
  relation: string;
  isEarning: boolean;
}

interface Document {
  id: string;
  familyMemberId: string | null;
  docType: string;
  mockFileName: string;
  ocrStatus: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const RULE_LABELS: Record<string, string> = {
  name_consistency: "Name Match",
  address_consistency: "Address Match",
  income_coverage: "Income Proof",
  certificate_use_by_date: "Deadline Check",
  document_quality: "Document Quality",
  lineage_reference_present: "Family Reference",
  age_eligibility: "Age Check",
  income_ceiling: "Income Limit",
  bank_account_proof_present: "Bank Proof",
};

const RULE_CATEGORIES: Record<string, string> = {
  name_consistency: "Identity",
  address_consistency: "Identity",
  income_coverage: "Income",
  income_ceiling: "Income",
  certificate_use_by_date: "Validity",
  document_quality: "Documents",
  lineage_reference_present: "Documents",
  age_eligibility: "Eligibility",
  bank_account_proof_present: "Documents",
};

const RULE_DESCRIPTIONS: Record<string, string> = {
  name_consistency: "Names should be consistent across identity and income documents.",
  address_consistency: "Address should match between identity proof and address proof.",
  income_coverage: "Every earning family member needs an income proof document.",
  certificate_use_by_date: "Certificate validity must cover the intended use date.",
  document_quality: "Documents should be clear enough for OCR to read reliably.",
  lineage_reference_present: "Prior caste certificate or community reference is typically required.",
  age_eligibility: "Applicant age must fall within the service eligibility band.",
  income_ceiling: "Annual income must be within the eligible threshold.",
  bank_account_proof_present: "Bank account proof is needed for disbursement services.",
};

const DOC_TYPE_LABELS: Record<string, string> = {
  identity_proof: "Identity Proof",
  address_proof: "Address Proof",
  income_proof_salaried: "Income Proof",
  income_proof_nonsalaried: "Income Proof",
  photo: "Passport Photo",
  community_proof: "Community Evidence",
  residence_proof: "Residence Proof",
  age_proof: "Age Proof",
  bank_account_proof: "Bank Account Proof",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ChecksPage() {
  const params = useParams();
  const appId = params.id as string;

  const [app, setApp] = useState<Application | null>(null);
  const [checks, setChecks] = useState<Check[]>([]);
  const [resolutions, setResolutions] = useState<Resolution[]>([]);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [runPhase, setRunPhase] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"attention" | "all">("attention");
  const [expandedCheck, setExpandedCheck] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [previousReadiness, setPreviousReadiness] = useState<{ passed: number; total: number } | null>(null);

  const fetchData = useCallback(async () => {
    const res = await fetch(`/api/applications/${appId}`);
    if (res.ok) {
      const data = await res.json();
      setApp(data.application);
      setChecks(data.checks ?? []);
      setResolutions(data.resolutions ?? []);
      setMembers(data.members ?? []);
      setDocs(data.documents ?? []);
    }
    setLoading(false);
  }, [appId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const runChecks = async (isRerun = false) => {
    if (isRerun) {
      setPreviousReadiness({
        passed: passed.length,
        total: checks.length,
      });
    }
    setRunning(true);
    setRunPhase("Reading documents...");
    try {
      // Simulate phases for UX
      setTimeout(() => setRunPhase("Comparing family information..."), 800);
      setTimeout(() => setRunPhase("Running service rules..."), 1600);
      setTimeout(() => setRunPhase("Building results..."), 2400);

      const endpoint = isRerun ? "recheck" : "evaluate";
      const res = await fetch(`/api/applications/${appId}/${endpoint}`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to run checks");
      const data = await res.json();
      setChecks(data.checks);
      setResolutions(data.resolutions ?? []);
      toast.success(
        isRerun
          ? `Re-check complete: ${data.readiness.passed}/${data.readiness.total} passed`
          : "Checks completed"
      );
      await fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checks failed");
    } finally {
      setRunning(false);
      setRunPhase("");
    }
  };

  const resolveCheck = async (checkId: string) => {
    try {
      const res = await fetch(`/api/applications/${appId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkId }),
      });
      if (!res.ok) throw new Error("Failed to resolve");
      toast.success("Marked as reviewed");
      await fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Resolve failed");
    }
  };

  const blockers = checks.filter((c) => c.severity === "blocker" && c.status !== "pass");
  const warnings = checks.filter((c) => c.severity === "warning" && c.status !== "pass");
  const passed = checks.filter((c) => c.status === "pass");
  const totalChecks = checks.length;
  const passedCount = passed.length;
  const attentionCount = blockers.length + warnings.length;
  const hasRun = checks.length > 0;
  const allClear = hasRun && blockers.length === 0 && warnings.length === 0;

  // Determine headline status
  const headlineStatus = !hasRun
    ? "not_run"
    : allClear
      ? "ready"
      : blockers.length > 0
        ? "action_required"
        : "review_needed";

  const headlineText = {
    not_run: "Ready to check",
    ready: "Ready to proceed",
    action_required: "Action required",
    review_needed: "Review needed",
  }[headlineStatus];

  const headlineSubtext = {
    not_run: "We'll check your documents for common issues.",
    ready: "No blocking issues were detected.",
    action_required: `${blockers.length} issue${blockers.length > 1 ? "s" : ""} must be fixed before submission.`,
    review_needed: `${warnings.length} item${warnings.length > 1 ? "s" : ""} need your review.`,
  }[headlineStatus];

  // Group passed checks by category
  const passedByCategory: Record<string, Check[]> = {};
  for (const check of passed) {
    const cat = RULE_CATEGORIES[check.ruleId] ?? "Other";
    if (!passedByCategory[cat]) passedByCategory[cat] = [];
    passedByCategory[cat].push(check);
  }

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-[#EAE5DC] animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-1">
        <Link href="/dashboard" className="text-sm text-[#7A7771] hover:text-[#1C1B1A]">
          Dashboard
        </Link>
        <span className="text-[#7A7771]">/</span>
        <span className="text-sm text-[#1C1B1A]">{app?.citizenName}</span>
      </div>

      <h1 className="text-2xl font-bold text-[#1C1B1A] mb-1">Preflight</h1>
      <p className="text-sm text-[#7A7771] mb-6">
        {app?.serviceName} &middot; {app?.stateName}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
        <div>
          {/* ─── Hero: Readiness Summary ─────────────────────────────── */}
          <Card className="mb-6 border-[#EAE5DC]">
            <CardContent className="py-6">
              {running ? (
                <div className="text-center py-4">
                  <Loader2 className="h-10 w-10 mx-auto text-[#C85A40] animate-spin mb-3" />
                  <p className="text-lg font-bold text-[#1C1B1A] mb-1">Checking your application</p>
                  <p className="text-sm text-[#7A7771]">{runPhase}</p>
                </div>
              ) : !hasRun ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-[#C85A40]/10 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="h-8 w-8 text-[#C85A40]" />
                  </div>
                  <p className="text-lg font-bold text-[#1C1B1A] mb-1">Ready to check?</p>
                  <p className="text-sm text-[#7A7771] mb-4">
                    We&apos;ll check your documents for missing information, inconsistencies and quality issues.
                  </p>
                  <Button onClick={() => runChecks(false)} disabled={running}>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Run Preflight
                  </Button>
                </div>
              ) : (
                <>
                  <div className="text-center mb-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                      allClear ? "bg-[#4A7A59]/10" : blockers.length > 0 ? "bg-red-50" : "bg-[#F59E0B]/10"
                    }`}>
                      {allClear ? (
                        <CheckCircle2 className="h-8 w-8 text-[#4A7A59]" />
                      ) : blockers.length > 0 ? (
                        <XCircle className="h-8 w-8 text-red-500" />
                      ) : (
                        <AlertTriangle className="h-8 w-8 text-[#F59E0B]" />
                      )}
                    </div>
                    <p className="text-xl font-bold text-[#1C1B1A] mb-1">{headlineText}</p>
                    <p className="text-sm text-[#7A7771]">{headlineSubtext}</p>
                  </div>

                  {/* Progress bar */}
                  <div className="max-w-md mx-auto mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-[#1C1B1A]">{passedCount} / {totalChecks} passed</span>
                    </div>
                    <div className="h-2.5 bg-[#EAE5DC] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          allClear ? "bg-[#4A7A59]" : "bg-[#C85A40]"
                        }`}
                        style={{ width: `${totalChecks > 0 ? (passedCount / totalChecks) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Status badges */}
                  <div className="flex items-center justify-center gap-4">
                    {blockers.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                        <span className="text-sm text-[#1C1B1A] font-medium">
                          {blockers.length} must fix
                        </span>
                      </div>
                    )}
                    {warnings.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                        <span className="text-sm text-[#1C1B1A] font-medium">
                          {warnings.length} to review
                        </span>
                      </div>
                    )}
                    {allClear && (
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-[#4A7A59]" />
                        <span className="text-sm text-[#4A7A59] font-medium">All checks passed</span>
                      </div>
                    )}
                  </div>

                  {/* What changed after re-check */}
                  {previousReadiness && (
                    <div className="mt-4 p-3 rounded-lg bg-[#4A7A59]/5 border border-[#4A7A59]/20 max-w-md mx-auto">
                      <p className="text-xs font-semibold text-[#4A7A59] uppercase tracking-wider mb-1">After re-check</p>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-[#7A7771]">{previousReadiness.passed}/{previousReadiness.total} passed</span>
                        <ArrowRight className="h-3 w-3 text-[#7A7771]" />
                        <span className="font-medium text-[#1C1B1A]">{passedCount}/{totalChecks} passed</span>
                      </div>
                      {passedCount > previousReadiness.passed && (
                        <p className="text-xs text-[#4A7A59] mt-1">
                          {passedCount - previousReadiness.passed} issue{passedCount - previousReadiness.passed !== 1 ? "s" : ""} resolved
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* ─── Attention Needed ────────────────────────────────────── */}
          {hasRun && attentionCount > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-[#1C1B1A] mb-1 flex items-center gap-2">
                {blockers.length > 0 ? (
                  <XCircle className="h-5 w-5 text-red-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-[#F59E0B]" />
                )}
                {attentionCount} thing{attentionCount !== 1 ? "s" : ""} need{attentionCount === 1 ? "s" : ""} your attention
              </h2>
              <p className="text-sm text-[#7A7771] mb-4">
                {blockers.length > 0
                  ? "Fix the issues below before preparing your packet."
                  : "Review these items - they may need clarification."}
              </p>

              <div className="space-y-3">
                {/* Blockers first */}
                {blockers.map((check) => (
                  <CheckIssueCard
                    key={check.id}
                    check={check}
                    resolution={resolutions.find((r) => r.checkId === check.id)}
                    onResolve={() => resolveCheck(check.id)}
                    isExpanded={expandedCheck === check.id}
                    onToggle={() => setExpandedCheck(expandedCheck === check.id ? null : check.id)}
                    docs={docs}
                    members={members}
                    onPreviewDoc={setPreviewDoc}
                  />
                ))}

                {/* Then warnings */}
                {warnings.map((check) => (
                  <CheckIssueCard
                    key={check.id}
                    check={check}
                    resolution={resolutions.find((r) => r.checkId === check.id)}
                    onResolve={() => resolveCheck(check.id)}
                    isExpanded={expandedCheck === check.id}
                    onToggle={() => setExpandedCheck(expandedCheck === check.id ? null : check.id)}
                    docs={docs}
                    members={members}
                    onPreviewDoc={setPreviewDoc}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ─── All Clear State ─────────────────────────────────────── */}
          {allClear && (
            <div className="mb-8">
              <Card className="border-[#4A7A59]/30 bg-[#4A7A59]/5">
                <CardContent className="py-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#4A7A59]/10 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="h-8 w-8 text-[#4A7A59]" />
                  </div>
                  <p className="text-lg font-bold text-[#1C1B1A] mb-1">Ready to proceed</p>
                  <p className="text-sm text-[#7A7771] mb-4">
                    {totalChecks} / {totalChecks} checks passed. No blocking issues detected.
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <Link href={`/applications/${appId}/documents`}>
                      <Button variant="outline">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to documents
                      </Button>
                    </Link>
                    <Link href={`/applications/${appId}/packet`}>
                      <Button>
                        Review application packet
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ─── Passed Checks (grouped) ─────────────────────────────── */}
          {hasRun && passed.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-[#1C1B1A] mb-1 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-[#4A7A59]" />
                {passed.length} check{passed.length !== 1 ? "s" : ""} passed
              </h2>
              <p className="text-sm text-[#7A7771] mb-4">Everything looks good here.</p>

              <div className="space-y-4">
                {Object.entries(passedByCategory).map(([category, catChecks]) => (
                  <Card key={category} className="border-[#EAE5DC]">
                    <CardContent className="py-4">
                      <p className="text-xs font-semibold text-[#7A7771] uppercase tracking-wider mb-2">{category}</p>
                      <div className="space-y-1.5">
                        {catChecks.map((check) => (
                          <div key={check.id} className="flex items-center gap-2 py-1">
                            <CheckCircle2 className="h-3.5 w-3.5 text-[#4A7A59] shrink-0" />
                            <span className="text-sm text-[#1C1B1A]">
                              {RULE_LABELS[check.ruleId] ?? check.ruleId}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* ─── Re-check Button ─────────────────────────────────────── */}
          {hasRun && (
            <div className="flex items-center justify-center mb-8">
              <Button
                onClick={() => runChecks(true)}
                disabled={running}
                variant="outline"
                className="gap-2"
              >
                <RotateCcw className={`h-4 w-4 ${running ? "animate-spin" : ""}`} />
                {running ? "Re-checking..." : "Re-check application"}
              </Button>
            </div>
          )}

          {/* ─── Disclaimer ──────────────────────────────────────────── */}
          {hasRun && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-[#FAF8F4] border border-[#EAE5DC] mb-6">
              <Info className="h-4 w-4 text-[#7A7771] shrink-0 mt-0.5" />
              <p className="text-xs text-[#7A7771]">
                Preflight checks your application evidence before submission. Final review remains with the relevant authority.
              </p>
            </div>
          )}
        </div>

        {/* ─── Sidebar: Application Snapshot ─────────────────────────── */}
        <div className="hidden lg:block">
          <div className="sticky top-6">
            <Card className="border-[#EAE5DC]">
              <CardContent className="py-5">
                <p className="text-xs font-semibold text-[#7A7771] uppercase tracking-wider mb-3">Application</p>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-3.5 w-3.5 text-[#7A7771]" />
                    <span className="font-medium text-[#1C1B1A]">{app?.stateName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-3.5 w-3.5 text-[#7A7771]" />
                    <span className="font-medium text-[#1C1B1A]">{app?.serviceName}</span>
                  </div>

                  <div className="border-t border-[#EAE5DC] pt-3">
                    <p className="text-xs font-semibold text-[#7A7771] uppercase tracking-wider mb-2">Applicant</p>
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-3.5 w-3.5 text-[#7A7771]" />
                      <span className="font-medium text-[#1C1B1A]">{app?.citizenName}</span>
                    </div>
                  </div>

                  <div className="border-t border-[#EAE5DC] pt-3">
                    <p className="text-xs font-semibold text-[#7A7771] uppercase tracking-wider mb-2">Family</p>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-3.5 w-3.5 text-[#7A7771]" />
                      <span className="text-[#1C1B1A]">
                        {members.length} member{members.length !== 1 ? "s" : ""}
                        {members.filter((m) => m.isEarning).length > 0 && (
                          <span className="text-[#7A7771]">
                            {" "}&middot; {members.filter((m) => m.isEarning).length} earning
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-[#EAE5DC] pt-3">
                    <p className="text-xs font-semibold text-[#7A7771] uppercase tracking-wider mb-2">Documents</p>
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-3.5 w-3.5 text-[#7A7771]" />
                      <span className="text-[#1C1B1A]">{docs.length} added</span>
                    </div>
                  </div>

                  {hasRun && (
                    <div className="border-t border-[#EAE5DC] pt-3">
                      <p className="text-xs font-semibold text-[#7A7771] uppercase tracking-wider mb-2">Preflight</p>
                      <div className="flex items-center gap-2 text-sm">
                        {allClear ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-[#4A7A59]" />
                        ) : blockers.length > 0 ? (
                          <XCircle className="h-3.5 w-3.5 text-red-500" />
                        ) : (
                          <AlertTriangle className="h-3.5 w-3.5 text-[#F59E0B]" />
                        )}
                        <span className="font-medium text-[#1C1B1A]">
                          {passedCount}/{totalChecks} passed
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="mt-4 pt-4 border-t border-[#EAE5DC] space-y-2">
                  <Link href={`/applications/${appId}/documents`} className="block">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <ArrowLeft className="h-3.5 w-3.5 mr-2" />
                      Documents
                    </Button>
                  </Link>
                  {allClear && (
                    <Link href={`/applications/${appId}/packet`} className="block">
                      <Button size="sm" className="w-full justify-start">
                        View packet
                        <ArrowRight className="h-3.5 w-3.5 ml-2" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* ─── Document Preview Dialog ─────────────────────────────────── */}
      <Dialog open={!!previewDoc} onOpenChange={(open) => !open && setPreviewDoc(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Document Preview</DialogTitle>
          </DialogHeader>
          {previewDoc && (
            <div className="space-y-4">
              <div className="aspect-[4/3] bg-[#F5F2EB] rounded-xl flex items-center justify-center border border-[#EAE5DC]">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-[#7A7771] mx-auto mb-2" />
                  <p className="text-sm font-medium text-[#1C1B1A]">{previewDoc.mockFileName.replace(".svg", "")}</p>
                  <p className="text-xs text-[#7A7771]">{DOC_TYPE_LABELS[previewDoc.docType]}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Check Issue Card ───────────────────────────────────────────────────────

function CheckIssueCard({
  check,
  resolution,
  onResolve,
  isExpanded,
  onToggle,
  docs,
  members,
  onPreviewDoc,
}: {
  check: Check;
  resolution?: Resolution;
  onResolve: () => void;
  isExpanded: boolean;
  onToggle: () => void;
  docs: Document[];
  members: FamilyMember[];
  onPreviewDoc: (doc: Document) => void;
}) {
  const isBlocker = check.severity === "blocker";
  const evidenceRaw = check.evidence;
  const evidenceEntries: [string, string][] = evidenceRaw
    ? Object.entries(evidenceRaw).map(([k, v]) => [k, String(v)])
    : [];

  // Determine contextual action
  const getAction = () => {
    if (resolution?.resolved) return null;
    if (check.ruleId === "income_coverage") return { label: "Upload document", icon: Upload };
    if (check.ruleId === "name_consistency") return { label: "Review document", icon: Eye };
    if (check.ruleId === "document_quality") return { label: "Replace document", icon: Upload };
    if (check.ruleId === "bank_account_proof_present") return { label: "Upload document", icon: Upload };
    return { label: "Mark as reviewed", icon: CheckCircle2 };
  };

  const action = getAction();

  return (
    <Card className={`${isBlocker ? "border-red-200" : "border-[#F59E0B]/30"}`}>
      <CardContent className="py-4">
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
            isBlocker ? "bg-red-50" : "bg-[#F59E0B]/10"
          }`}>
            {isBlocker ? (
              <XCircle className="h-4 w-4 text-red-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-[#F59E0B]" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-bold text-[#1C1B1A]">
                {RULE_LABELS[check.ruleId] ?? check.ruleId}
              </p>
              <Badge
                variant={isBlocker ? "destructive" : "secondary"}
                className="text-[10px]"
              >
                {isBlocker ? "Must fix" : "Review"}
              </Badge>
            </div>

            <p className="text-sm text-[#7A7771] mb-2">{check.message}</p>

            {/* Why this was flagged */}
            <button
              onClick={onToggle}
              className="flex items-center gap-1 text-xs text-[#C85A40] font-medium hover:underline mb-2"
            >
              {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {isExpanded ? "Hide details" : "See why"}
            </button>

            {isExpanded && (
              <div className="space-y-3 mb-3">
                {/* Rule */}
                <div className="p-3 rounded-lg bg-[#FAF8F4] border border-[#EAE5DC]">
                  <p className="text-[11px] font-semibold text-[#7A7771] uppercase tracking-wider mb-1">What we checked</p>
                  <p className="text-xs text-[#1C1B1A]">
                    {RULE_DESCRIPTIONS[check.ruleId] ?? "Standard preflight rule."}
                  </p>
                </div>

                {evidenceEntries.length > 0 ? (
                  <div className="p-3 rounded-lg bg-[#FAF8F4] border border-[#EAE5DC]">
                    <p className="text-[11px] font-semibold text-[#7A7771] uppercase tracking-wider mb-2">Evidence</p>
                    <div className="space-y-1.5">
                      {evidenceEntries.map(([key, val]) => (
                        <div key={key} className="flex items-center justify-between text-xs">
                          <span className="text-[#7A7771] capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                          <span className="font-medium text-[#1C1B1A]">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Related documents */}
                {evidenceRaw?.memberId && typeof evidenceRaw.memberId === "string" ? (
                  <div className="p-3 rounded-lg bg-[#FAF8F4] border border-[#EAE5DC]">
                    <p className="text-[11px] font-semibold text-[#7A7771] uppercase tracking-wider mb-2">Related documents</p>
                    {docs
                      .filter((d) => d.familyMemberId === String(evidenceRaw.memberId))
                      .map((d) => (
                        <div key={d.id} className="flex items-center justify-between py-1">
                          <span className="text-xs text-[#1C1B1A]">
                            {DOC_TYPE_LABELS[d.docType]} - {d.mockFileName.replace(".svg", "")}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-[10px]"
                            onClick={() => onPreviewDoc(d)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Preview
                          </Button>
                        </div>
                      ))}
                  </div>
                ) : null}
              </div>
            )}

            {/* Fix suggestion */}
            {resolution && !resolution.resolved && (
              <div className="p-3 rounded-lg bg-[#C85A40]/5 border border-[#C85A40]/20 mb-3">
                <p className="text-[11px] font-semibold text-[#C85A40] uppercase tracking-wider mb-1">What to do</p>
                <p className="text-sm text-[#1C1B1A]">{resolution.plainLanguageFix}</p>
              </div>
            )}

            {resolution?.resolved && (
              <div className="flex items-center gap-1.5 text-xs text-[#4A7A59] mb-2">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Reviewed</span>
              </div>
            )}

            {/* Action button */}
            {!resolution?.resolved && action && (
              <Button
                size="sm"
                variant={isBlocker ? "default" : "outline"}
                onClick={onResolve}
                className="gap-1.5"
              >
                <action.icon className="h-3.5 w-3.5" />
                {action.label}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
