"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type EcosystemHealthProps = {
  data: {
    totalContacts: number;
    staleContacts: number;
    warmthDistribution: { warmth: string; count: number }[];
    typeDistribution: { type: string; count: number }[];
  };
};

const WARMTH_COLORS: Record<string, string> = {
  HOT: "hsl(0, 85%, 55%)",
  WARM: "hsl(35, 90%, 55%)",
  COLD: "hsl(210, 70%, 55%)",
};

const TYPE_COLORS = [
  "hsl(210, 80%, 55%)",
  "hsl(150, 60%, 45%)",
  "hsl(35, 90%, 55%)",
  "hsl(280, 60%, 55%)",
  "hsl(0, 70%, 55%)",
  "hsl(170, 55%, 50%)",
];

export function EcosystemHealth({ data }: EcosystemHealthProps) {
  const { totalContacts, staleContacts, warmthDistribution, typeDistribution } =
    data;

  const healthPercent =
    totalContacts > 0
      ? Math.round(((totalContacts - staleContacts) / totalContacts) * 100)
      : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ecosystem Health</CardTitle>
        <CardDescription>
          {totalContacts} contacts total &middot; {healthPercent}% active (
          {staleContacts} stale &gt;90 days)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Warmth Distribution */}
          <div>
            <h4 className="text-sm font-medium mb-3 text-muted-foreground">
              Warmth Distribution
            </h4>
            {warmthDistribution.length === 0 ? (
              <div className="flex items-center justify-center h-[180px] text-muted-foreground text-sm">
                No data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={warmthDistribution}>
                  <XAxis dataKey="warmth" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {warmthDistribution.map((entry, index) => (
                      <Cell
                        key={`warmth-${index}`}
                        fill={WARMTH_COLORS[entry.warmth] || "hsl(var(--primary))"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Contact Type Distribution */}
          <div>
            <h4 className="text-sm font-medium mb-3 text-muted-foreground">
              Contact Types
            </h4>
            {typeDistribution.length === 0 ? (
              <div className="flex items-center justify-center h-[180px] text-muted-foreground text-sm">
                No data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={typeDistribution}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    label={(entry) =>
                      `${(entry as any).type} (${(entry as any).count})`
                    }
                  >
                    {typeDistribution.map((_, index) => (
                      <Cell
                        key={`type-${index}`}
                        fill={TYPE_COLORS[index % TYPE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
