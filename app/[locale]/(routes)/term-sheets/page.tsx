import { getTermSheets } from "@/actions/term-sheets";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, FileText, DollarSign, Clock } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

const statusColors: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  SENT: "bg-primary/10 text-primary",
  NEGOTIATING: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  SIGNED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  EXPIRED: "bg-muted text-muted-foreground line-through",
};

export default async function TermSheetsPage() {
  let termSheets: Awaited<ReturnType<typeof getTermSheets>> = [];

  try {
    termSheets = await getTermSheets();
  } catch {
    // DB not connected yet
  }

  const stats = {
    total: termSheets.length,
    draft: termSheets.filter((ts) => ts.status === "DRAFT").length,
    sent: termSheets.filter((ts) => ts.status === "SENT").length,
    signed: termSheets.filter((ts) => ts.status === "SIGNED").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Term Sheets</h1>
          <p className="text-muted-foreground">
            Manage term sheets across your deal pipeline
          </p>
        </div>
        <Link href="/term-sheets/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            New Term Sheet
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-display text-2xl font-semibold tabular-nums">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-display text-2xl font-semibold tabular-nums">{stats.draft}</p>
                <p className="text-xs text-muted-foreground">Drafts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-display text-2xl font-semibold tabular-nums">{stats.sent}</p>
                <p className="text-xs text-muted-foreground">Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-display text-2xl font-semibold tabular-nums">{stats.signed}</p>
                <p className="text-xs text-muted-foreground">Signed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Term Sheets List */}
      {termSheets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-display font-medium">No term sheets yet</p>
            <p className="text-xs text-muted-foreground">
              Create one to get started
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {termSheets.map((ts) => (
            <Link key={ts.id} href={`/term-sheets/${ts.id}`}>
              <Card className="hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">
                      {ts.deal.companyName}
                    </CardTitle>
                    <Badge
                      className={statusColors[ts.status] || "bg-gray-100 text-gray-800"}
                    >
                      {ts.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-muted-foreground">Valuation</span>
                      <p className="font-medium font-display tabular-nums">
                        {ts.valuation
                          ? ts.valuation >= 1_000_000
                            ? `$${(ts.valuation / 1_000_000).toFixed(2)}M`
                            : `$${(ts.valuation / 1_000).toFixed(0)}K`
                          : "---"}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Cheque Size</span>
                      <p className="font-medium font-display tabular-nums">
                        {ts.chequeSize
                          ? ts.chequeSize >= 1_000_000
                            ? `$${(ts.chequeSize / 1_000_000).toFixed(2)}M`
                            : `$${(ts.chequeSize / 1_000).toFixed(0)}K`
                          : "---"}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Equity</span>
                      <p className="font-medium font-display tabular-nums">
                        {ts.equityPercent ? `${ts.equityPercent}%` : "---"}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Version</span>
                      <p className="font-medium">v{ts.version}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      Updated{" "}
                      {formatDistanceToNow(ts.updatedAt, { addSuffix: true })}
                    </span>
                    <span>
                      {ts._count.documents} doc{ts._count.documents !== 1 ? "s" : ""} &middot;{" "}
                      {ts._count.revisions} rev{ts._count.revisions !== 1 ? "s" : ""}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
