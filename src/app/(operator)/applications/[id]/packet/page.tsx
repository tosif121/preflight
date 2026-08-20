"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  ArrowLeft,
  Send,
  ShieldCheck,
  ExternalLink,
  FileText,
} from "lucide-react";

interface Application {
  id: string;
  citizenName: string;
  operatorName: string;
  status: string;
  stateName: string;
  serviceName: string;
  intendedUseDeadline: string | null;
}

interface FamilyMember {
  id: string;
  fullName: string;
  relation: string;
  isEarning: boolean;
}

interface Doc {
  id: string;
  docType: string;
  mockFileName: string;
  ocrStatus: string;
  ocrConfidence: number | null;
}

export default function PacketPage() {
  const params = useParams();
  const router = useRouter();
  const appId = params.id as string;

  const [app, setApp] = useState<Application | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    const res = await fetch(`/api/applications/${appId}`);
    if (res.ok) {
      const data = await res.json();
      setApp(data.application);
      setMembers(data.members ?? []);
      setDocs(data.documents ?? []);
    }
    setLoading(false);
  }, [appId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/applications/${appId}/submit`, {
        method: "POST",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Submission failed");
      }
      toast.success("Application submitted (mock)");
      await fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

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

  const isSubmitted = app?.status === "submitted";

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-1">
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:underline">
          Dashboard
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm">{app?.citizenName}</span>
      </div>
      <h1 className="text-2xl font-bold mb-1">
        {isSubmitted ? "Application Submitted" : "Application Packet"}
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        Step 4: Review and submit the application.
      </p>

      <Card className="mb-6 border-amber-300 bg-amber-50">
        <CardContent className="py-4 flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              Advisory — Not Official Verification
            </p>
            <p className="text-xs text-amber-700 mt-1">
              Preflight checks are pre-submission quality checks only. Final
              verification and approval remains with the department (Tehsildar).
              This tool does not claim official government verification.
            </p>
          </div>
        </CardContent>
      </Card>

      {isSubmitted && (
        <Card className="mb-6 border-green-300 bg-green-50">
          <CardContent className="py-4 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-800">
                Application Submitted (Mock)
              </p>
              <p className="text-xs text-green-700 mt-1">
                This is a prototype submission. No real government system was
                contacted. The application would normally be forwarded to the
                Tehsildar for final verification.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Application Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Citizen</p>
              <p className="font-medium">{app?.citizenName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Operator</p>
              <p className="font-medium">{app?.operatorName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Service</p>
              <p className="font-medium">{app?.serviceName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">State</p>
              <p className="font-medium">{app?.stateName}</p>
            </div>
            {app?.intendedUseDeadline && (
              <div>
                <p className="text-muted-foreground">Use By Date</p>
                <p className="font-medium">{app.intendedUseDeadline}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Family Members ({members.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {members.map((m) => (
              <div key={m.id} className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="font-medium">{m.fullName}</span>
                <Badge variant="secondary" className="text-xs">
                  {m.relation}
                </Badge>
                {m.isEarning && (
                  <Badge variant="default" className="text-xs">Earning</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Documents ({docs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {docs.map((d) => (
              <div key={d.id} className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="truncate">{d.mockFileName}</span>
                {d.ocrConfidence !== null && (
                  <span className="text-xs text-muted-foreground">
                    OCR: {Math.round(d.ocrConfidence * 100)}%
                  </span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Fee (Mock)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm">
            <span>eMitra Service Fee</span>
            <span className="font-medium">₹40 (mock — no real payment processed)</span>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex items-center gap-2 text-sm">
            <ExternalLink className="h-4 w-4" />
            <Link
              href={`/reviewer-gateway/${appId}`}
              className="text-primary hover:underline"
            >
              View Reviewer Evidence Trail (Prototype)
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Link href={`/applications/${appId}/checks`}>
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Checks
          </Button>
        </Link>
        {!isSubmitted ? (
          <Button onClick={handleSubmit} disabled={submitting}>
            <Send className="h-4 w-4 mr-2" />
            {submitting ? "Submitting..." : "Confirm & Submit (mock)"}
          </Button>
        ) : (
          <Badge variant="default" className="text-sm py-2 px-4">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Submitted
          </Badge>
        )}
      </div>
    </div>
  );
}
