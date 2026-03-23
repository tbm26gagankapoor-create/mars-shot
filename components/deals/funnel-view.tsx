"use client";

import { useMemo } from "react";
import { FunnelChart, Funnel, Tooltip, Cell, LabelList } from "recharts";
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { DEAL_STAGES, STAGE_LABEL_MAP } from "@/lib/constants";
import type { DealCardData } from "./deal-card";

type FunnelViewProps = {
  dealsByStage: Record<string, DealCardData[]>;
};

const STAGE_COLORS = [
  "hsl(220, 70%, 55%)",   // Deal Source – blue
  "hsl(200, 65%, 50%)",   // Radar – teal-blue
  "hsl(175, 60%, 45%)",   // Screening – teal
  "hsl(150, 55%, 45%)",   // Intro Call – green-teal
  "hsl(45, 85%, 55%)",    // Partner Gut-Check – amber
  "hsl(30, 80%, 50%)",    // Active DD – orange
  "hsl(15, 75%, 50%)",    // Partner Review – red-orange
  "hsl(340, 65%, 50%)",   // Decision – rose
];

export function FunnelView({ dealsByStage }: FunnelViewProps) {
  const funnelData = useMemo(() => {
    return DEAL_STAGES.map((stage, i) => {
      const deals = dealsByStage[stage.key] || [];
      return {
        name: stage.label,
        value: deals.length,
        fill: STAGE_COLORS[i],
        deals,
      };
    });
  }, [dealsByStage]);

  const chartConfig = useMemo(() => {
    const cfg: ChartConfig = {};
    DEAL_STAGES.forEach((stage, i) => {
      cfg[stage.key] = {
        label: stage.label,
        color: STAGE_COLORS[i],
      };
    });
    return cfg;
  }, []);

  const totalDeals = funnelData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard
          label="Total Active Deals"
          value={totalDeals}
        />
        <SummaryCard
          label="Top of Funnel"
          value={funnelData[0]?.value ?? 0}
          sub={DEAL_STAGES[0].label}
        />
        <SummaryCard
          label="In Due Diligence"
          value={funnelData[5]?.value ?? 0}
          sub={DEAL_STAGES[5].label}
        />
        <SummaryCard
          label="At Decision"
          value={funnelData[7]?.value ?? 0}
          sub={DEAL_STAGES[7].label}
        />
      </div>

      {/* Funnel chart */}
      <div className="rounded-xl border bg-card p-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">
          Pipeline Funnel
        </h3>
        <ChartContainer config={chartConfig} className="aspect-[2/1] w-full">
          <FunnelChart>
            <Tooltip
              content={<CustomTooltip />}
            />
            <Funnel
              dataKey="value"
              data={funnelData}
              isAnimationActive
              animationDuration={800}
            >
              {funnelData.map((entry, index) => (
                <Cell key={entry.name} fill={STAGE_COLORS[index]} />
              ))}
              <LabelList
                dataKey="name"
                position="center"
                className="fill-white font-medium text-xs"
              />
            </Funnel>
          </FunnelChart>
        </ChartContainer>
      </div>

      {/* Stage breakdown */}
      <div className="rounded-xl border bg-card p-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">
          Stage Breakdown
        </h3>
        <div className="space-y-3">
          {funnelData.map((stage, i) => {
            const maxVal = Math.max(...funnelData.map((d) => d.value), 1);
            const pct = totalDeals > 0 ? ((stage.value / totalDeals) * 100).toFixed(0) : "0";
            const conversionFromPrev =
              i > 0 && funnelData[i - 1].value > 0
                ? ((stage.value / funnelData[i - 1].value) * 100).toFixed(0)
                : null;

            return (
              <div key={stage.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-sm shrink-0"
                      style={{ backgroundColor: stage.fill }}
                    />
                    <span className="font-medium">{stage.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    {conversionFromPrev && (
                      <span className="text-xs">
                        {conversionFromPrev}% from prev
                      </span>
                    )}
                    <span className="tabular-nums font-medium text-foreground">
                      {stage.value} deal{stage.value !== 1 ? "s" : ""}
                    </span>
                    <span className="text-xs w-10 text-right tabular-nums">
                      {pct}%
                    </span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(stage.value / maxVal) * 100}%`,
                      backgroundColor: stage.fill,
                      minWidth: stage.value > 0 ? "4px" : "0px",
                    }}
                  />
                </div>
                {/* Deal names in this stage */}
                {stage.deals.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pl-5">
                    {stage.deals.map((deal) => (
                      <span
                        key={deal.id}
                        className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                      >
                        {deal.companyName}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: number;
  sub?: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold tabular-nums mt-1">{value}</p>
      {sub && (
        <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
      )}
    </div>
  );
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { name: string; value: number; fill: string; deals: DealCardData[] } }> }) {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;
  return (
    <div className="rounded-lg border bg-background px-3 py-2 text-sm shadow-xl">
      <div className="flex items-center gap-2 font-medium">
        <div
          className="h-2.5 w-2.5 rounded-sm"
          style={{ backgroundColor: data.fill }}
        />
        {data.name}
      </div>
      <div className="mt-1 text-muted-foreground">
        {data.value} deal{data.value !== 1 ? "s" : ""}
      </div>
      {data.deals.length > 0 && data.deals.length <= 5 && (
        <div className="mt-1.5 border-t pt-1.5 space-y-0.5">
          {data.deals.map((d) => (
            <div key={d.id} className="text-xs text-muted-foreground">
              {d.companyName}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
