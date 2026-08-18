"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  ShieldAlert,
  Clock,
} from "lucide-react";

interface AuditEvent {
  id: string;
  eventType: string;
  payload: Record<string, unknown> | null;
  createdAt: string;
}

export default function ReviewerGatewayPage() {
  const params = useParams();
  const appId = params.id as string;

  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const res = await fetch(`/api/applications/${appId}`);
    if (res.ok) {
      const data = await res.json();
      setAuditEvents(data.auditEvents ?? []);
    }
    setLoading(false);
  }, [appId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const EVENT_LABELS: Record<string, string> = {
    application_created: "Application Created",
    documents_uploaded: "Documents Uploaded",
    checks_run: "Preflight Checks Run",
    issue_resolved: "Issue Resolved",
    packet_ready: "Packet Ready",
    submitted_mock: "Submitted (Mock)",
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Card className="mb-6 border-amber-300 bg-amber-50">
        <CardContent className="py-4 flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              Prototype — Not a Real Government Integration
            </p>
            <p className="text-xs text-amber-700 mt-1">
              This reviewer gateway is for demonstration purposes only. It shows
              the structured evidence trail that Preflight produces. No real
              government systems are involved.
            </p>
          </div>
        </CardContent>
      </Card>

      <h1 className="text-2xl font-bold mb-1">Reviewer Evidence Trail</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Application ID: {appId}
      </p>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Audit Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {auditEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No events recorded.</p>
          ) : (
            <div className="space-y-4">
              {auditEvents.map((event, i) => (
                <div key={event.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-primary mt-1" />
                    {i < auditEvents.length - 1 && (
                      <div className="w-px flex-1 bg-border" />
                    )}
                  </div>
                  <div className="pb-4 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium">
                        {EVENT_LABELS[event.eventType] ?? event.eventType}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {new Date(event.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {event.payload && (
                      <div className="bg-muted rounded-md p-3 text-xs font-mono overflow-x-auto">
                        <pre>{JSON.stringify(event.payload, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Evidence Structure Per Field</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            For each field checked, Preflight produces a structured evidence
            record:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                label: "Claim",
                desc: "The value from the application",
                icon: FileText,
              },
              {
                label: "Evidence",
                desc: "The source document",
                icon: FileText,
              },
              {
                label: "Rule",
                desc: "What was checked",
                icon: AlertTriangle,
              },
              {
                label: "Result",
                desc: "Match / Mismatch / Manual Review",
                icon: CheckCircle2,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="border rounded-lg p-3">
                  <Icon className="h-4 w-4 text-primary mb-1" />
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            This structured evidence trail enables the department to quickly
            verify the pre-submission checks without re-examining every document
            from scratch.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
