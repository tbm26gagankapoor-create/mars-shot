"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SECTORS, FUNDING_STAGES, BUSINESS_MODELS } from "@/lib/constants";
import { createDeal } from "@/actions/deals";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ChevronDown } from "lucide-react";
import { TagInput } from "./tag-input";
import { ContactSearchCombobox } from "./contact-search-combobox";
import { cn } from "@/lib/utils";

type FounderInput = {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  title: string;
  previousCompanies: string;
  education: string;
  twitter: string;
};

const emptyFounder: FounderInput = {
  name: "", email: "", phone: "", linkedin: "", title: "",
  previousCompanies: "", education: "", twitter: "",
};

type PrefillData = Partial<{
  companyName: string;
  website: string;
  sector: string;
  fundingStage: string;
  chequeSize: number;
  source: string;
  sourceType: string;
  founders: FounderInput[];
  description: string;
  location: string;
  totalRoundSize: number;
  preMoneyValuation: number;
  businessModel: string;
  revenue: number;
  revenueType: string;
  burnRate: number;
  runway: number;
  existingInvestors: string;
  teamSize: number;
  tags: string[];
}>;

export function DealForm({ prefill }: { prefill?: PrefillData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [founders, setFounders] = useState<FounderInput[]>(
    prefill?.founders || [{ ...emptyFounder }]
  );
  const [tags, setTags] = useState<string[]>(prefill?.tags || []);
  const [referredByContactId, setReferredByContactId] = useState("");
  const [expandedFounders, setExpandedFounders] = useState<Set<number>>(new Set());

  const addFounder = () => setFounders([...founders, { ...emptyFounder }]);
  const removeFounder = (idx: number) => setFounders(founders.filter((_, i) => i !== idx));
  const updateFounder = (idx: number, field: keyof FounderInput, value: string) => {
    const updated = [...founders];
    updated[idx] = { ...updated[idx], [field]: value };
    setFounders(updated);
  };
  const toggleFounderExpand = (idx: number) => {
    const next = new Set(expandedFounders);
    next.has(idx) ? next.delete(idx) : next.add(idx);
    setExpandedFounders(next);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const str = (key: string) => (fd.get(key) as string) || undefined;
    const num = (key: string) => fd.get(key) ? Number(fd.get(key)) : undefined;

    try {
      const deal = await createDeal({
        companyName: fd.get("companyName") as string,
        website: str("website"),
        sector: str("sector") as never,
        fundingStage: str("fundingStage") as never,
        chequeSize: num("chequeSize"),
        source: str("source"),
        sourceType: str("sourceType") as never,
        description: str("description"),
        location: str("location"),
        totalRoundSize: num("totalRoundSize"),
        preMoneyValuation: num("preMoneyValuation"),
        businessModel: str("businessModel") as never,
        revenue: num("revenue"),
        revenueType: str("revenueType") as never,
        burnRate: num("burnRate"),
        runway: num("runway"),
        existingInvestors: str("existingInvestors"),
        teamSize: num("teamSize"),
        foundedDate: str("foundedDate") || undefined,
        legalEntityName: str("legalEntityName"),
        referredByContactId: referredByContactId || undefined,
        tags,
        convictionScore: num("convictionScore"),
        sectorFit: fd.get("sectorFit") === "on" || undefined,
        stageFit: fd.get("stageFit") === "on" || undefined,
        chequeFit: fd.get("chequeFit") === "on" || undefined,
        razorpayRelevance: fd.get("razorpayRelevance") === "on" || undefined,
        founderBackground: str("founderBackground"),
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
      {/* 1. Company Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Company Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name *</Label>
            <Input id="companyName" name="companyName" required defaultValue={prefill?.companyName} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input id="website" name="website" defaultValue={prefill?.website} placeholder="https://" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sector">Sector</Label>
            <Select name="sector" defaultValue={prefill?.sector}>
              <SelectTrigger><SelectValue placeholder="Select sector" /></SelectTrigger>
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
              <SelectTrigger><SelectValue placeholder="Select stage" /></SelectTrigger>
              <SelectContent>
                {FUNDING_STAGES.map((s) => (
                  <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={2} defaultValue={prefill?.description} placeholder="One-liner about the company" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" name="location" defaultValue={prefill?.location} placeholder="City, Country" />
          </div>
        </CardContent>
      </Card>

      {/* 2. Founders */}
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
            <div key={idx} className="border-b pb-3 space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
                <div className="space-y-1">
                  <Label className="text-xs">Name</Label>
                  <Input value={founder.name} onChange={(e) => updateFounder(idx, "name", e.target.value)} placeholder="Name" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Email</Label>
                  <Input value={founder.email} onChange={(e) => updateFounder(idx, "email", e.target.value)} placeholder="Email" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Phone</Label>
                  <Input value={founder.phone} onChange={(e) => updateFounder(idx, "phone", e.target.value)} placeholder="Phone" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Title</Label>
                  <Input value={founder.title} onChange={(e) => updateFounder(idx, "title", e.target.value)} placeholder="CEO" />
                </div>
                <div className="flex gap-1 self-end">
                  <Button type="button" variant="ghost" size="icon" onClick={() => toggleFounderExpand(idx)} title="More details">
                    <ChevronDown className={cn("h-4 w-4 transition-transform", expandedFounders.has(idx) && "rotate-180")} />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeFounder(idx)} disabled={founders.length <= 1}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              {expandedFounders.has(idx) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pl-0 md:pl-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Previous Companies</Label>
                    <Input value={founder.previousCompanies} onChange={(e) => updateFounder(idx, "previousCompanies", e.target.value)} placeholder="ex-Stripe, ex-Razorpay" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Education</Label>
                    <Input value={founder.education} onChange={(e) => updateFounder(idx, "education", e.target.value)} placeholder="IIT-B, Stanford MBA" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Twitter</Label>
                    <Input value={founder.twitter} onChange={(e) => updateFounder(idx, "twitter", e.target.value)} placeholder="@handle" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 3. Deal & Round Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Deal & Round Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="chequeSize">Cheque Size ($)</Label>
            <Input id="chequeSize" name="chequeSize" type="number" defaultValue={prefill?.chequeSize} placeholder="50000" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="totalRoundSize">Total Round Size ($)</Label>
            <Input id="totalRoundSize" name="totalRoundSize" type="number" defaultValue={prefill?.totalRoundSize} placeholder="1000000" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="preMoneyValuation">Pre-Money Valuation ($)</Label>
            <Input id="preMoneyValuation" name="preMoneyValuation" type="number" defaultValue={prefill?.preMoneyValuation} placeholder="5000000" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessModel">Business Model</Label>
            <Select name="businessModel" defaultValue={prefill?.businessModel}>
              <SelectTrigger><SelectValue placeholder="Select model" /></SelectTrigger>
              <SelectContent>
                {BUSINESS_MODELS.map((b) => (
                  <SelectItem key={b.key} value={b.key}>{b.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="source">Source (who referred)</Label>
            <Input id="source" name="source" defaultValue={prefill?.source} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sourceType">Source Type</Label>
            <Select name="sourceType" defaultValue={prefill?.sourceType}>
              <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
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
          <div className="md:col-span-2 space-y-2">
            <Label>Referred by Contact</Label>
            <ContactSearchCombobox value={referredByContactId} onChange={setReferredByContactId} />
          </div>
        </CardContent>
      </Card>

      {/* 4. Traction & Financials (collapsible) */}
      <Collapsible>
        <Card>
          <CardHeader>
            <CollapsibleTrigger asChild>
              <button type="button" className="flex items-center justify-between w-full text-left">
                <CardTitle className="text-base">Traction & Financials</CardTitle>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="revenue">Revenue ($)</Label>
                <Input id="revenue" name="revenue" type="number" defaultValue={prefill?.revenue} placeholder="15000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="revenueType">Revenue Type</Label>
                <Select name="revenueType" defaultValue={prefill?.revenueType}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MRR">MRR</SelectItem>
                    <SelectItem value="ARR">ARR</SelectItem>
                    <SelectItem value="GMV">GMV</SelectItem>
                    <SelectItem value="NONE">None / Pre-Revenue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="burnRate">Burn Rate ($/mo)</Label>
                <Input id="burnRate" name="burnRate" type="number" defaultValue={prefill?.burnRate} placeholder="20000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="runway">Runway (months)</Label>
                <Input id="runway" name="runway" type="number" defaultValue={prefill?.runway} placeholder="12" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="existingInvestors">Existing Investors</Label>
                <Textarea id="existingInvestors" name="existingInvestors" rows={2} defaultValue={prefill?.existingInvestors} placeholder="Angel investors, previous round leads…" />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* 5. Screening Criteria */}
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

      {/* 6. Additional Details (collapsible) */}
      <Collapsible>
        <Card>
          <CardHeader>
            <CollapsibleTrigger asChild>
              <button type="button" className="flex items-center justify-between w-full text-left">
                <CardTitle className="text-base">Additional Details</CardTitle>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="teamSize">Team Size</Label>
                <Input id="teamSize" name="teamSize" type="number" defaultValue={prefill?.teamSize} placeholder="10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="foundedDate">Founded Date</Label>
                <Input id="foundedDate" name="foundedDate" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="legalEntityName">Legal Entity Name</Label>
                <Input id="legalEntityName" name="legalEntityName" placeholder="Acme Pvt Ltd" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="convictionScore">Conviction Score</Label>
                <Select name="convictionScore">
                  <SelectTrigger><SelectValue placeholder="1–5" /></SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <SelectItem key={n} value={String(n)}>{n} — {["Low", "Below Avg", "Average", "Strong", "Very Strong"][n - 1]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Tags</Label>
                <TagInput value={tags} onChange={setTags} />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

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
