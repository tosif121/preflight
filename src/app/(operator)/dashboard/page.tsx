"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  PlusCircle,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  ArrowRight,
} from "lucide-react";
import { getAuthUser, type AuthUser } from "@/lib/auth/client";
import { getStateById } from "@/lib/config/catalog";

interface Application {
  id: string;
  citizenName: string;
  operatorName: string;
  status: string;
  state: string;
  serviceId: string;
  createdAt: string;
  intendedUseDeadline: string | null;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType }
> = {
  draft: { label: "Draft", variant: "secondary", icon: FileText },
  checking: { label: "Checking", variant: "default", icon: Clock },
  blocked: { label: "Blocked", variant: "destructive", icon: XCircle },
  ready: { label: "Ready", variant: "outline", icon: CheckCircle2 },
  submitted: { label: "Submitted", variant: "default", icon: Send },
};

function formatServiceName(serviceId: string): string {
  return serviceId
    .replace(/^rj_|^up_|^ka_/, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/Certificate$/, "Certificate");
}

export default function DashboardPage() {
  const router = useRouter();
  const [auth, setAuth] = useState<AuthUser | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getAuthUser();
    if (!user) {
      router.push("/login");
      return;
    }
    setAuth(user);

    fetch(`/api/applications?stateId=${user.stateId}`)
      .then((r) => r.json())
      .then((data) => {
        setApplications(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  if (!auth) return null;

  const stateName = getStateById(auth.stateId)?.name ?? auth.stateId;

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Applications</h1>
          <p className="text-sm text-muted-foreground">
            {stateName} — {auth.role === "operator" ? "Service Operator" : "Citizen"} dashboard
          </p>
        </div>
        <Link href="/applications/new">
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            New Application
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-lg font-medium">No applications yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first application in {stateName} to get started.
            </p>
            <Link href="/applications/new">
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                New Application
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => {
            const cfg = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.draft;
            const Icon = cfg.icon;
            return (
              <Link key={app.id} href={`/applications/${app.id}/documents`}>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                  <CardContent className="py-4 flex items-center gap-4">
                    <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{app.citizenName}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatServiceName(app.serviceId)}
                      </p>
                    </div>
                    <Badge variant={cfg.variant}>{cfg.label}</Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
