import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RUNWAY_THRESHOLDS } from "@/lib/constants";
import { ArrowUp, ArrowDown, Minus, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { HealthStatusBadge } from "./health-status-badge";

interface KpiSnapshot {
  periodDate: Date;
  arr: number | null;
  mrr: number | null;
  burnRate: number | null;
  runway: number | null;
  headcount: number | null;
  customers: number | null;
}

interface KpiLatestCardProps {
  healthStatus: string;
  nextMilestone: string | null;
  snapshots: KpiSnapshot[]; // ordered by periodDate desc, max 2 needed
}

export function KpiLatestCard({ healthStatus, nextMilestone, snapshots }: KpiLatestCardProps) {
  const latest = snapshots[0] ?? null;
  const prior = snapshots[1] ?? null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Health & KPIs</CardTitle>
          <HealthStatusBadge status={healthStatus} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {nextMilestone && (
          <div className="flex items-start gap-2 text-xs">
            <Target className="h-3.5 w-3.5 mt-0.5 text-muted-foreground" />
            <span className="text-muted-foreground">
              <span className="font-medium text-foreground">Next milestone:</span> {nextMilestone}
            </span>
          </div>
        )}

        {!latest ? (
          <p className="text-xs text-muted-foreground">No KPI snapshots recorded yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <KpiValue
              label="MRR"
              value={latest.mrr}
              prior={prior?.mrr}
              format={formatCurrency}
            />
            <KpiValue
              label="ARR"
              value={latest.arr}
              prior={prior?.arr}
              format={formatCurrency}
            />
            <KpiValue
              label="Burn Rate"
              value={latest.burnRate}
              prior={prior?.burnRate}
              format={formatCurrency}
              invertDelta
            />
            <KpiValue
              label="Runway"
              value={latest.runway}
              prior={prior?.runway}
              format={(v) => `${v.toFixed(0)}mo`}
              runwayColor
            />
            <KpiValue
              label="Headcount"
              value={latest.headcount}
              prior={prior?.headcount}
              format={(v) => String(v)}
            />
            <KpiValue
              label="Customers"
              value={latest.customers}
              prior={prior?.customers}
              format={(v) => String(v)}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatCurrency(val: number): string {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val.toFixed(0)}`;
}

function KpiValue({
  label,
  value,
  prior,
  format,
  invertDelta,
  runwayColor,
}: {
  label: string;
  value: number | null;
  prior: number | null | undefined;
  format: (v: number) => string;
  invertDelta?: boolean;
  runwayColor?: boolean;
}) {
  if (value == null) return null;

  let delta: number | null = null;
  if (prior != null && prior !== 0) {
    delta = ((value - prior) / Math.abs(prior)) * 100;
  }

  const runwayClass = runwayColor
    ? value < RUNWAY_THRESHOLDS.critical
      ? "text-red-600"
      : value < RUNWAY_THRESHOLDS.warning
        ? "text-yellow-600"
        : "text-green-600"
    : "";

  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("text-sm font-semibold mt-0.5", runwayClass)}>
        {format(value)}
      </p>
      {delta != null && (
        <DeltaIndicator delta={delta} invert={invertDelta} />
      )}
    </div>
  );
}

function DeltaIndicator({ delta, invert }: { delta: number; invert?: boolean }) {
  const isPositive = invert ? delta < 0 : delta > 0;
  const isNeutral = Math.abs(delta) < 0.5;

  if (isNeutral) {
    return (
      <span className="inline-flex items-center text-[11px] text-muted-foreground">
        <Minus className="h-3 w-3 mr-0.5" /> 0%
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center text-[11px]",
        isPositive ? "text-green-600" : "text-red-600"
      )}
    >
      {delta > 0 ? (
        <ArrowUp className="h-3 w-3 mr-0.5" />
      ) : (
        <ArrowDown className="h-3 w-3 mr-0.5" />
      )}
      {Math.abs(delta).toFixed(0)}%
    </span>
  );
}
