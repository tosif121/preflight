"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  ArrowLeft,
  Search,
  MapPin,
  FileText,
  User,
  Users,
  Trash2,
  PlusCircle,
  CheckCircle2,
  Lightbulb,
  Zap,
  Landmark,
  PiggyBank,
  ClipboardList,
  Info,
  ChevronRight,
  ClipboardCheck,
  Save,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StateItem {
  id: string;
  name: string;
  code: string;
  portalName: string;
}

interface ServiceItem {
  id: string;
  stateId: string;
  name: string;
  category: string;
  description: string;
  status: string;
}

interface MemberDraft {
  fullName: string;
  relation: string;
  isEarning: boolean;
}

interface WizardDraft {
  step: number;
  selectedState: string;
  selectedService: string;
  citizenName: string;
  deadline: string;
  hasDeadline: boolean;
  members: MemberDraft[];
  savedAt: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DRAFT_KEY = "preflight_wizard_draft";

const RELATIONS = ["self", "spouse", "father", "mother", "son", "daughter", "brother", "sister", "other"];

const STEPS = [
  { id: "state", label: "State", icon: MapPin },
  { id: "service", label: "Service", icon: FileText },
  { id: "details", label: "Details", icon: User },
  { id: "family", label: "Family", icon: Users },
  { id: "review", label: "Review", icon: ClipboardCheck },
];

const CATEGORY_ICON_MAP: Record<string, React.ElementType> = {
  certificate: Landmark,
  pension: PiggyBank,
  welfare: ClipboardList,
};

// Services that care about income
const INCOME_SERVICES = ["income", "widow-pension", "old-age-pension", "disability-pension", "scholarship", "ration-card"];
// Services where family is optional
const OPTIONAL_FAMILY = ["caste", "domicile", "birth", "death", "marriage", "disability", "driving-license", "trade-license"];
// Services that need specific family context
const PENSION_SERVICES = ["widow-pension", "old-age-pension", "disability-pension"];

// Required doc types per service category
const REQUIRED_DOCS: Record<string, string[]> = {
  certificate: ["Identity proof", "Address proof", "Supporting documents"],
  pension: ["Identity proof", "Address proof", "Age proof", "Income proof", "Bank proof"],
  welfare: ["Identity proof", "Address proof", "Eligibility documents"],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadDraft(): WizardDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as WizardDraft;
    const age = Date.now() - new Date(draft.savedAt).getTime();
    if (age > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(DRAFT_KEY);
      return null;
    }
    return draft;
  } catch {
    return null;
  }
}

function saveDraft(draft: Omit<WizardDraft, "savedAt">) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...draft, savedAt: new Date().toISOString() }));
  } catch {}
}

function clearDraft() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {}
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewApplicationPage() {
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [states, setStates] = useState<StateItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [citizenName, setCitizenName] = useState("");
  const [deadline, setDeadline] = useState("");
  const [hasDeadline, setHasDeadline] = useState(false);
  const [members, setMembers] = useState<MemberDraft[]>([
    { fullName: "", relation: "self", isEarning: true },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [stateSearch, setStateSearch] = useState("");
  const [serviceCount, setServiceCount] = useState<Record<string, number>>({});
  const [draftLoaded, setDraftLoaded] = useState(false);

  // Load draft on mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setStep(draft.step);
      setSelectedState(draft.selectedState);
      setSelectedService(draft.selectedService);
      setCitizenName(draft.citizenName);
      setDeadline(draft.deadline);
      setHasDeadline(draft.hasDeadline);
      if (draft.members.length > 0) setMembers(draft.members);
      toast("Draft restored from last session", { icon: "\u{1F4DD}" });
    }
    setDraftLoaded(true);
  }, []);

  // Autosave on every state change
  const autoSave = useCallback(() => {
    if (!draftLoaded) return;
    saveDraft({
      step,
      selectedState,
      selectedService,
      citizenName,
      deadline,
      hasDeadline,
      members,
    });
  }, [step, selectedState, selectedService, citizenName, deadline, hasDeadline, members, draftLoaded]);

  useEffect(() => {
    autoSave();
  }, [autoSave]);

  useEffect(() => {
    fetch("/api/states")
      .then((r) => r.json())
      .then((data) => {
        const list = (Array.isArray(data) ? data : []) as StateItem[];
        list.sort((a, b) => a.name.localeCompare(b.name));
        setStates(list);
        const counts: Record<string, number> = {};
        list.forEach((s) => { counts[s.id] = 0; });
        setServiceCount(counts);
        list.forEach((s) => {
          fetch(`/api/states/${s.id}/services`)
            .then((r) => r.json())
            .then((svcData) => {
              if (Array.isArray(svcData)) {
                setServiceCount((prev) => ({ ...prev, [s.id]: svcData.length }));
              }
            })
            .catch(() => {});
        });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedState) { setServices([]); return; }
    fetch(`/api/states/${selectedState}/services`)
      .then((r) => r.json())
      .then((data) => setServices(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [selectedState]);

  const selectedStateObj = states.find((s) => s.id === selectedState);
  const selectedServiceObj = services.find((s) => s.id === selectedService);
  const filteredStates = states.filter((s) =>
    s.name.toLowerCase().includes(stateSearch.toLowerCase())
  );
  const popularIds = ["rajasthan", "uttar_pradesh", "karnataka", "maharashtra", "delhi", "tamil_nadu"];
  const popular = filteredStates.filter((s) => popularIds.includes(s.id));
  const other = filteredStates.filter((s) => !popularIds.includes(s.id));

  // Service slug for context-aware forms
  const serviceSlug = selectedServiceObj?.id?.replace(/^[a-z]{2}-/, "") ?? "";
  const showIncome = INCOME_SERVICES.some((s) => serviceSlug.includes(s));
  const isOptionalFamily = OPTIONAL_FAMILY.some((s) => serviceSlug === s);
  const isPension = PENSION_SERVICES.some((s) => serviceSlug.includes(s));
  const requiredDocs = REQUIRED_DOCS[selectedServiceObj?.category ?? "certificate"] ?? REQUIRED_DOCS.certificate;

  const canNext = () => {
    if (step === 0) return !!selectedState;
    if (step === 1) return !!selectedService;
    if (step === 2) return citizenName.trim().length > 0;
    if (step === 3) return members.filter((m) => m.fullName.trim()).length > 0;
    if (step === 4) return true;
    return false;
  };

  const validMembers = members.filter((m) => m.fullName.trim());
  const earningCount = validMembers.filter((m) => m.isEarning).length;

  const addMember = () => {
    setMembers([...members, { fullName: "", relation: "son", isEarning: false }]);
  };

  const removeMember = (index: number) => {
    if (members.length > 1) {
      setMembers(members.filter((_, i) => i !== index));
    }
  };

  const updateMember = (index: number, field: keyof MemberDraft, value: string | boolean) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    setMembers(updated);
  };

  const handleSubmit = async () => {
    if (!validMembers.length) { toast.error("Add at least one family member"); return; }

    setSubmitting(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stateId: selectedState,
          serviceId: selectedService,
          citizenName: citizenName.trim(),
          intendedUseDeadline: hasDeadline && deadline ? deadline : null,
          familyMembers: validMembers.map((m) => ({
            fullName: m.fullName.trim(),
            relation: m.relation,
            isEarning: m.isEarning,
          })),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to create");
      }

      const data = await res.json();
      clearDraft();
      toast.success("Application created");
      router.push(`/applications/${data.application.id}/documents`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const loadDemo = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stateId: "rajasthan",
          serviceId: "rj-income",
          citizenName: "Ramesh Kumar Sharma",
          intendedUseDeadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          familyMembers: [
            { fullName: "Ramesh Kumar Sharma", relation: "self", isEarning: true },
            { fullName: "Sunita Sharma", relation: "spouse", isEarning: true },
            { fullName: "Amit Sharma", relation: "son", isEarning: false },
          ],
        }),
      });

      if (!res.ok) throw new Error("Failed to create demo");
      const data = await res.json();
      clearDraft();
      toast.success("Demo created - redirecting to documents");
      router.push(`/applications/${data.application.id}/documents`);
    } catch {
      toast.error("Failed to create demo");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#FAF8F4]">
      {/* Progress bar */}
      <div className="border-b border-[#EAE5DC] bg-[#FCF8F4]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-lg font-bold text-[#1C1B1A]">New Application</h1>
              <p className="text-xs text-[#7A7771]">Step-by-step guided setup</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#7A7771] flex items-center gap-1">
                <Save className="h-3 w-3" />
                Auto-saved
              </span>
              <Button variant="ghost" size="sm" onClick={loadDemo} disabled={submitting} className="text-xs gap-1.5">
                <Zap className="h-3.5 w-3.5" />
                Try 2-minute demo
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => {
              const active = i === step;
              const done = i < step;
              return (
                <div key={s.id} className="flex items-center gap-2 flex-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                    done ? "bg-[#4A7A59] text-white" : active ? "bg-[#C85A40] text-white" : "bg-[#EAE5DC] text-[#7A7771]"
                  }`}>
                    {done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                  </div>
                  <span className={`text-xs font-medium hidden sm:inline ${active ? "text-[#1C1B1A]" : "text-[#7A7771]"}`}>
                    {s.label}
                  </span>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 rounded ${done ? "bg-[#4A7A59]" : "bg-[#EAE5DC]"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          <div>
            {/* ─── Step 1: State ────────────────────────────────────────── */}
            {step === 0 && (
              <div>
                <h2 className="text-xl font-bold text-[#1C1B1A] mb-1">Where are you applying?</h2>
                <p className="text-sm text-[#7A7771] mb-5">Select the state or union territory</p>

                <div className="relative mb-5">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7A7771]" />
                  <Input
                    placeholder="Search state..."
                    value={stateSearch}
                    onChange={(e) => setStateSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {!stateSearch && popular.length > 0 && (
                  <div className="mb-5">
                    <p className="text-xs font-semibold text-[#7A7771] uppercase tracking-wider mb-3">Popular</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {popular.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setSelectedState(s.id)}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            selectedState === s.id
                              ? "border-[#C85A40] bg-[#C85A40]/5"
                              : "border-[#EAE5DC] hover:border-[#C85A40]/30 bg-white"
                          }`}
                        >
                          <p className="text-sm font-bold text-[#1C1B1A]">{s.name}</p>
                          <p className="text-xs text-[#7A7771]">{s.portalName}</p>
                          {serviceCount[s.id] !== undefined && (
                            <p className="text-[11px] text-[#4A7A59] font-medium mt-1">
                              {serviceCount[s.id]} services
                            </p>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold text-[#7A7771] uppercase tracking-wider mb-3">
                    {stateSearch ? "Results" : "All locations"}
                  </p>
                  <div className="space-y-1">
                    {(stateSearch ? filteredStates : other).map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedState(s.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                          selectedState === s.id
                            ? "bg-[#C85A40]/5 border border-[#C85A40]/20"
                            : "hover:bg-[#F5F2EB] border border-transparent"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#EAE5DC] flex items-center justify-center text-xs font-bold text-[#7A7771]">
                          {s.code}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#1C1B1A]">{s.name}</p>
                          <p className="text-xs text-[#7A7771]">{s.portalName}</p>
                        </div>
                        {serviceCount[s.id] !== undefined && (
                          <span className="text-[11px] text-[#4A7A59] font-medium">{serviceCount[s.id]} services</span>
                        )}
                        <ChevronRight className="h-4 w-4 text-[#7A7771]" />
                      </button>
                    ))}
                  </div>
                </div>

                {selectedState && (
                  <div className="mt-6 flex justify-end">
                    <Button onClick={() => setStep(1)}>
                      Continue to services
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* ─── Step 2: Service ──────────────────────────────────────── */}
            {step === 1 && (
              <div>
                <h2 className="text-xl font-bold text-[#1C1B1A] mb-1">What do you need?</h2>
                <p className="text-sm text-[#7A7771] mb-5">
                  {selectedStateObj?.name} &middot; {selectedStateObj?.portalName}
                </p>

                {(() => {
                  const categories = ["certificate", "pension", "welfare"];
                  return categories.map((cat) => {
                    const catServices = services.filter((s) => s.category === cat);
                    if (catServices.length === 0) return null;
                    const CatIcon = CATEGORY_ICON_MAP[cat] || FileText;
                    return (
                      <div key={cat} className="mb-6">
                        <p className="text-xs font-semibold text-[#7A7771] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                          <CatIcon className="h-3.5 w-3.5" />
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </p>
                        <div className="space-y-2">
                          {catServices.map((svc) => {
                            const isSelected = selectedService === svc.id;
                            return (
                              <button
                                key={svc.id}
                                onClick={() => setSelectedService(svc.id)}
                                className={`w-full text-left p-4 rounded-xl border transition-all ${
                                  isSelected
                                    ? "border-[#C85A40] bg-[#C85A40]/5 ring-1 ring-[#C85A40]/20"
                                    : "border-[#EAE5DC] hover:border-[#C85A40]/30 bg-white"
                                }`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <p className="text-sm font-semibold text-[#1C1B1A]">{svc.name}</p>
                                    <p className="text-xs text-[#7A7771] mt-0.5">{svc.description}</p>
                                  </div>
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-3 ${
                                    isSelected ? "border-[#C85A40] bg-[#C85A40]" : "border-[#EAE5DC]"
                                  }`}>
                                    {isSelected && <CheckCircle2 className="h-3 w-3 text-white" />}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  });
                })()}

                {selectedService && (
                  <Card className="mt-4 border-[#4A7A59]/20 bg-[#4A7A59]/5">
                    <CardContent className="py-4">
                      <p className="text-xs font-semibold text-[#4A7A59] uppercase tracking-wider mb-2">Documents you&apos;ll need</p>
                      <div className="space-y-1.5">
                        {requiredDocs.map((doc) => (
                          <div key={doc} className="flex items-center gap-2 text-sm text-[#1C1B1A]">
                            <CheckCircle2 className="h-3.5 w-3.5 text-[#4A7A59]" />
                            {doc}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-[#7A7771] mt-3">You can upload these on the next step.</p>
                    </CardContent>
                  </Card>
                )}

                <div className="mt-6 flex justify-between">
                  <Button variant="outline" onClick={() => setStep(0)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button onClick={() => setStep(2)} disabled={!selectedService}>
                    Continue to details
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* ─── Step 3: Applicant ────────────────────────────────────── */}
            {step === 2 && (
              <div>
                <h2 className="text-xl font-bold text-[#1C1B1A] mb-1">Who is applying?</h2>
                <p className="text-sm text-[#7A7771] mb-5">This person will be the primary applicant</p>

                <Card className="mb-5">
                  <CardContent className="py-5 space-y-4">
                    <div>
                      <Label htmlFor="citizen" className="mb-2 block">Full name</Label>
                      <Input
                        id="citizen"
                        value={citizenName}
                        onChange={(e) => setCitizenName(e.target.value)}
                        placeholder="e.g. Ramesh Kumar Sharma"
                      />
                      <p className="text-xs text-[#7A7771] mt-1.5">
                        Enter your name as shown on your primary identity document. Don&apos;t worry if another document has a different spelling - Preflight will detect and flag it.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="py-5">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="h-4 w-4 text-[#C85A40] shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#1C1B1A] mb-3">Do you have a submission deadline?</p>
                        <div className="flex gap-4 mb-3">
                          <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                              type="radio"
                              checked={hasDeadline}
                              onChange={() => setHasDeadline(true)}
                              className="accent-[#C85A40]"
                            />
                            Yes, I need this by a specific date
                          </label>
                          <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                              type="radio"
                              checked={!hasDeadline}
                              onChange={() => { setHasDeadline(false); setDeadline(""); }}
                              className="accent-[#C85A40]"
                            />
                            Not sure yet
                          </label>
                        </div>
                        {hasDeadline && (
                          <div>
                            <Input
                              type="date"
                              value={deadline}
                              onChange={(e) => setDeadline(e.target.value)}
                              className="max-w-[200px]"
                            />
                            <p className="text-xs text-[#7A7771] mt-1.5">
                              We&apos;ll use this to check if your documents are still valid.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="mt-6 flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button onClick={() => setStep(3)} disabled={!citizenName.trim()}>
                    Continue to family
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* ─── Step 4: Family ───────────────────────────────────────── */}
            {step === 3 && (
              <div>
                <h2 className="text-xl font-bold text-[#1C1B1A] mb-1">
                  {isPension ? "Applicant details" : "Family information"}
                </h2>
                <p className="text-sm text-[#7A7771] mb-1">
                  {showIncome
                    ? "Add family members - we'll match them against income documents"
                    : isOptionalFamily
                    ? "Add any additional family members if relevant"
                    : "Add people related to this application"
                  }
                </p>
                <div className="flex items-center gap-1.5 mb-5">
                  <Info className="h-3.5 w-3.5 text-[#7A7771]" />
                  <p className="text-xs text-[#7A7771]">
                    {showIncome
                      ? "We ask about earning members because this service considers total family income."
                      : "This helps us verify your documents against the right people."
                    }
                  </p>
                </div>

                <div className="space-y-3 mb-4">
                  {members.map((member, i) => (
                    <Card key={i}>
                      <CardContent className="py-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#EAE5DC] flex items-center justify-center">
                              <User className="h-4 w-4 text-[#7A7771]" />
                            </div>
                            <span className="text-sm font-medium text-[#1C1B1A]">
                              {member.fullName || `Person ${i + 1}`}
                            </span>
                            {member.fullName && (
                              <Badge variant="secondary" className="text-[10px]">
                                {member.relation}
                              </Badge>
                            )}
                          </div>
                          {members.length > 1 && (
                            <Button variant="ghost" size="sm" onClick={() => removeMember(i)} className="h-8 px-2">
                              <Trash2 className="h-3.5 w-3.5 text-[#C85A40]" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-3">
                          <Input
                            placeholder="Full name"
                            value={member.fullName}
                            onChange={(e) => updateMember(i, "fullName", e.target.value)}
                          />
                          <select
                            value={member.relation}
                            onChange={(e) => updateMember(i, "relation", e.target.value)}
                            className="h-10 px-3 rounded-lg border border-[#EAE5DC] bg-white text-sm text-[#1C1B1A] focus:outline-none focus:ring-2 focus:ring-[#C85A40]/20 focus:border-[#C85A40]"
                          >
                            {RELATIONS.map((r) => (
                              <option key={r} value={r}>
                                {r.charAt(0).toUpperCase() + r.slice(1)}
                              </option>
                            ))}
                          </select>
                        </div>
                        {showIncome && (
                          <label className="flex items-center gap-2 text-sm cursor-pointer mt-3 p-2 rounded-lg hover:bg-[#F5F2EB]">
                            <input
                              type="checkbox"
                              checked={member.isEarning}
                              onChange={(e) => updateMember(i, "isEarning", e.target.checked)}
                              className="rounded border-gray-300 accent-[#C85A40]"
                            />
                            <span className="text-[#7A7771]">This person earns income</span>
                          </label>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Button variant="outline" onClick={addMember} className="w-full border-dashed">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add family member
                </Button>

                <div className="mt-6 flex justify-between">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button onClick={() => setStep(4)} disabled={!canNext()}>
                    Review application
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* ─── Step 5: Review & Submit ──────────────────────────────── */}
            {step === 4 && (
              <div>
                <h2 className="text-xl font-bold text-[#1C1B1A] mb-1">Review your application</h2>
                <p className="text-sm text-[#7A7771] mb-5">Check everything looks right before we create it</p>

                <div className="space-y-4">
                  <Card>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-semibold text-[#7A7771] uppercase tracking-wider">State</p>
                        <Button variant="ghost" size="sm" onClick={() => setStep(0)} className="h-7 text-xs text-[#C85A40]">
                          Change
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-[#7A7771]" />
                        <span className="text-sm font-medium text-[#1C1B1A]">{selectedStateObj?.name}</span>
                        <span className="text-xs text-[#7A7771]">&middot; {selectedStateObj?.portalName}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-semibold text-[#7A7771] uppercase tracking-wider">Service</p>
                        <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="h-7 text-xs text-[#C85A40]">
                          Change
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-[#7A7771]" />
                        <span className="text-sm font-medium text-[#1C1B1A]">{selectedServiceObj?.name}</span>
                      </div>
                      <p className="text-xs text-[#7A7771] mt-1 ml-6">{selectedServiceObj?.description}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-semibold text-[#7A7771] uppercase tracking-wider">Applicant</p>
                        <Button variant="ghost" size="sm" onClick={() => setStep(2)} className="h-7 text-xs text-[#C85A40]">
                          Change
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-[#7A7771]" />
                        <span className="text-sm font-medium text-[#1C1B1A]">{citizenName}</span>
                      </div>
                      {hasDeadline && deadline && (
                        <p className="text-xs text-[#7A7771] mt-1 ml-6">
                          Deadline: {new Date(deadline).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-semibold text-[#7A7771] uppercase tracking-wider">Family members</p>
                        <Button variant="ghost" size="sm" onClick={() => setStep(3)} className="h-7 text-xs text-[#C85A40]">
                          Change
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {validMembers.map((m, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <User className="h-3.5 w-3.5 text-[#7A7771]" />
                            <span className="text-sm text-[#1C1B1A]">{m.fullName}</span>
                            <Badge variant="secondary" className="text-[10px]">{m.relation}</Badge>
                            {showIncome && m.isEarning && (
                              <Badge variant="outline" className="text-[10px] border-[#4A7A59] text-[#4A7A59]">earns income</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                      {showIncome && (
                        <p className="text-xs text-[#7A7771] mt-2">
                          {earningCount} earning member{earningCount !== 1 ? "s" : ""} will be included in income verification.
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-[#F59E0B]/20 bg-[#F59E0B]/5">
                    <CardContent className="py-4">
                      <p className="text-xs font-semibold text-[#F59E0B] uppercase tracking-wider mb-2">What happens next</p>
                      <div className="space-y-1.5 text-sm text-[#1C1B1A]">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#F59E0B]/20 flex items-center justify-center text-[10px] font-bold text-[#F59E0B]">1</span>
                          Upload your documents (identity, address, income, etc.)
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#F59E0B]/20 flex items-center justify-center text-[10px] font-bold text-[#F59E0B]">2</span>
                          Preflight runs automated checks on every document
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#F59E0B]/20 flex items-center justify-center text-[10px] font-bold text-[#F59E0B]">3</span>
                          Fix any issues flagged, then submit with confidence
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-6 flex justify-between">
                  <Button variant="outline" onClick={() => setStep(3)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button onClick={handleSubmit} disabled={submitting}>
                    {submitting ? "Creating..." : "Create application & go to documents"}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-6">
              <Card>
                <CardContent className="py-5">
                  <p className="text-xs font-semibold text-[#7A7771] uppercase tracking-wider mb-3">Your application</p>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-3.5 w-3.5 text-[#7A7771]" />
                      {selectedStateObj ? (
                        <span className="font-medium text-[#1C1B1A]">{selectedStateObj.name}</span>
                      ) : (
                        <span className="text-[#7A7771]">Select state</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-3.5 w-3.5 text-[#7A7771]" />
                      {selectedServiceObj ? (
                        <span className="font-medium text-[#1C1B1A]">{selectedServiceObj.name}</span>
                      ) : (
                        <span className="text-[#7A7771]">Select service</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-3.5 w-3.5 text-[#7A7771]" />
                      {citizenName ? (
                        <span className="font-medium text-[#1C1B1A]">{citizenName}</span>
                      ) : (
                        <span className="text-[#7A7771]">Enter name</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-3.5 w-3.5 text-[#7A7771]" />
                      <span className="font-medium text-[#1C1B1A]">
                        {validMembers.length} member{validMembers.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-[#EAE5DC]">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-[#7A7771]">Setup</p>
                      <p className="text-xs font-medium text-[#1C1B1A]">{Math.round(((step + 1) / STEPS.length) * 100)}%</p>
                    </div>
                    <div className="h-1.5 bg-[#EAE5DC] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#C85A40] rounded-full transition-all"
                        style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
