"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { SECTORS, FUNDING_STAGES } from "@/lib/constants";
import { createDeal } from "@/actions/deals";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

type FounderInput = {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  title: string;
};

export function DealForm({ prefill }: { prefill?: Partial<{
  companyName: string;
  website: string;
  sector: string;
  fundingStage: string;
  chequeSize: number;
  source: string;
  sourceType: string;
  founders: FounderInput[];
  summary: string;
  confidence: number;
}> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [founders, setFounders] = useState<FounderInput[]>(
    prefill?.founders || [{ name: "", email: "", phone: "", linkedin: "", title: "" }]
  );

  const addFounder = () => {
    setFounders([...founders, { name: "", email: "", phone: "", linkedin: "", title: "" }]);
  };

  const removeFounder = (idx: number) => {
    setFounders(founders.filter((_, i) => i !== idx));
  };

  const updateFounder = (idx: number, field: keyof FounderInput, value: string) => {
    const updated = [...founders];
    updated[idx] = { ...updated[idx], [field]: value };
    setFounders(updated);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const deal = await createDeal({
        companyName: formData.get("companyName") as string,
        website: (formData.get("website") as string) || undefined,
        sector: (formData.get("sector") as never) || undefined,
        fundingStage: (formData.get("fundingStage") as never) || undefined,
        chequeSize: formData.get("chequeSize") ? Number(formData.get("chequeSize")) : undefined,
        source: (formData.get("source") as string) || undefined,
        sourceType: (formData.get("sourceType") as never) || undefined,
        sectorFit: formData.get("sectorFit") === "on" || undefined,
        stageFit: formData.get("stageFit") === "on" || undefined,
        chequeFit: formData.get("chequeFit") === "on" || undefined,
        razorpayRelevance: formData.get("razorpayRelevance") === "on" || undefined,
        founderBackground: (formData.get("founderBackground") as string) || undefined,
        founders: founders.filter((f) => f.name.trim()),
      });

      toast.success(`Deal created: ${deal.companyName}`);
      router.push(`/deals/${deal.id}`);
    } catch (err) {
      toast.error("Failed to create deal");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Company Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Company Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name *</Label>
            <Input
              id="companyName"
              name="companyName"
              required
              defaultValue={prefill?.companyName}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input id="website" name="website" defaultValue={prefill?.website} placeholder="https://" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sector">Sector</Label>
            <Select name="sector" defaultValue={prefill?.sector}>
              <SelectTrigger>
                <SelectValue placeholder="Select sector" />
              </SelectTrigger>
              <SelectContent>
                {SECTORS.map((s) => (
                  <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fundingStage">Funding Stage</Label>
            <Select name="fundingStage" defaultValue={prefill?.fundingStage}>
              <SelectTrigger>
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent>
                {FUNDING_STAGES.map((s) => (
                  <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="chequeSize">Cheque Size ($)</Label>
            <Input
              id="chequeSize"
              name="chequeSize"
              type="number"
              defaultValue={prefill?.chequeSize}
              placeholder="50000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="source">Source (who referred)</Label>
            <Input id="source" name="source" defaultValue={prefill?.source} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sourceType">Source Type</Label>
            <Select name="sourceType" defaultValue={prefill?.sourceType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INBOUND">Inbound</SelectItem>
                <SelectItem value="VC_FORWARD">VC Forward</SelectItem>
                <SelectItem value="COLD_DM">Cold DM</SelectItem>
                <SelectItem value="RAZORPAY_NETWORK">Razorpay Network</SelectItem>
                <SelectItem value="EMAIL_FORWARD">Email Forward</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Founders */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Founders</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addFounder}>
              <Plus className="h-3 w-3 mr-1" /> Add Founder
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {founders.map((founder, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end border-b pb-3">
              <div className="space-y-1">
                <Label className="text-xs">Name</Label>
                <Input
                  value={founder.name}
                  onChange={(e) => updateFounder(idx, "name", e.target.value)}
                  placeholder="Name"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Email</Label>
                <Input
                  value={founder.email}
                  onChange={(e) => updateFounder(idx, "email", e.target.value)}
                  placeholder="Email"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Phone</Label>
                <Input
                  value={founder.phone}
                  onChange={(e) => updateFounder(idx, "phone", e.target.value)}
                  placeholder="Phone"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Title</Label>
                <Input
                  value={founder.title}
                  onChange={(e) => updateFounder(idx, "title", e.target.value)}
                  placeholder="CEO"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeFounder(idx)}
                disabled={founders.length <= 1}
                className="self-end"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Screening */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Screening Criteria</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Switch id="sectorFit" name="sectorFit" />
              <Label htmlFor="sectorFit">Sector Fit</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="stageFit" name="stageFit" />
              <Label htmlFor="stageFit">Stage Fit</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="chequeFit" name="chequeFit" />
              <Label htmlFor="chequeFit">Cheque Fit</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="razorpayRelevance" name="razorpayRelevance" />
              <Label htmlFor="razorpayRelevance">Razorpay Relevance</Label>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="founderBackground">Founder Background</Label>
            <Textarea id="founderBackground" name="founderBackground" rows={3} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Deal"}
        </Button>
      </div>
    </form>
  );
}
