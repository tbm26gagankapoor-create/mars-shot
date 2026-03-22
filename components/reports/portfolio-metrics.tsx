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

type PortfolioMetricsProps = {
  data: {
    totalCompanies: number;
    totalInvested: number;
    followOnCount: number;
    sectorBreakdown: { sector: string; count: number }[];
  };
};

const SECTOR_COLORS = [
  "hsl(210, 80%, 55%)",
  "hsl(150, 60%, 45%)",
  "hsl(35, 90%, 55%)",
  "hsl(280, 60%, 55%)",
  "hsl(0, 70%, 55%)",
  "hsl(170, 55%, 50%)",
  "hsl(50, 80%, 50%)",
  "hsl(320, 60%, 50%)",
];

function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(0)}K`;
  }
  return `$${amount.toFixed(0)}`;
}

export function PortfolioMetrics({ data }: PortfolioMetricsProps) {
  const { totalCompanies, totalInvested, followOnCount, sectorBreakdown } =
    data;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Metrics</CardTitle>
        <CardDescription>Overview of portfolio performance</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Summary stats row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="rounded-lg border p-4 text-center">
            <div className="text-2xl font-bold">{totalCompanies}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Portfolio Companies
            </div>
          </div>
          <div className="rounded-lg border p-4 text-center">
            <div className="text-2xl font-bold">
              {formatCurrency(totalInvested)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Total Invested
            </div>
          </div>
          <div className="rounded-lg border p-4 text-center">
            <div className="text-2xl font-bold">{followOnCount}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Follow-on Rounds
            </div>
          </div>
        </div>

        {/* Sector breakdown chart */}
        <h4 className="text-sm font-medium mb-3 text-muted-foreground">
          Sector Breakdown
        </h4>
        {sectorBreakdown.length === 0 ? (
          <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
            No sector data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={sectorBreakdown} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="sector"
                tick={{ fontSize: 12 }}
                width={120}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {sectorBreakdown.map((_, index) => (
                  <Cell
                    key={`sector-${index}`}
                    fill={SECTOR_COLORS[index % SECTOR_COLORS.length]}
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
