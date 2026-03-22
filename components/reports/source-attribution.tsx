import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type SourceAttributionProps = {
  data: {
    sourceType: string;
    totalDeals: number;
    wonDeals: number;
    winRate: number;
  }[];
};

const SOURCE_LABELS: Record<string, string> = {
  INBOUND: "Inbound",
  OUTBOUND: "Outbound",
  REFERRAL: "Referral",
  ECOSYSTEM: "Ecosystem",
  EVENT: "Event",
  UNKNOWN: "Unknown",
};

function formatSource(source: string) {
  return SOURCE_LABELS[source] || source.replace(/_/g, " ");
}

export function SourceAttribution({ data }: SourceAttributionProps) {
  const sorted = [...data].sort((a, b) => b.totalDeals - a.totalDeals);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Source Attribution</CardTitle>
        <CardDescription>Deal sources and their win rates</CardDescription>
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            No source data available
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                    Source
                  </th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">
                    Total
                  </th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">
                    Won
                  </th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">
                    Win Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((row) => (
                  <tr
                    key={row.sourceType}
                    className="border-b last:border-0 hover:bg-muted/50"
                  >
                    <td className="py-3 px-2 font-medium">
                      {formatSource(row.sourceType)}
                    </td>
                    <td className="py-3 px-2 text-right tabular-nums">
                      {row.totalDeals}
                    </td>
                    <td className="py-3 px-2 text-right tabular-nums">
                      {row.wonDeals}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${Math.min(row.winRate, 100)}%` }}
                          />
                        </div>
                        <span className="tabular-nums text-muted-foreground w-10 text-right">
                          {row.winRate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
