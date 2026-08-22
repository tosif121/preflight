"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PlusCircle,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Inbox,
  Zap,
  MapPin,
  User,
  Users,
  Clock,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface EnrichedApplication {
  id: string;
  citizenName: string;
  status: string;
  createdAt: string;
  stateId: string;
  stateName: string;
  portalName: string;
  serviceId: string;
  serviceName: string;
  serviceCategory: string;
  memberCount: number;
  earningMembers: number;
  docCount: number;
  checksTotal: number;
  checksPassed: number;
  blockers: number;
  warnings: number;
  nextStep: string;
  nextHref: string;
  lastActivity: string;
  stepProgress: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; dotColor: string; bg: string }> = {
  draft: { label: "Draft", dotColor: "bg-[#7A7771]", bg: "bg-[#EAE5DC]" },
  checking: { label: "Checking", dotColor: "bg-[#C85A40]", bg: "bg-[#C85A40]/10" },
  blocked: { label: "Needs attention", dotColor: "bg-red-500", bg: "bg-red-50" },
  ready: { label: "Ready to submit", dotColor: "bg-[#4A7A59]", bg: "bg-[#4A7A59]/10" },
  submitted: { label: "Submitted", dotColor: "bg-[#7A7771]", bg: "bg-[#EAE5DC]" },
};

const STEP_LABELS = ["Details", "Family", "Documents", "Preflight", "Packet"];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<EnrichedApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/applications")
      .then((r) => {
        if (!r.ok) throw new Error("not authed");
        return r.json();
      })
      .then((data) => {
        setApplications(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        router.push("/");
      });
  }, [router]);

  // Counts
  const needsAttention = applications.filter((a) => a.status === "blocked").length;
  const inProgress = applications.filter((a) => a.status === "draft" || a.status === "checking").length;
  const ready = applications.filter((a) => a.status === "ready" || a.status === "submitted").length;

  // Best candidate for "next action"
  const nextAction = applications.find((a) => a.status === "blocked")
    ?? applications.find((a) => a.status === "ready")
    ?? applications.find((a) => a.status === "checking")
    ?? applications.find((a) => a.status === "draft");

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* ─── Hero ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1B1A]">Your applications</h1>
          <p className="text-sm text-[#7A7771]">Keep track of documents, checks and next steps</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/applications/new">
            <Button variant="outline" size="sm">
              <Zap className="h-3.5 w-3.5 mr-1.5" />
              Demo
            </Button>
          </Link>
          <Link href="/applications/new">
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              New application
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-[#EAE5DC] animate-pulse rounded-xl" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        /* ─── Empty State ──────────────────────────────────────────── */
        <Card className="border-dashed border-[#EAE5DC]">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-[#EAE5DC] flex items-center justify-center mx-auto mb-4">
              <Inbox className="h-8 w-8 text-[#7A7771]" />
            </div>
            <p className="text-lg font-bold text-[#1C1B1A] mb-1">No applications yet</p>
            <p className="text-sm text-[#7A7771] mb-5 max-w-sm mx-auto">
              Choose a state and service. We&apos;ll guide you through the documents
              and checks needed before submission.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link href="/applications/new">
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create your first application
                </Button>
              </Link>
              <Link href="/applications/new">
                <Button variant="outline">
                  <Zap className="h-4 w-4 mr-2" />
                  Try demo application
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* ─── Next Action ────────────────────────────────────────── */}
          {nextAction && (
            <div className="mb-6">
              <p className="text-xs font-semibold text-[#7A7771] uppercase tracking-wider mb-2">Your next action</p>
              <Card className={`border ${
                nextAction.status === "blocked" ? "border-red-200" :
                nextAction.status === "ready" ? "border-[#4A7A59]/30" :
                "border-[#EAE5DC]"
              }`}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        nextAction.status === "blocked" ? "bg-red-50" :
                        nextAction.status === "ready" ? "bg-[#4A7A59]/10" :
                        "bg-[#C85A40]/10"
                      }`}>
                        {nextAction.status === "blocked" ? (
                          <XCircle className="h-5 w-5 text-red-500" />
                        ) : nextAction.status === "ready" ? (
                          <CheckCircle2 className="h-5 w-5 text-[#4A7A59]" />
                        ) : (
                          <FileText className="h-5 w-5 text-[#C85A40]" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#1C1B1A]">
                          {nextAction.status === "blocked"
                            ? `Fix ${nextAction.blockers} issue${nextAction.blockers > 1 ? "s" : ""}`
                            : nextAction.status === "ready"
                            ? "Review your application packet"
                            : nextAction.nextStep}
                        </p>
                        <p className="text-xs text-[#7A7771]">
                          {nextAction.serviceName} &middot; UMANG
                          {nextAction.blockers > 0 && (
                            <span className="ml-2">
                              &middot; {nextAction.checksPassed}/{nextAction.checksTotal} checks passed
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <Link href={nextAction.nextHref}>
                      <Button size="sm">
                        {nextAction.status === "blocked" ? "Review" : nextAction.status === "ready" ? "View" : "Continue"}
                        <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ─── Stats ──────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Card className="border-[#EAE5DC]">
              <CardContent className="py-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-xl font-bold text-[#1C1B1A]">{needsAttention}</p>
                  <p className="text-xs text-[#7A7771]">Needs attention</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-[#EAE5DC]">
              <CardContent className="py-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#C85A40]/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-[#C85A40]" />
                </div>
                <div>
                  <p className="text-xl font-bold text-[#1C1B1A]">{inProgress}</p>
                  <p className="text-xs text-[#7A7771]">In progress</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-[#EAE5DC]">
              <CardContent className="py-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#4A7A59]/10 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-[#4A7A59]" />
                </div>
                <div>
                  <p className="text-xl font-bold text-[#1C1B1A]">{ready}</p>
                  <p className="text-xs text-[#7A7771]">Ready</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ─── Applications List ───────────────────────────────────── */}
          <p className="text-xs font-semibold text-[#7A7771] uppercase tracking-wider mb-3">Applications</p>
          <div className="space-y-4">
            {applications.map((app) => {
              const cfg = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.draft;
              const score = app.checksTotal > 0 ? Math.round((app.checksPassed / app.checksTotal) * 100) : 0;

              return (
                <Link key={app.id} href={app.nextHref}>
                  <Card className="border-[#EAE5DC] hover:border-[#C85A40]/30 hover:shadow-md transition-all cursor-pointer group mb-4">
                    <CardContent className="py-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-bold text-[#1C1B1A] group-hover:text-[#C85A40] transition-colors">
                              {app.serviceName}
                            </h3>
                            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${cfg.bg}`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor}`} />
                              <span className="text-[10px] font-medium text-[#1C1B1A]">{cfg.label}</span>
                            </div>
                          </div>
                          <p className="text-xs text-[#7A7771]">
                            UMANG &middot; {app.portalName}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-[#7A7771] group-hover:text-[#C85A40] transition-colors shrink-0 mt-1" />
                      </div>

                      {/* Applicant */}
                      <div className="flex items-center gap-2 mb-3">
                        <User className="h-3.5 w-3.5 text-[#7A7771]" />
                        <span className="text-xs text-[#1C1B1A]">{app.citizenName}</span>
                        <span className="text-xs text-[#7A7771]">&middot; {app.memberCount} member{app.memberCount !== 1 ? "s" : ""}</span>
                        {app.earningMembers > 0 && (
                          <span className="text-xs text-[#7A7771]">&middot; {app.earningMembers} earning</span>
                        )}
                      </div>

                      {/* Preflight progress */}
                      {app.checksTotal > 0 && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-[#7A7771]">
                              Preflight {app.checksPassed}/{app.checksTotal}
                            </span>
                            {app.blockers > 0 && (
                              <span className="text-xs text-red-500 font-medium">
                                {app.blockers} blocker{app.blockers > 1 ? "s" : ""}
                                {app.warnings > 0 && ` · ${app.warnings} warning`}
                              </span>
                            )}
                            {app.warnings > 0 && app.blockers === 0 && (
                              <span className="text-xs text-[#F59E0B] font-medium">
                                {app.warnings} warning{app.warnings > 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                          <div className="h-1.5 bg-[#EAE5DC] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                app.blockers > 0 ? "bg-red-500" : "bg-[#4A7A59]"
                              }`}
                              style={{ width: `${score}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Step progress */}
                      <div className="flex items-center gap-1 mb-3">
                        {STEP_LABELS.map((label, i) => (
                          <div key={label} className="flex items-center gap-1">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                              i < app.stepProgress
                                ? "bg-[#4A7A59] text-white"
                                : i === app.stepProgress
                                ? "bg-[#C85A40] text-white"
                                : "bg-[#EAE5DC] text-[#7A7771]"
                            }`}>
                              {i < app.stepProgress ? "\u2713" : i + 1}
                            </div>
                            {i < STEP_LABELS.length - 1 && (
                              <div className={`w-4 h-0.5 rounded ${
                                i < app.stepProgress ? "bg-[#4A7A59]" : "bg-[#EAE5DC]"
                              }`} />
                            )}
                          </div>
                        ))}
                        <span className="text-[10px] text-[#7A7771] ml-1.5">
                          {STEP_LABELS[Math.min(app.stepProgress, STEP_LABELS.length - 1)]}
                        </span>
                      </div>

                      {/* Next step */}
                      <div className="flex items-center justify-between pt-2 border-t border-[#EAE5DC]">
                        <span className="text-xs text-[#7A7771]">Next: {app.nextStep}</span>
                        {app.lastActivity && (
                          <span className="text-[10px] text-[#7A7771] flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {app.lastActivity}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
