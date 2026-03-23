"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { upsertKpiSnapshot } from "@/actions/portfolio";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface KpiFormProps {
  portfolioCompanyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KpiForm({ portfolioCompanyId, open, onOpenChange }: KpiFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // Default to first of current month
  const defaultMonth = new Date();
  defaultMonth.setDate(1);
  const defaultMonthStr = defaultMonth.toISOString().slice(0, 7); // YYYY-MM

  const [fields, setFields] = useState({
    periodMonth: defaultMonthStr,
    mrr: "",
    arr: "",
    burnRate: "",
    runway: "",
    headcount: "",
    customers: "",
    notes: "",
  });

  const set = <K extends keyof typeof fields>(key: K, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  async function handleSave() {
    if (!fields.periodMonth) {
      toast.error("Month is required");
      return;
    }

    setSaving(true);
    try {
      const periodDate = new Date(fields.periodMonth + "-01T00:00:00Z");

      await upsertKpiSnapshot(portfolioCompanyId, {
        periodDate,
        mrr: fields.mrr ? Number(fields.mrr) : undefined,
        arr: fields.arr ? Number(fields.arr) : undefined,
        burnRate: fields.burnRate ? Number(fields.burnRate) : undefined,
        runway: fields.runway ? Number(fields.runway) : undefined,
        headcount: fields.headcount ? Number(fields.headcount) : undefined,
        customers: fields.customers ? Number(fields.customers) : undefined,
        notes: fields.notes || undefined,
      });

      toast.success("KPI snapshot saved");
      onOpenChange(false);
      router.refresh();
    } catch {
      toast.error("Failed to save KPI snapshot");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add KPI Snapshot</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Month *</Label>
            <Input
              type="month"
              value={fields.periodMonth}
              onChange={(e) => set("periodMonth", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>MRR ($)</Label>
              <Input type="number" value={fields.mrr} onChange={(e) => set("mrr", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>ARR ($)</Label>
              <Input type="number" value={fields.arr} onChange={(e) => set("arr", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Burn Rate ($/mo)</Label>
              <Input type="number" value={fields.burnRate} onChange={(e) => set("burnRate", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Runway (months)</Label>
              <Input type="number" value={fields.runway} onChange={(e) => set("runway", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Headcount</Label>
              <Input type="number" value={fields.headcount} onChange={(e) => set("headcount", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Customers</Label>
              <Input type="number" value={fields.customers} onChange={(e) => set("customers", e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={fields.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={2}
              placeholder="Context from founder update..."
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
              "Save Snapshot"
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
