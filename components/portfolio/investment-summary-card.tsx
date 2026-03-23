import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

function formatValuation(val: number | null | undefined): string {
  if (val == null) return "---";
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val.toFixed(0)}`;
}

interface InvestmentSummaryCardProps {
  entryValuation: number | null;
  currentValuation: number | null;
  ownershipPct: number | null;
  chequeAmount: number | null;
  proRataRights: boolean;
  boardSeat: boolean;
}

export function InvestmentSummaryCard({
  entryValuation,
  currentValuation,
  ownershipPct,
  chequeAmount,
  proRataRights,
  boardSeat,
}: InvestmentSummaryCardProps) {
  // Compute MOIC: currentValuation * (ownershipPct / 100) / chequeAmount
  let moic: number | null = null;
  if (currentValuation && ownershipPct && chequeAmount) {
    moic = (currentValuation * (ownershipPct / 100)) / chequeAmount;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Investment Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <Stat label="Entry Valuation" value={formatValuation(entryValuation)} />
          <Stat label="Current Valuation" value={formatValuation(currentValuation)} />
          <Stat
            label="MOIC"
            value={moic != null ? `${moic.toFixed(1)}x` : "---"}
            className={moic != null ? (moic >= 1 ? "text-green-600" : "text-red-600") : ""}
          />
          <Stat
            label="Ownership"
            value={ownershipPct != null ? `${ownershipPct}%` : "---"}
          />
          <BoolStat label="Pro-rata Rights" value={proRataRights} />
          <BoolStat label="Board Seat" value={boardSeat} />
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("text-sm font-semibold mt-0.5", className)}>{value}</p>
    </div>
  );
}

function BoolStat({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      {value ? (
        <Check className="h-3.5 w-3.5 text-green-600" />
      ) : (
        <X className="h-3.5 w-3.5 text-muted-foreground/40" />
      )}
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
