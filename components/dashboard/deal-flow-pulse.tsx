import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type FlowData = {
  thisMonth: { inflow: number; outflow: number; net: number };
  lastMonth: { inflow: number; outflow: number; net: number };
};

export function DealFlowPulse({ data }: { data: FlowData }) {
  const { thisMonth, lastMonth } = data;
  const inflowDelta = thisMonth.inflow - lastMonth.inflow;
  const outflowDelta = thisMonth.outflow - lastMonth.outflow;
  const netDelta = thisMonth.net - lastMonth.net;

  return (
    <div className="grid grid-cols-3 gap-3">
      <FlowCard
        label="Inflow"
        value={thisMonth.inflow}
        delta={inflowDelta}
        description="new deals"
      />
      <FlowCard
        label="Outflow"
        value={thisMonth.outflow}
        delta={outflowDelta}
        description="resolved"
        invertColor
      />
      <FlowCard
        label="Net"
        value={thisMonth.net}
        delta={netDelta}
        description="pipeline growth"
      />
    </div>
  );
}

function FlowCard({
  label,
  value,
  delta,
  description,
  invertColor,
}: {
  label: string;
  value: number;
  delta: number;
  description: string;
  invertColor?: boolean;
}) {
  const isPositive = invertColor ? delta < 0 : delta > 0;
  const isNegative = invertColor ? delta > 0 : delta < 0;

  return (
    <div className="rounded-xl bg-muted/40 p-4 space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="text-3xl font-semibold tabular-nums tracking-tight">
        {value >= 0 ? `+${value}` : value}
      </p>
      <div className="flex items-center gap-1.5">
        {delta !== 0 ? (
          <Badge
            variant="outline"
            className={`gap-1 text-[11px] font-medium ${
              isPositive
                ? "text-emerald-700 border-emerald-200 bg-emerald-50 dark:text-emerald-300 dark:border-emerald-800 dark:bg-emerald-900/20"
                : isNegative
                  ? "text-red-700 border-red-200 bg-red-50 dark:text-red-300 dark:border-red-800 dark:bg-red-900/20"
                  : ""
            }`}
          >
            {delta > 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {delta > 0 ? "+" : ""}{delta} vs last mo
          </Badge>
        ) : (
          <Badge variant="outline" className="gap-1 text-[11px] font-medium">
            <Minus className="h-3 w-3" />
            same
          </Badge>
        )}
      </div>
      <p className="text-[11px] text-muted-foreground">{description}</p>
    </div>
  );
}
