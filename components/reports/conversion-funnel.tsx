"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ConversionFunnelProps = {
  data: { stage: string; count: number; conversionRate: number }[];
};

const STAGE_LABELS: Record<string, string> = {
  DEAL_SOURCE: "Source",
  RADAR: "Radar",
  SCREENING: "Screening",
  INTRO_CALL: "Intro Call",
  PARTNER_GUT_CHECK: "Gut Check",
  ACTIVE_DD: "Active DD",
  PARTNER_REVIEW: "Partner Review",
  DECISION: "Decision",
};

function formatStage(stage: string) {
  return STAGE_LABELS[stage] || stage.replace(/_/g, " ");
}

const FUNNEL_COLORS = [
  "hsl(210, 80%, 55%)",
  "hsl(210, 75%, 60%)",
  "hsl(210, 70%, 65%)",
  "hsl(200, 65%, 60%)",
  "hsl(190, 60%, 55%)",
  "hsl(170, 55%, 50%)",
  "hsl(150, 60%, 45%)",
  "hsl(130, 65%, 40%)",
];

export function ConversionFunnel({ data }: ConversionFunnelProps) {
  const chartData = data.map((d) => ({
    ...d,
    name: formatStage(d.stage),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deal Funnel</CardTitle>
        <CardDescription>
          Deals at each stage with conversion rate from top-of-funnel
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No funnel data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 12 }}
                width={100}
              />
              <Tooltip
                formatter={(value: unknown, _name: unknown, props: unknown) => {
                  const p = props as { payload?: { conversionRate?: number } };
                  return [
                    `${value} deals (${p.payload?.conversionRate ?? 0}% conversion)`,
                    "Count",
                  ];
                }}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {chartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={FUNNEL_COLORS[index % FUNNEL_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
