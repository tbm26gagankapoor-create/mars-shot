"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { SECTOR_LABELS } from "@/lib/constants";

type SectorDonutProps = {
  data: { sector: string; count: number }[];
};

const SECTOR_COLORS = [
  "hsl(210, 80%, 55%)",
  "hsl(150, 60%, 45%)",
  "hsl(35, 90%, 55%)",
  "hsl(280, 60%, 55%)",
  "hsl(0, 70%, 55%)",
  "hsl(170, 55%, 50%)",
  "hsl(45, 80%, 50%)",
];

export function SectorDonut({ data }: SectorDonutProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  const chartData = data
    .sort((a, b) => b.count - a.count)
    .map((d) => ({
      ...d,
      label: SECTOR_LABELS[d.sector] || d.sector,
    }));

  return (
    <div>
      <div className="relative">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              strokeWidth={2}
              stroke="hsl(var(--card))"
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`sector-${index}`}
                  fill={SECTOR_COLORS[index % SECTOR_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={((value: number, name: string) => [
                `${value} companies`,
                name,
              ]) as any}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-2xl font-semibold tabular-nums">{total}</div>
            <div className="text-[10px] text-muted-foreground">total</div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2 justify-center">
        {chartData.map((d, i) => (
          <div key={d.sector} className="flex items-center gap-1.5 text-xs">
            <div
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{
                backgroundColor:
                  SECTOR_COLORS[i % SECTOR_COLORS.length],
              }}
            />
            <span className="text-muted-foreground">
              {d.label}{" "}
              <span className="font-medium text-foreground">{d.count}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
