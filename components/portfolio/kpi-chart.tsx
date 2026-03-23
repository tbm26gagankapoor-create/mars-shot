"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const chartConfig = {
  mrr: { label: "MRR", color: "hsl(var(--chart-1))" },
  burnRate: { label: "Burn Rate", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

interface KpiSnapshot {
  periodDate: Date | string;
  mrr: number | null;
  burnRate: number | null;
  arr: number | null;
}

interface KpiChartProps {
  snapshots: KpiSnapshot[];
}

export function KpiChart({ snapshots }: KpiChartProps) {
  // Reverse so oldest is first (chart reads left-to-right)
  const data = [...snapshots].reverse().map((s) => ({
    month: new Date(s.periodDate).toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    }),
    mrr: s.mrr ?? 0,
    burnRate: s.burnRate ?? 0,
  }));

  if (data.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">MRR & Burn Rate Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[220px] w-full">
          <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) =>
                v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${(v / 1_000).toFixed(0)}K`
              }
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="mrr"
              stroke="var(--color-mrr)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="burnRate"
              stroke="var(--color-burnRate)"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
