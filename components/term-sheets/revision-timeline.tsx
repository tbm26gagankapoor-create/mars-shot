import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { GitBranch } from "lucide-react";

type Revision = {
  id: string;
  versionNumber: number;
  changes: unknown;
  note: string | null;
  createdAt: Date;
};

type RevisionTimelineProps = {
  revisions: Revision[];
};

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "---";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
    return String(value);
  }
  return String(value);
}

export function RevisionTimeline({ revisions }: RevisionTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <GitBranch className="h-4 w-4" />
          Revision History ({revisions.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {revisions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No revisions yet. Changes to the term sheet will appear here.
          </p>
        ) : (
          <div className="space-y-4">
            {revisions.map((revision) => {
              const changes =
                (revision.changes as Record<
                  string,
                  { from: unknown; to: unknown }
                >) || {};
              const changeEntries = Object.entries(changes);

              return (
                <div key={revision.id} className="flex gap-3 text-sm">
                  <div className="flex flex-col items-center">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                    <div className="w-px flex-1 bg-border" />
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">v{revision.versionNumber}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(revision.createdAt, "MMM d, yyyy h:mm a")}
                      </span>
                    </div>
                    {revision.note && (
                      <p className="text-muted-foreground mb-2">
                        {revision.note}
                      </p>
                    )}
                    {changeEntries.length > 0 && (
                      <div className="rounded border p-3 space-y-1 bg-muted/30">
                        {changeEntries.map(([field, { from, to }]) => (
                          <div key={field} className="flex items-center gap-2">
                            <span className="font-medium capitalize">
                              {field.replace(/([A-Z])/g, " $1").trim()}:
                            </span>
                            <span className="text-red-600 line-through">
                              {formatValue(from)}
                            </span>
                            <span className="text-muted-foreground">-&gt;</span>
                            <span className="text-green-600">
                              {formatValue(to)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
