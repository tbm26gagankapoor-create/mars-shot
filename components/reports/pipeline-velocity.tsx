"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
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

type PipelineVelocityProps = {
  data: { stage: string; avgDays: number; dealCount: number }[];
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

export function PipelineVelocity({ data }: PipelineVelocityProps) {
  const chartData = data.map((d) => ({
    ...d,
    name: formatStage(d.stage),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pipeline Velocity</CardTitle>
        <CardDescription>
          Average days deals spend in each stage
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No pipeline data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                angle={-20}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                label={{
                  value: "Avg Days",
                  angle: -90,
                  position: "insideLeft",
                  style: { fontSize: 12 },
                }}
              />
              <Tooltip
                formatter={(value: unknown, _name: unknown, props: unknown) => {
                  const p = props as { payload?: { dealCount?: number } };
                  return [
                    `${value} days (${p.payload?.dealCount ?? 0} deals)`,
                    "Avg Time",
                  ];
                }}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="avgDays" radius={[4, 4, 0, 0]}>
                {chartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`hsl(var(--primary) / ${0.5 + (index / chartData.length) * 0.5})`}
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
