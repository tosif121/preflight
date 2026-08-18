"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Play,
  RotateCcw,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";

interface Check {
  id: string;
  ruleId: string;
  severity: string;
  status: string;
  message: string;
}

interface Resolution {
  id: string;
  checkId: string;
  plainLanguageFix: string;
  resolved: boolean;
}

interface Readiness {
  passed: number;
  total: number;
  blockers: number;
  warnings: number;
}

interface Application {
  id: string;
  citizenName: string;
  status: string;
  stateName: string;
  serviceName: string;
}

const RULE_LABELS: Record<string, string> = {
  name_consistency: "Name Consistency",
  address_consistency: "Address Consistency",
  income_coverage: "Income Coverage",
  certificate_use_by_date: "Certificate Validity Period",
  document_quality: "Document Quality",
  lineage_reference_present: "Lineage Reference",
  age_eligibility: "Age Eligibility",
  income_ceiling: "Income Ceiling",
  bank_account_proof_present: "Bank Account Proof",
};

export default function ChecksPage() {
  const params = useParams();
  const router = useRouter();
  const appId = params.id as string;

  const [app, setApp] = useState<Application | null>(null);
  const [checks, setChecks] = useState<Check[]>([]);
  const [resolutions, setResolutions] = useState<Resolution[]>([]);
  const [readiness, setReadiness] = useState<Readiness | null>(null);
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("blockers");

  const fetchData = useCallback(async () => {
    const res = await fetch(`/api/applications/${appId}`);
    if (res.ok) {
      const data = await res.json();
      setApp(data.application);
      setChecks(data.checks ?? []);
      setResolutions(data.resolutions ?? []);
    }
    setLoading(false);
  }, [appId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const runChecks = async () => {
    setRunning(true);
    try {
      const res = await fetch(`/api/applications/${appId}/evaluate`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to run checks");
      const data = await res.json();
      setChecks(data.checks);
      setReadiness(data.readiness);
      toast.success("Checks completed");
      await fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checks failed");
    } finally {
      setRunning(false);
    }
  };

  const resolveCheck = async (checkId: string) => {
    try {
      const res = await fetch(
        `/api/applications/${appId}/resolve`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ checkId }) }
      );
      if (!res.ok) throw new Error("Failed to resolve");
      toast.success("Issue marked resolved");
      await fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Resolve failed");
    }
  };

  const blockers = checks.filter((c) => c.severity === "blocker" && c.status !== "pass");
  const warnings = checks.filter((c) => c.severity === "warning" && c.status !== "pass");
  const passed = checks.filter((c) => c.status === "pass");
  const score = readiness
    ? Math.round((readiness.passed / readiness.total) * 100)
    : checks.length > 0
      ? Math.round((passed.length / checks.length) * 100)
      : 0;

  if (loading) {
    return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-1">
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:underline">
          Dashboard
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm">{app?.citizenName}</span>
      </div>
      <h1 className="text-2xl font-bold mb-1">Preflight Checks</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Step 3: Run checks and resolve any blockers before submission.
      </p>

      {checks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Play className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-lg font-medium mb-2">No checks run yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Run preflight checks to evaluate your documents against the rule
              pack for this service.
            </p>
            <Button onClick={runChecks} disabled={running}>
              <Play className="h-4 w-4 mr-2" />
              {running ? "Running checks..." : "Run Preflight Checks"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="mb-6">
            <CardContent className="py-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Readiness Score</p>
                  <p className="text-3xl font-bold">
                    {passed.length}/{checks.length}
                  </p>
                </div>
                <div className="flex gap-3">
                  {blockers.length > 0 && (
                    <Badge variant="destructive" className="text-sm">
                      <XCircle className="h-3 w-3 mr-1" />
                      {blockers.length} blocker{blockers.length > 1 ? "s" : ""}
                    </Badge>
                  )}
                  {warnings.length > 0 && (
                    <Badge variant="secondary" className="text-sm">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {warnings.length} warning{warnings.length > 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>
              </div>
              <Progress value={score} className="h-3" />
              <div className="flex items-center gap-2 mt-3">
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  Advisory checks only — final verification stays with the
                  department (Tehsildar).
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between items-center mb-4">
            <Button onClick={runChecks} disabled={running} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              {running ? "Re-running..." : "Re-run Checks"}
            </Button>
            {blockers.length === 0 && (
              <Link href={`/applications/${appId}/packet`}>
                <Button size="sm">
                  View Packet
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            )}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="blockers">
                Blockers ({blockers.length})
              </TabsTrigger>
              <TabsTrigger value="warnings">
                Warnings ({warnings.length})
              </TabsTrigger>
              <TabsTrigger value="passed">
                Passed ({passed.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="blockers" className="space-y-3 mt-4">
              {blockers.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <CheckCircle2 className="h-8 w-8 mx-auto text-green-600 mb-2" />
                    <p className="font-medium">No blockers!</p>
                    <p className="text-sm text-muted-foreground">
                      All blocker checks have passed. You can proceed to the
                      packet.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                blockers.map((check) => (
                  <CheckCard
                    key={check.id}
                    check={check}
                    resolution={resolutions.find((r) => r.checkId === check.id)}
                    onResolve={() => resolveCheck(check.id)}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="warnings" className="space-y-3 mt-4">
              {warnings.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <CheckCircle2 className="h-8 w-8 mx-auto text-green-600 mb-2" />
                    <p className="font-medium">No warnings</p>
                  </CardContent>
                </Card>
              ) : (
                warnings.map((check) => (
                  <CheckCard
                    key={check.id}
                    check={check}
                    resolution={resolutions.find((r) => r.checkId === check.id)}
                    onResolve={() => resolveCheck(check.id)}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="passed" className="space-y-3 mt-4">
              {passed.map((check) => (
                <Card key={check.id}>
                  <CardContent className="py-3 flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">
                        {RULE_LABELS[check.ruleId] ?? check.ruleId}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {check.message}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </>
      )}

      <div className="flex justify-between mt-8">
        <Link href={`/applications/${appId}/documents`}>
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Documents
          </Button>
        </Link>
        {blockers.length === 0 && checks.length > 0 && (
          <Link href={`/applications/${appId}/packet`}>
            <Button>
              View Packet
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

function CheckCard({
  check,
  resolution,
  onResolve,
}: {
  check: Check;
  resolution?: Resolution;
  onResolve: () => void;
}) {
  const isBlocker = check.severity === "blocker";
  return (
    <Card className={isBlocker ? "border-destructive" : "border-amber-300"}>
      <CardContent className="py-4">
        <div className="flex items-start gap-3">
          {isBlocker ? (
            <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-medium">
                {RULE_LABELS[check.ruleId] ?? check.ruleId}
              </p>
              <Badge
                variant={isBlocker ? "destructive" : "secondary"}
                className="text-[10px]"
              >
                {check.severity}
              </Badge>
              {check.status === "manual_review" && (
                <Badge variant="outline" className="text-[10px]">
                  Manual Review
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-3">{check.message}</p>

            {resolution && (
              <div className="bg-muted rounded-lg p-3 mb-3">
                <p className="text-xs font-medium mb-1">How to fix:</p>
                <p className="text-sm">{resolution.plainLanguageFix}</p>
                {resolution.resolved && (
                  <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Marked as resolved
                  </p>
                )}
              </div>
            )}

            {!resolution?.resolved && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={onResolve}>
                  Mark Resolved
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
