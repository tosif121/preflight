"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Upload,
  FileText,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  User,
  Image,
} from "lucide-react";

interface MockDoc {
  fileName: string;
  label: string;
  docType: string;
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

interface Application {
  id: string;
  citizenName: string;
  status: string;
}

const DOC_TYPE_LABELS: Record<string, string> = {
  identity_proof: "Identity Proof (Aadhaar)",
  address_proof: "Address Proof",
  income_proof_salaried: "Income Proof — Salaried",
  income_proof_nonsalaried: "Income Proof — Non-Salaried",
  photo: "Passport Photo",
};

export default function DocumentsPage() {
  const params = useParams();
  const router = useRouter();
  const appId = params.id as string;

  const [app, setApp] = useState<Application | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [docs, setDocs] = useState<Document[]>([]);
  const [mockDocs, setMockDocs] = useState<MockDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const [appRes, mockRes] = await Promise.all([
      fetch(`/api/applications/${appId}`),
      fetch("/api/mock-docs"),
    ]);
    if (appRes.ok) {
      const data = await appRes.json();
      setApp(data.application);
      setMembers(data.members ?? []);
      setDocs(data.documents ?? []);
    }
    if (mockRes.ok) {
      setMockDocs(await mockRes.json());
    }
    setLoading(false);
  }, [appId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpload = async (mockFileName: string, docType: string, memberHint?: string) => {
    setUploading(mockFileName);
    try {
      const body: Record<string, unknown> = { docType, mockFileName };
      const targetMember = memberHint;
      if (targetMember) body.familyMemberId = targetMember;

      const res = await fetch(`/api/applications/${appId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Upload failed");
      }

      toast.success("Document uploaded and OCR processed");
      await fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(null);
    }
  };

  const getDocsForMember = (memberId: string) =>
    docs.filter((d) => d.familyMemberId === memberId);

  const requiredDocs = [
    ...members.flatMap((m) => [
      { docType: "identity_proof", memberId: m.id, label: `Identity Proof — ${m.fullName}` },
      ...(m.isEarning
        ? [{ docType: "income_proof_salaried", memberId: m.id, label: `Income Proof — ${m.fullName}` }]
        : []),
    ]),
    { docType: "address_proof", memberId: null, label: "Address Proof" },
    { docType: "photo", memberId: null, label: "Passport Photo" },
  ];

  const uploadedCount = requiredDocs.filter((req) => {
    if (req.memberId) {
      return docs.some(
        (d) =>
          d.familyMemberId === req.memberId &&
          (d.docType === req.docType || (req.docType === "income_proof_salaried" && (d.docType === "income_proof_salaried" || d.docType === "income_proof_nonsalaried")))
      );
    }
    return docs.some((d) => d.docType === req.docType && !d.familyMemberId);
  }).length;

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

  const memberDocTypes = ["identity_proof", "income_proof_salaried", "income_proof_nonsalaried"];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-1">
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:underline">
          Dashboard
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm">{app?.citizenName}</span>
      </div>
      <h1 className="text-2xl font-bold mb-1">Upload Documents</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Step 2: Attach documents for each family member and general requirements.
        <span className="ml-1 font-medium">
          {uploadedCount}/{requiredDocs.length} uploaded
        </span>
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <User className="h-4 w-4" />
            Per-Member Documents
          </h2>
          {members.map((member) => {
            const memberDocs = getDocsForMember(member.id);
            return (
              <Card key={member.id}>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {member.fullName}
                    <Badge variant="secondary" className="text-xs">{member.relation}</Badge>
                    {member.isEarning && <Badge variant="default" className="text-xs">Earning</Badge>}
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2 space-y-2">
                  <div className="text-xs text-muted-foreground">
                    Identity proof: {memberDocs.some((d) => d.docType === "identity_proof") ? (
                      <span className="text-green-600">Uploaded</span>
                    ) : (
                      <span className="text-amber-600">Missing</span>
                    )}
                  </div>
                  {member.isEarning && (
                    <div className="text-xs text-muted-foreground">
                      Income proof: {memberDocs.some(
                        (d) => d.docType === "income_proof_salaried" || d.docType === "income_proof_nonsalaried"
                      ) ? (
                        <span className="text-green-600">Uploaded</span>
                      ) : (
                        <span className="text-amber-600">Missing</span>
                      )}
                    </div>
                  )}
                  <Dialog>
                    <DialogTrigger
                      render={
                        <Button variant="outline" size="sm" className="mt-2">
                          <Upload className="h-3 w-3 mr-1" />
                          Upload for {member.fullName.split(" ")[0]}
                        </Button>
                      }
                    />
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Upload Document for {member.fullName}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-2 max-h-80 overflow-y-auto">
                        {mockDocs
                          .filter((d) => memberDocTypes.includes(d.docType))
                          .map((mock) => (
                            <button
                              key={mock.fileName}
                              onClick={() => handleUpload(mock.fileName, mock.docType, member.id)}
                              disabled={uploading !== null}
                              className="w-full text-left p-3 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-50"
                            >
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-sm font-medium truncate">{mock.label}</p>
                                  <p className="text-xs text-muted-foreground">{DOC_TYPE_LABELS[mock.docType]}</p>
                                </div>
                              </div>
                            </button>
                          ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Image className="h-4 w-4" />
            General Documents
          </h2>
          {[
            { docType: "address_proof", label: "Address Proof" },
            { docType: "photo", label: "Passport Photo" },
          ].map((req) => {
            const existing = docs.find((d) => d.docType === req.docType && !d.familyMemberId);
            return (
              <Card key={req.docType}>
                <CardContent className="py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{req.label}</p>
                    {existing ? (
                      <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                        <CheckCircle2 className="h-3 w-3" />
                        {existing.mockFileName}
                      </p>
                    ) : (
                      <p className="text-xs text-amber-600 mt-1">Not uploaded</p>
                    )}
                  </div>
                  <Dialog>
                    <DialogTrigger
                      render={
                        <Button variant="outline" size="sm">
                          <Upload className="h-3 w-3 mr-1" />
                          {existing ? "Replace" : "Upload"}
                        </Button>
                      }
                    />
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Select {req.label}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-2 max-h-80 overflow-y-auto">
                        {mockDocs
                          .filter((d) => d.docType === req.docType)
                          .map((mock) => (
                            <button
                              key={mock.fileName}
                              onClick={() => handleUpload(mock.fileName, mock.docType)}
                              disabled={uploading !== null}
                              className="w-full text-left p-3 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-50"
                            >
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 shrink-0" />
                                <span className="text-sm">{mock.label}</span>
                              </div>
                            </button>
                          ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            );
          })}

          <Card className="mt-6 border-dashed">
            <CardContent className="py-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Uploaded Documents ({docs.length})</span>
              </div>
              {docs.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No documents uploaded yet. Start by uploading identity proofs for each family member.
                </p>
              ) : (
                <div className="space-y-1">
                  {docs.map((d) => (
                    <div key={d.id} className="flex items-center gap-2 text-xs">
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                      <span className="truncate">{d.mockFileName}</span>
                      <Badge variant="outline" className="text-[10px] ml-auto">{DOC_TYPE_LABELS[d.docType]}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Link href="/dashboard">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <Link href={`/applications/${appId}/checks`}>
          <Button>
            Run Checks
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
