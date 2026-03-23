"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { COMPANY_HEALTH_STATUSES } from "@/lib/constants";
import { updatePortfolioInvestment } from "@/actions/portfolio";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { CompanyHealthStatus } from "@prisma/client";

interface Company {
  id: string;
  entryValuation: number | null;
  ownershipPct: number | null;
  currentValuation: number | null;
  proRataRights: boolean;
  boardSeat: boolean;
  healthStatus: string;
  nextMilestone: string | null;
  coInvestors: string[];
}

interface InvestmentEditSheetProps {
  company: Company;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InvestmentEditSheet({ company, open, onOpenChange }: InvestmentEditSheetProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [fields, setFields] = useState(() => ({
    entryValuation: company.entryValuation ?? "",
    ownershipPct: company.ownershipPct ?? "",
    currentValuation: company.currentValuation ?? "",
    proRataRights: company.proRataRights,
    boardSeat: company.boardSeat,
    healthStatus: company.healthStatus,
    nextMilestone: company.nextMilestone ?? "",
    coInvestors: company.coInvestors.join(", "),
  }));

  const set = <K extends keyof typeof fields>(key: K, value: (typeof fields)[K]) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  async function handleSave() {
    setSaving(true);
    try {
      await updatePortfolioInvestment(company.id, {
        entryValuation: fields.entryValuation ? Number(fields.entryValuation) : undefined,
        ownershipPct: fields.ownershipPct ? Number(fields.ownershipPct) : undefined,
        currentValuation: fields.currentValuation ? Number(fields.currentValuation) : undefined,
        proRataRights: fields.proRataRights,
        boardSeat: fields.boardSeat,
        healthStatus: fields.healthStatus as CompanyHealthStatus,
        nextMilestone: fields.nextMilestone || undefined,
        coInvestors: fields.coInvestors
          ? fields.coInvestors.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
      });
      toast.success("Investment details updated");
      onOpenChange(false);
      router.refresh();
    } catch {
      toast.error("Failed to update");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Investment Details</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Entry Valuation ($)</Label>
              <Input
                type="number"
                value={fields.entryValuation}
                onChange={(e) => set("entryValuation", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Current Valuation ($)</Label>
              <Input
                type="number"
                value={fields.currentValuation}
                onChange={(e) => set("currentValuation", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Ownership %</Label>
              <Input
                type="number"
                step="0.1"
                value={fields.ownershipPct}
                onChange={(e) => set("ownershipPct", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Health Status</Label>
              <Select value={fields.healthStatus} onValueChange={(v) => set("healthStatus", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMPANY_HEALTH_STATUSES.map((s) => (
                    <SelectItem key={s.key} value={s.key}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch checked={fields.proRataRights} onCheckedChange={(v) => set("proRataRights", v)} />
              <Label>Pro-rata Rights</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={fields.boardSeat} onCheckedChange={(v) => set("boardSeat", v)} />
              <Label>Board Seat</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Next Milestone</Label>
            <Input
              value={fields.nextMilestone}
              onChange={(e) => set("nextMilestone", e.target.value)}
              placeholder="e.g. Close Series A by Q2"
            />
          </div>

          <div className="space-y-2">
            <Label>Co-investors (comma-separated)</Label>
            <Input
              value={fields.coInvestors}
              onChange={(e) => set("coInvestors", e.target.value)}
              placeholder="Sequoia, Y Combinator"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-6 pt-4 border-t">
          <Button onClick={handleSave} disabled={saving} className="flex-1">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Saving…
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
