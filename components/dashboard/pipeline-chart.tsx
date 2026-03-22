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
import { DEAL_STAGES } from "@/lib/constants";

type PipelineChartProps = {
  data: { stage: string; count: number }[];
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

const BAR_COLORS = [
  "hsl(210, 80%, 55%)",
  "hsl(210, 75%, 60%)",
  "hsl(210, 70%, 65%)",
  "hsl(200, 65%, 60%)",
  "hsl(190, 60%, 55%)",
  "hsl(170, 55%, 50%)",
  "hsl(150, 60%, 45%)",
  "hsl(130, 65%, 40%)",
];

export function PipelineChart({ data }: PipelineChartProps) {
  const chartData = data
    .sort((a, b) => {
      const oa = DEAL_STAGES.find((s) => s.key === a.stage)?.order ?? 99;
      const ob = DEAL_STAGES.find((s) => s.key === b.stage)?.order ?? 99;
      return oa - ob;
    })
    .map((d) => ({
      ...d,
      name: STAGE_LABELS[d.stage] || d.stage.replace(/_/g, " "),
    }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} layout="vertical">
        <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 12 }}
          width={100}
        />
        <Tooltip
          formatter={(value: unknown) => [`${value} deals`, "Count"]}
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
              fill={BAR_COLORS[index % BAR_COLORS.length]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
