"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { BarChart3 } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

type VelocityData = {
  stage: string;
  stageLabel: string;
  avgDays: number;
  slaLimitDays: number | null;
  dealCount: number;
};

const COMPACT_LABELS: Record<string, string> = {
  RADAR: "Radar",
  SCREENING: "Screen",
  INTRO_CALL: "Intro",
  PARTNER_GUT_CHECK: "Gut Chk",
  ACTIVE_DD: "DD",
  PARTNER_REVIEW: "Review",
  DECISION: "Decision",
};

const chartConfig = {
  avgDays: {
    label: "Avg Days",
    color: "hsl(var(--chart-1))",
  },
  breached: {
    label: "Exceeds SLA",
    color: "hsl(var(--destructive))",
  },
} satisfies ChartConfig;

export function VelocityCompact({ data }: { data: VelocityData[] }) {
  const chartData = data.map((d) => ({
    ...d,
    name: COMPACT_LABELS[d.stage] || d.stageLabel,
    exceeds: d.slaLimitDays !== null && d.avgDays > d.slaLimitDays,
  }));

  const bottleneck = chartData
    .filter((d) => d.slaLimitDays !== null && d.dealCount > 0)
    .sort((a, b) => {
      const aRatio = a.slaLimitDays ? a.avgDays / a.slaLimitDays : 0;
      const bRatio = b.slaLimitDays ? b.avgDays / b.slaLimitDays : 0;
      return bRatio - aRatio;
    })[0];

  if (chartData.every((d) => d.dealCount === 0)) {
    return (
      <div className="flex flex-col items-center justify-center h-[220px] text-sm text-muted-foreground">
        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3 animate-scale-in">
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="font-medium">No velocity data</p>
        <p className="text-xs">Active deals will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-muted/30 p-4">
        <ChartContainer config={chartConfig} className="aspect-auto h-[200px] w-full">
          <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 16 }}>
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11 }}
              width={60}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, _name, item) => {
                    const payload = (item as unknown as Record<string, unknown>)?.payload as (VelocityData & { name: string }) | undefined;
                    const sla = payload?.slaLimitDays;
                    return (
                      <span>
                        {String(value)}d avg{sla ? ` (SLA: ${sla}d)` : ""} — {payload?.dealCount ?? 0} deals
                      </span>
                    );
                  }}
                />
              }
            />
            <Bar dataKey="avgDays" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.exceeds
                      ? "hsl(var(--destructive))"
                      : "hsl(var(--chart-1))"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>
      {bottleneck && bottleneck.exceeds && (
        <div className="flex items-start gap-2 rounded-lg bg-destructive/5 border border-destructive/10 px-3 py-2">
          <div className="h-1.5 w-1.5 rounded-full bg-destructive mt-1.5 shrink-0" />
          <p className="text-xs text-destructive">
            Bottleneck: {bottleneck.stageLabel} averages {bottleneck.avgDays}d
            (SLA: {bottleneck.slaLimitDays}d)
          </p>
        </div>
      )}
    </div>
  );
}
