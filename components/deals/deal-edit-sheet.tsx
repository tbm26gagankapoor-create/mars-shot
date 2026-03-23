"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { SECTORS, FUNDING_STAGES, BUSINESS_MODELS, REVENUE_TYPES } from "@/lib/constants";
import { updateDeal } from "@/actions/deals";
import { TagInput } from "./tag-input";
import { ContactSearchCombobox } from "./contact-search-combobox";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { getDealById } from "@/actions/deals";

type Deal = NonNullable<Awaited<ReturnType<typeof getDealById>>>;

interface DealEditSheetProps {
  deal: Deal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DealEditSheet({ deal, open, onOpenChange }: DealEditSheetProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // Local state for all editable fields
  const [fields, setFields] = useState(() => ({
    companyName: deal.companyName,
    description: deal.description || "",
    website: deal.website || "",
    location: deal.location || "",
    sector: deal.sector || "",
    fundingStage: deal.fundingStage || "",
    businessModel: deal.businessModel || "",
    teamSize: deal.teamSize ?? "",
    foundedDate: deal.foundedDate ? new Date(deal.foundedDate).toISOString().split("T")[0] : "",
    legalEntityName: deal.legalEntityName || "",
    chequeSize: deal.chequeSize ?? "",
    totalRoundSize: deal.totalRoundSize ?? "",
    preMoneyValuation: deal.preMoneyValuation ?? "",
    source: deal.source || "",
    sourceType: deal.sourceType || "",
    referredByContactId: deal.referredByContactId || "",
    revenue: deal.revenue ?? "",
    revenueType: deal.revenueType || "",
    burnRate: deal.burnRate ?? "",
    runway: deal.runway ?? "",
    existingInvestors: deal.existingInvestors || "",
    sectorFit: deal.sectorFit ?? false,
    stageFit: deal.stageFit ?? false,
    chequeFit: deal.chequeFit ?? false,
    razorpayRelevance: deal.razorpayRelevance ?? false,
    founderBackground: deal.founderBackground || "",
    tags: deal.tags || [],
    convictionScore: deal.convictionScore ?? "",
    nextAction: deal.nextAction || "",
    nextActionDueAt: deal.nextActionDueAt ? new Date(deal.nextActionDueAt).toISOString().split("T")[0] : "",
  }));

  const set = <K extends keyof typeof fields>(key: K, value: (typeof fields)[K]) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  async function handleSave() {
    setSaving(true);
    try {
      const changes: Record<string, unknown> = {};

      // Compare and collect changed fields
      if (fields.companyName !== deal.companyName) changes.companyName = fields.companyName;
      if (fields.description !== (deal.description || "")) changes.description = fields.description || null;
      if (fields.website !== (deal.website || "")) changes.website = fields.website || null;
      if (fields.location !== (deal.location || "")) changes.location = fields.location || null;
      if (fields.sector !== (deal.sector || "")) changes.sector = fields.sector || null;
      if (fields.fundingStage !== (deal.fundingStage || "")) changes.fundingStage = fields.fundingStage || null;
      if (fields.businessModel !== (deal.businessModel || "")) changes.businessModel = fields.businessModel || null;
      if (String(fields.teamSize) !== String(deal.teamSize ?? "")) changes.teamSize = fields.teamSize ? Number(fields.teamSize) : null;
      if (fields.legalEntityName !== (deal.legalEntityName || "")) changes.legalEntityName = fields.legalEntityName || null;

      if (String(fields.chequeSize) !== String(deal.chequeSize ?? "")) changes.chequeSize = fields.chequeSize ? Number(fields.chequeSize) : null;
      if (String(fields.totalRoundSize) !== String(deal.totalRoundSize ?? "")) changes.totalRoundSize = fields.totalRoundSize ? Number(fields.totalRoundSize) : null;
      if (String(fields.preMoneyValuation) !== String(deal.preMoneyValuation ?? "")) changes.preMoneyValuation = fields.preMoneyValuation ? Number(fields.preMoneyValuation) : null;
      if (fields.source !== (deal.source || "")) changes.source = fields.source || null;
      if (fields.sourceType !== (deal.sourceType || "")) changes.sourceType = fields.sourceType || null;
      if (fields.referredByContactId !== (deal.referredByContactId || "")) changes.referredByContactId = fields.referredByContactId || null;

      if (String(fields.revenue) !== String(deal.revenue ?? "")) changes.revenue = fields.revenue ? Number(fields.revenue) : null;
      if (fields.revenueType !== (deal.revenueType || "")) changes.revenueType = fields.revenueType || null;
      if (String(fields.burnRate) !== String(deal.burnRate ?? "")) changes.burnRate = fields.burnRate ? Number(fields.burnRate) : null;
      if (String(fields.runway) !== String(deal.runway ?? "")) changes.runway = fields.runway ? Number(fields.runway) : null;
      if (fields.existingInvestors !== (deal.existingInvestors || "")) changes.existingInvestors = fields.existingInvestors || null;

      if (fields.sectorFit !== (deal.sectorFit ?? false)) changes.sectorFit = fields.sectorFit;
      if (fields.stageFit !== (deal.stageFit ?? false)) changes.stageFit = fields.stageFit;
      if (fields.chequeFit !== (deal.chequeFit ?? false)) changes.chequeFit = fields.chequeFit;
      if (fields.razorpayRelevance !== (deal.razorpayRelevance ?? false)) changes.razorpayRelevance = fields.razorpayRelevance;
      if (fields.founderBackground !== (deal.founderBackground || "")) changes.founderBackground = fields.founderBackground || null;

      if (JSON.stringify(fields.tags) !== JSON.stringify(deal.tags || [])) changes.tags = fields.tags;
      if (String(fields.convictionScore) !== String(deal.convictionScore ?? "")) changes.convictionScore = fields.convictionScore ? Number(fields.convictionScore) : null;
      if (fields.nextAction !== (deal.nextAction || "")) changes.nextAction = fields.nextAction || null;
      if (fields.nextActionDueAt !== (deal.nextActionDueAt ? new Date(deal.nextActionDueAt).toISOString().split("T")[0] : "")) {
        changes.nextActionDueAt = fields.nextActionDueAt || null;
      }
      if (fields.foundedDate !== (deal.foundedDate ? new Date(deal.foundedDate).toISOString().split("T")[0] : "")) {
        changes.foundedDate = fields.foundedDate || null;
      }

      if (Object.keys(changes).length === 0) {
        toast.info("No changes to save");
        onOpenChange(false);
        return;
      }

      await updateDeal(deal.id, changes as never);
      toast.success("Deal updated");
      onOpenChange(false);
      router.refresh();
    } catch {
      toast.error("Failed to update deal");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit {deal.companyName}</SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="company" className="mt-4">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="company">Company</TabsTrigger>
            <TabsTrigger value="deal">Deal</TabsTrigger>
            <TabsTrigger value="traction">Traction</TabsTrigger>
            <TabsTrigger value="screening">Screen</TabsTrigger>
            <TabsTrigger value="more">More</TabsTrigger>
          </TabsList>

          <TabsContent value="company" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Company Name *</Label>
              <Input value={fields.companyName} onChange={(e) => set("companyName", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={fields.description} onChange={(e) => set("description", e.target.value)} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input value={fields.website} onChange={(e) => set("website", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Location</Label>
                <Input value={fields.location} onChange={(e) => set("location", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Sector</Label>
                <Select value={fields.sector} onValueChange={(v) => set("sector", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {SECTORS.map((s) => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Funding Stage</Label>
                <Select value={fields.fundingStage} onValueChange={(v) => set("fundingStage", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {FUNDING_STAGES.map((s) => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Business Model</Label>
                <Select value={fields.businessModel} onValueChange={(v) => set("businessModel", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {BUSINESS_MODELS.map((b) => <SelectItem key={b.key} value={b.key}>{b.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Team Size</Label>
                <Input type="number" value={fields.teamSize} onChange={(e) => set("teamSize", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Founded</Label>
                <Input type="date" value={fields.foundedDate} onChange={(e) => set("foundedDate", e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Legal Entity Name</Label>
              <Input value={fields.legalEntityName} onChange={(e) => set("legalEntityName", e.target.value)} />
            </div>
          </TabsContent>

          <TabsContent value="deal" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Cheque Size ($)</Label>
                <Input type="number" value={fields.chequeSize} onChange={(e) => set("chequeSize", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Round Size ($)</Label>
                <Input type="number" value={fields.totalRoundSize} onChange={(e) => set("totalRoundSize", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Pre-Money ($)</Label>
                <Input type="number" value={fields.preMoneyValuation} onChange={(e) => set("preMoneyValuation", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Source Type</Label>
                <Select value={fields.sourceType} onValueChange={(v) => set("sourceType", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
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
            </div>
            <div className="space-y-2">
              <Label>Source</Label>
              <Input value={fields.source} onChange={(e) => set("source", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Referred by Contact</Label>
              <ContactSearchCombobox value={fields.referredByContactId} onChange={(v) => set("referredByContactId", v)} />
            </div>
          </TabsContent>

          <TabsContent value="traction" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Revenue ($)</Label>
                <Input type="number" value={fields.revenue} onChange={(e) => set("revenue", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Revenue Type</Label>
                <Select value={fields.revenueType} onValueChange={(v) => set("revenueType", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {REVENUE_TYPES.map((r) => <SelectItem key={r.key} value={r.key}>{r.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Burn Rate ($/mo)</Label>
                <Input type="number" value={fields.burnRate} onChange={(e) => set("burnRate", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Runway (months)</Label>
                <Input type="number" value={fields.runway} onChange={(e) => set("runway", e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Existing Investors</Label>
              <Textarea value={fields.existingInvestors} onChange={(e) => set("existingInvestors", e.target.value)} rows={3} />
            </div>
          </TabsContent>

          <TabsContent value="screening" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={fields.sectorFit} onCheckedChange={(v) => set("sectorFit", v)} />
                <Label>Sector Fit</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={fields.stageFit} onCheckedChange={(v) => set("stageFit", v)} />
                <Label>Stage Fit</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={fields.chequeFit} onCheckedChange={(v) => set("chequeFit", v)} />
                <Label>Cheque Fit</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={fields.razorpayRelevance} onCheckedChange={(v) => set("razorpayRelevance", v)} />
                <Label>Razorpay Relevance</Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Founder Background</Label>
              <Textarea value={fields.founderBackground} onChange={(e) => set("founderBackground", e.target.value)} rows={3} />
            </div>
          </TabsContent>

          <TabsContent value="more" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Tags</Label>
              <TagInput value={fields.tags} onChange={(v) => set("tags", v)} />
            </div>
            <div className="space-y-2">
              <Label>Conviction Score</Label>
              <Select value={String(fields.convictionScore)} onValueChange={(v) => set("convictionScore", v)}>
                <SelectTrigger><SelectValue placeholder="1–5" /></SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <SelectItem key={n} value={String(n)}>{n} — {["Low", "Below Avg", "Average", "Strong", "Very Strong"][n - 1]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Next Action</Label>
              <Input value={fields.nextAction} onChange={(e) => set("nextAction", e.target.value)} placeholder="Schedule intro call" />
            </div>
            <div className="space-y-2">
              <Label>Next Action Due</Label>
              <Input type="date" value={fields.nextActionDueAt} onChange={(e) => set("nextActionDueAt", e.target.value)} />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 mt-6 pt-4 border-t">
          <Button onClick={handleSave} disabled={saving} className="flex-1">
            {saving ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Saving…</> : "Save Changes"}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
