"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, PlusCircle, ArrowRight, Lock, MapPin, Sparkles, CheckCircle2 } from "lucide-react";

interface StateItem {
  id: string;
  name: string;
  code: string;
  portalName: string;
  status: string;
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

const RELATIONS = ["self", "spouse", "father", "mother", "son", "daughter", "other"];

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  live: { label: "Live", color: "bg-[#4A7A59]/10 text-[#4A7A59]" },
  beta: { label: "Beta", color: "bg-[#F59E0B]/10 text-[#F59E0B]" },
  coming_soon: { label: "Coming Soon", color: "bg-muted text-muted-foreground" },
};

export default function NewApplicationPage() {
  const router = useRouter();
  const [states, setStates] = useState<StateItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [citizenName, setCitizenName] = useState("");
  const [deadline, setDeadline] = useState("");
  const [members, setMembers] = useState<MemberDraft[]>([
    { fullName: "", relation: "self", isEarning: true },
  ]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/states")
      .then((r) => r.json())
      .then((data) => setStates(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedState) { setServices([]); return; }
    fetch(`/api/states/${selectedState}/services`)
      .then((r) => r.json())
      .then((data) => setServices(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [selectedState]);

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
    if (!citizenName.trim()) { toast.error("Citizen name is required"); return; }
    if (!selectedState) { toast.error("Select a state"); return; }
    if (!selectedService) { toast.error("Select a service"); return; }
    const validMembers = members.filter((m) => m.fullName.trim());
    if (validMembers.length === 0) { toast.error("At least one family member is required"); return; }

    setSubmitting(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stateId: selectedState,
          serviceId: selectedService,
          citizenName: citizenName.trim(),
          intendedUseDeadline: deadline || null,
          familyMembers: validMembers.map((m) => ({
            fullName: m.fullName.trim(),
            relation: m.relation,
            isEarning: m.isEarning,
          })),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to create application");
      }

      const data = await res.json();
      toast.success("Application created");
      router.push(`/applications/${data.application.id}/documents`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold mb-1">New Application</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Step 1: Select state, service, and enter applicant details
      </p>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Select State
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {states.map((s) => (
              <button
                key={s.id}
                onClick={() => { setSelectedState(s.id); setSelectedService(""); }}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedState === s.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <p className="text-sm font-bold">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.portalName}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedState && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Select Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {services.map((svc) => {
              const badge = STATUS_BADGE[svc.status] ?? STATUS_BADGE.coming_soon;
              const enabled = svc.status !== "coming_soon";
              return (
                <div
                  key={svc.id}
                  onClick={() => enabled && setSelectedService(svc.id)}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedService === svc.id
                      ? "border-primary bg-primary/5"
                      : enabled
                      ? "border-border hover:border-primary/30"
                      : "border-dashed opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      {enabled ? (
                        <div className="w-3 h-3 rounded-full bg-primary" />
                      ) : (
                        <Lock className="h-3 w-3 text-muted-foreground" />
                      )}
                      <span className="text-sm font-medium">{svc.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 ml-5">{svc.description}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Applicant Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="citizen">Citizen Name (Head of Family)</Label>
            <Input
              id="citizen"
              value={citizenName}
              onChange={(e) => setCitizenName(e.target.value)}
              placeholder="e.g. Ramesh Kumar Sharma"
            />
          </div>
          <div>
            <Label htmlFor="deadline">Intended Use Deadline (optional)</Label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Family Members</CardTitle>
          <Button variant="outline" size="sm" onClick={addMember}>
            <PlusCircle className="h-4 w-4 mr-1" />
            Add Member
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {members.map((member, i) => (
            <div key={i} className="p-3 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Member {i + 1}</span>
                {members.length > 1 && (
                  <Button variant="ghost" size="sm" onClick={() => removeMember(i)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <Label>Full Name</Label>
                  <Input
                    value={member.fullName}
                    onChange={(e) => updateMember(i, "fullName", e.target.value)}
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <Label>Relation</Label>
                  <Select
                    value={member.relation}
                    onValueChange={(v) => v && updateMember(i, "relation", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RELATIONS.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r.charAt(0).toUpperCase() + r.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end gap-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={member.isEarning}
                      onChange={(e) => updateMember(i, "isEarning", e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    Earning member
                  </label>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={submitting} size="lg">
          {submitting ? "Creating..." : "Create Application"}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
