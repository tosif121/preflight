"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Upload,
  FileText,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  User,
  Users,
  MapPin,
  AlertTriangle,
  Clock,
  Eye,
  XCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MockDoc {
  fileName: string;
  label: string;
  docType: string;
  quality?: "clean" | "mismatch" | "low_quality";
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
  ocrConfidence: number | null;
  extractedData: Record<string, unknown> | null;
}

interface Application {
  id: string;
  citizenName: string;
  status: string;
  stateName: string;
  serviceName: string;
  stateId: string;
  serviceId: string;
}

interface DocumentRequirement {
  id: string;
  docType: string;
  label: string;
  description: string;
  scope: "family_member" | "earning_member" | "application";
  required: boolean;
  memberHint?: string;
  reason?: string;
}

interface RequirementsResponse {
  requirements: DocumentRequirement[];
  summary: {
    total: number;
    required: number;
    memberDocs: number;
    generalDocs: number;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function getDocStatus(doc: Document | undefined): "uploaded" | "reading" | "complete" | "failed" | "missing" {
  if (!doc) return "missing";
  if (doc.ocrStatus === "pending") return "reading";
  if (doc.ocrStatus === "complete") return "complete";
  if (doc.ocrStatus === "failed") return "failed";
  return "uploaded";
}

function getStatusIcon(status: string) {
  switch (status) {
    case "complete":
      return <CheckCircle2 className="h-4 w-4 text-[#4A7A59]" />;
    case "reading":
      return <Clock className="h-4 w-4 text-[#F59E0B] animate-pulse" />;
    case "failed":
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <div className="w-4 h-4 rounded-full border-2 border-[#EAE5DC]" />;
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "complete":
      return "Read";
    case "reading":
      return "Reading...";
    case "failed":
      return "Failed to read";
    default:
      return "Not uploaded";
  }
}

// ─── Mock doc quality hints ───────────────────────────────────────────────────

const MOCK_QUALITY: Record<string, "clean" | "mismatch" | "low_quality"> = {
  "aadhaar-clean.svg": "clean",
  "aadhaar-name-mismatch.svg": "mismatch",
  "address-proof-clean.svg": "clean",
  "address-proof-mismatch.svg": "mismatch",
  "salary-slip-ramesh.svg": "clean",
  "salary-slip-sunita.svg": "clean",
  "photo-passport.svg": "clean",
  "aadhaar-low-quality.svg": "low_quality",
  "itr-priya.svg": "clean",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DocumentsPage() {
  const params = useParams();
  const router = useRouter();
  const appId = params.id as string;

  const [app, setApp] = useState<Application | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [docs, setDocs] = useState<Document[]>([]);
  const [mockDocs, setMockDocs] = useState<MockDoc[]>([]);
  const [requirements, setRequirements] = useState<DocumentRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<string | null>(null);
  const [selectedDocType, setSelectedDocType] = useState<string | null>(null);
  const [selectedMemberHint, setSelectedMemberHint] = useState<string | undefined>();
  const [expandedMember, setExpandedMember] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);

  const fetchData = useCallback(async () => {
    const [appRes, mockRes, reqRes] = await Promise.all([
      fetch(`/api/applications/${appId}`),
      fetch("/api/mock-docs"),
      fetch(`/api/applications/${appId}/requirements`),
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
    if (reqRes.ok) {
      const data: RequirementsResponse = await reqRes.json();
      setRequirements(data.requirements);
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
      if (memberHint) body.familyMemberId = memberHint;

      const res = await fetch(`/api/applications/${appId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Upload failed");
      }

      toast.success("Document added");
      setOpenDialog(null);
      await fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(null);
    }
  };

  const openAddDialog = (docType: string, memberHint?: string) => {
    setSelectedDocType(docType);
    setSelectedMemberHint(memberHint);
    setOpenDialog(`add-${docType}`);
  };

  const getDocsForMember = (memberId: string) =>
    docs.filter((d) => d.familyMemberId === memberId);

  const getDocForType = (docType: string, memberId?: string | null) =>
    docs.find((d) => d.docType === docType && (memberId ? d.familyMemberId === memberId : !d.familyMemberId));

  // Compute readiness
  const totalRequired = requirements.filter((r) => r.required).length;
  const uploadedCount = requirements.filter((r) => {
    const doc = getDocForType(r.docType, r.memberHint);
    return doc && doc.ocrStatus === "complete";
  }).length;
  const readingCount = requirements.filter((r) => {
    const doc = getDocForType(r.docType, r.memberHint);
    return doc && doc.ocrStatus === "pending";
  }).length;
  const missingCount = totalRequired - uploadedCount - readingCount;
  const readinessPercent = totalRequired > 0 ? Math.round((uploadedCount / totalRequired) * 100) : 0;

  const memberRequirements = requirements.filter((r) => r.scope === "family_member" || r.scope === "earning_member");
  const generalRequirements = requirements.filter((r) => r.scope === "application");

  // Group member requirements by member
  const memberReqsByMember: Record<string, DocumentRequirement[]> = {};
  for (const req of memberRequirements) {
    const memberId = req.memberHint ?? "unknown";
    if (!memberReqsByMember[memberId]) memberReqsByMember[memberId] = [];
    memberReqsByMember[memberId].push(req);
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

      {/* ─── Top Section ─────────────────────────────────────────────── */}
      <h1 className="text-2xl font-bold text-[#1C1B1A] mb-1">Bring your existing documents</h1>
      <p className="text-sm text-[#7A7771] mb-2">
        Add the documents you already have. Preflight will check them for missing information, inconsistencies and document quality.
      </p>

      {/* Application info bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Badge variant="secondary" className="gap-1.5">
          <MapPin className="h-3 w-3" />
          UMANG
        </Badge>
        <Badge variant="secondary" className="gap-1.5">
          <FileText className="h-3 w-3" />
          {app?.serviceName}
        </Badge>
        <span className="text-xs text-[#7A7771]">
          {members.length} family member{members.length !== 1 ? "s" : ""} &middot; {totalRequired} documents needed
        </span>
      </div>

      {/* ─── Document Readiness Summary ───────────────────────────────── */}
      <Card className="mb-8 border-[#EAE5DC]">
        <CardContent className="py-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-[#7A7771] uppercase tracking-wider">Document Readiness</p>
            <span className="text-sm font-bold text-[#1C1B1A]">{uploadedCount} / {totalRequired} added</span>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-[#EAE5DC] rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-[#4A7A59] rounded-full transition-all duration-500"
              style={{ width: `${readinessPercent}%` }}
            />
          </div>

          {/* Status counts */}
          <div className="flex items-center gap-6 mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#4A7A59]" />
              <span className="text-sm text-[#1C1B1A]">{uploadedCount} complete</span>
            </div>
            {readingCount > 0 && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#F59E0B] animate-pulse" />
                <span className="text-sm text-[#1C1B1A]">{readingCount} reading</span>
              </div>
            )}
            {missingCount > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-[#EAE5DC]" />
                <span className="text-sm text-[#1C1B1A]">{missingCount} missing</span>
              </div>
            )}
          </div>

          <p className="text-xs text-[#7A7771]">
            You can still run Preflight with incomplete documents. Missing documents are themselves something Preflight should detect.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
        <div>
          {/* ─── Documents by Family Member ──────────────────────────── */}
          <h2 className="text-lg font-bold text-[#1C1B1A] mb-1 flex items-center gap-2">
            <Users className="h-5 w-5 text-[#7A7771]" />
            Documents by family member
          </h2>
          <p className="text-sm text-[#7A7771] mb-4">
            Each person&apos;s required documents and their status
          </p>

          <div className="space-y-4 mb-8">
            {members.map((member) => {
              const memberDocs = getDocsForMember(member.id);
              const reqs = memberReqsByMember[member.id] ?? [];
              const allUploaded = reqs.every((r) => {
                const doc = getDocForType(r.docType, member.id);
                return doc && doc.ocrStatus === "complete";
              });
              const isExpanded = expandedMember === member.id || members.length === 1;

              return (
                <Card key={member.id} className={`border-[#EAE5DC] ${allUploaded ? "border-[#4A7A59]/30" : ""}`}>
                  <CardContent className="py-0">
                    {/* Member header */}
                    <button
                      onClick={() => setExpandedMember(isExpanded && members.length > 1 ? null : member.id)}
                      className="w-full flex items-center justify-between p-4 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#EAE5DC] flex items-center justify-center">
                          <User className="h-5 w-5 text-[#7A7771]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-[#1C1B1A]">{member.fullName}</span>
                            {allUploaded && <CheckCircle2 className="h-4 w-4 text-[#4A7A59]" />}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-[#7A7771]">{member.relation}</span>
                            {member.isEarning && (
                              <Badge variant="outline" className="text-[10px] border-[#4A7A59] text-[#4A7A59]">
                                earning member
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      {members.length > 1 && (
                        isExpanded ? <ChevronUp className="h-4 w-4 text-[#7A7771]" /> : <ChevronDown className="h-4 w-4 text-[#7A7771]" />
                      )}
                    </button>

                    {/* Document checklist */}
                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-2 border-t border-[#EAE5DC]">
                        <p className="text-[11px] font-semibold text-[#7A7771] uppercase tracking-wider pt-3 pb-1">
                          Required Documents
                        </p>
                        {reqs.map((req) => {
                          const doc = getDocForType(req.docType, member.id);
                          const status = getDocStatus(doc);

                          return (
                            <div key={req.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-[#FAF8F4]">
                              <div className="flex items-center gap-3 min-w-0">
                                {getStatusIcon(status)}
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-[#1C1B1A]">{req.label.split(" - ")[0]}</p>
                                  {doc ? (
                                    <p className="text-xs text-[#7A7771] truncate">{doc.mockFileName.replace(".svg", "")}</p>
                                  ) : (
                                    <p className="text-xs text-[#7A7771]">{req.description}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {doc && doc.ocrStatus === "complete" && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-xs"
                                    onClick={() => setPreviewDoc(doc)}
                                  >
                                    <Eye className="h-3 w-3 mr-1" />
                                    Preview
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 px-2 text-xs"
                                  onClick={() => openAddDialog(req.docType, member.id)}
                                >
                                  <Upload className="h-3 w-3 mr-1" />
                                  {doc ? "Replace" : "Add"}
                                </Button>
                              </div>
                            </div>
                          );
                        })}

                        {reqs.some((r) => r.scope === "earning_member") && (
                          <p className="text-[11px] text-[#7A7771] flex items-center gap-1 mt-2">
                            <Info className="h-3 w-3" />
                            Income documents are required because this person is marked as an earning family member.
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* ─── General Documents ──────────────────────────────────── */}
          <h2 className="text-lg font-bold text-[#1C1B1A] mb-1 flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#7A7771]" />
            General documents
          </h2>
          <p className="text-sm text-[#7A7771] mb-4">
            Documents that apply to the whole application
          </p>

          <div className="space-y-3 mb-8">
            {generalRequirements.map((req) => {
              const doc = getDocForType(req.docType);
              const status = getDocStatus(doc);

              return (
                <Card key={req.id} className={`border-[#EAE5DC] ${status === "complete" ? "border-[#4A7A59]/30" : ""}`}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        {getStatusIcon(status)}
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-[#1C1B1A]">{req.label}</p>
                          {doc ? (
                            <p className="text-xs text-[#7A7771] truncate">{doc.mockFileName.replace(".svg", "")}</p>
                          ) : (
                            <p className="text-xs text-[#7A7771]">{req.description}</p>
                          )}
                          {req.reason && (
                            <p className="text-[11px] text-[#7A7771] mt-0.5 italic">{req.reason}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {doc && doc.ocrStatus === "complete" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => setPreviewDoc(doc)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Preview
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => openAddDialog(req.docType)}
                        >
                          <Upload className="h-3 w-3 mr-1" />
                          {doc ? "Replace" : "Add"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* ─── Sidebar ────────────────────────────────────────────────── */}
        <div className="hidden lg:block">
          <div className="sticky top-6 space-y-6">
            {/* What happens next */}
            <Card className="border-[#EAE5DC]">
              <CardContent className="py-5">
                <p className="text-xs font-semibold text-[#7A7771] uppercase tracking-wider mb-3">What happens next</p>
                <div className="space-y-3">
                  {[
                    { num: 1, text: "We read your documents using AI (OpenAI Vision)" },
                    { num: 2, text: "Compare them with your application" },
                    { num: 3, text: "Find missing or inconsistent information" },
                    { num: 4, text: "Give you specific fixes" },
                    { num: 5, text: "You can replace documents and re-check" },
                  ].map((step) => (
                    <div key={step.num} className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#C85A40]/10 flex items-center justify-center text-[10px] font-bold text-[#C85A40] shrink-0 mt-0.5">
                        {step.num}
                      </span>
                      <p className="text-sm text-[#1C1B1A]">{step.text}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Documents added summary */}
            {docs.length > 0 && (
              <Card className="border-[#EAE5DC]">
                <CardContent className="py-5">
                  <p className="text-xs font-semibold text-[#7A7771] uppercase tracking-wider mb-3">Documents added</p>
                  <div className="space-y-2">
                    {docs.map((d) => {
                      const member = members.find((m) => m.id === d.familyMemberId);
                      return (
                        <div key={d.id} className="flex items-start gap-2">
                          {getStatusIcon(getDocStatus(d))}
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-[#1C1B1A] truncate">{d.mockFileName.replace(".svg", "")}</p>
                            <p className="text-[11px] text-[#7A7771]">
                              {DOC_TYPE_LABELS[d.docType] ?? d.docType}
                              {member && ` - ${member.fullName.split(" ")[0]}`}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* ─── Bottom CTA ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 pt-6 border-t border-[#EAE5DC]">
        <Link href="/dashboard">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to dashboard
          </Button>
        </Link>
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
          {uploadedCount < totalRequired && (
            <p className="text-xs text-[#7A7771]">
              {missingCount} document{missingCount !== 1 ? "s" : ""} missing - Preflight will flag them
            </p>
          )}
          <Link href={`/applications/${appId}/checks`}>
            <Button>
              {uploadedCount === 0 ? "Skip to Preflight" : uploadedCount < totalRequired ? "Run Preflight anyway" : "Run Preflight"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      {/* ─── Upload Dialog ───────────────────────────────────────────── */}
      <Dialog open={!!openDialog} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Add {selectedDocType ? (DOC_TYPE_LABELS[selectedDocType] ?? selectedDocType) : "document"}
            </DialogTitle>
            {selectedMemberHint && (
              <p className="text-sm text-[#7A7771]">
                For <span className="font-medium text-[#1C1B1A]">{members.find((m) => m.id === selectedMemberHint)?.fullName}</span>
              </p>
            )}
          </DialogHeader>

          {/* Why required */}
          {selectedDocType && (
            (() => {
              const req = requirements.find((r) => r.docType === selectedDocType && r.memberHint === selectedMemberHint);
              return req?.reason ? (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-[#FAF8F4] border border-[#EAE5DC]">
                  <Info className="h-4 w-4 text-[#7A7771] shrink-0 mt-0.5" />
                  <p className="text-xs text-[#7A7771]">{req.reason}</p>
                </div>
              ) : null;
            })()
          )}

          {/* Sample documents */}
          <div>
            <p className="text-xs font-semibold text-[#7A7771] uppercase tracking-wider mb-2">Use sample document</p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {mockDocs
                .filter((d) => d.docType === selectedDocType)
                .map((mock) => {
                  const quality = MOCK_QUALITY[mock.fileName] ?? "clean";
                  return (
                    <button
                      key={mock.fileName}
                      onClick={() => handleUpload(mock.fileName, mock.docType, selectedMemberHint)}
                      disabled={uploading !== null}
                      className="w-full text-left p-3 rounded-xl border border-[#EAE5DC] hover:border-[#C85A40]/30 hover:bg-[#C85A40]/5 transition-all disabled:opacity-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          quality === "clean" ? "bg-[#4A7A59]/10" :
                          quality === "mismatch" ? "bg-[#F59E0B]/10" :
                          "bg-red-50"
                        }`}>
                          {quality === "clean" ? (
                            <CheckCircle2 className="h-4 w-4 text-[#4A7A59]" />
                          ) : quality === "mismatch" ? (
                            <AlertTriangle className="h-4 w-4 text-[#F59E0B]" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#1C1B1A] truncate">{mock.label}</p>
                          <p className="text-xs text-[#7A7771]">
                            {quality === "clean" ? "Clean - should pass all checks" :
                             quality === "mismatch" ? "Name variation - will flag mismatch" :
                             "Low quality - may fail OCR"}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              {mockDocs.filter((d) => d.docType === selectedDocType).length === 0 && (
                <p className="text-sm text-[#7A7771] py-4 text-center">
                  No sample documents available for this type
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-[#EAE5DC]">
            <div className="flex-1 h-px bg-[#EAE5DC]" />
            <span className="text-xs text-[#7A7771]">OR</span>
            <div className="flex-1 h-px bg-[#EAE5DC]" />
          </div>

          <Button variant="outline" className="w-full" disabled>
            <Upload className="h-4 w-4 mr-2" />
            Upload your own document
          </Button>
          <p className="text-[11px] text-[#7A7771] text-center -mt-1">
            PDF, JPG or PNG (real file upload coming soon)
          </p>
        </DialogContent>
      </Dialog>

      {/* ─── Document Preview Dialog ─────────────────────────────────── */}
      <Dialog open={!!previewDoc} onOpenChange={(open) => !open && setPreviewDoc(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Document Preview</DialogTitle>
          </DialogHeader>

          {previewDoc && (
            <div className="space-y-4">
              {/* Document image placeholder */}
              <div className="aspect-[4/3] bg-[#F5F2EB] rounded-xl flex items-center justify-center border border-[#EAE5DC]">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-[#7A7771] mx-auto mb-2" />
                  <p className="text-sm font-medium text-[#1C1B1A]">{previewDoc.mockFileName.replace(".svg", "")}</p>
                  <p className="text-xs text-[#7A7771]">{DOC_TYPE_LABELS[previewDoc.docType]}</p>
                </div>
              </div>

              {/* Extracted information */}
              {previewDoc.extractedData && (
                <div>
                  <p className="text-xs font-semibold text-[#7A7771] uppercase tracking-wider mb-2">Extracted information</p>
                  <div className="space-y-1.5 p-3 rounded-lg bg-[#FAF8F4] border border-[#EAE5DC]">
                    {Object.entries(previewDoc.extractedData)
                      .filter(([key]) => !["normalized"].includes(key))
                      .slice(0, 6)
                      .map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between text-xs">
                          <span className="text-[#7A7771] capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                          <span className="font-medium text-[#1C1B1A]">{String(value)}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* OCR status */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#FAF8F4] border border-[#EAE5DC]">
                <span className="text-xs text-[#7A7771]">OCR Status</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(getDocStatus(previewDoc))}
                  <span className="text-xs font-medium text-[#1C1B1A]">{getStatusLabel(getDocStatus(previewDoc))}</span>
                </div>
              </div>

              {previewDoc.ocrConfidence !== null && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#FAF8F4] border border-[#EAE5DC]">
                  <span className="text-xs text-[#7A7771]">Confidence</span>
                  <span className="text-xs font-medium text-[#1C1B1A]">{Math.round(previewDoc.ocrConfidence * 100)}%</span>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
