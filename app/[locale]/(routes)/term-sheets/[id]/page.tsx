import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getTermSheetById } from "@/actions/term-sheets";
import { StatusActions } from "@/components/term-sheets/status-actions";
import { RevisionTimeline } from "@/components/term-sheets/revision-timeline";
import { formatDistanceToNow, format } from "date-fns";
import {
  FileText,
  DollarSign,
  Percent,
  Shield,
  Calendar,
  Users,
} from "lucide-react";
import Link from "next/link";

const statusColors: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  SENT: "bg-primary/10 text-primary",
  NEGOTIATING: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  SIGNED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  EXPIRED: "bg-muted text-muted-foreground line-through",
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function TermSheetDetailPage({ params }: Props) {
  const { id } = await params;

  let termSheet;
  try {
    termSheet = await getTermSheetById(id);
  } catch {
    // DB not connected
  }

  if (!termSheet) return notFound();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-semibold tracking-tight">
              {termSheet.deal.companyName}
            </h1>
            <Badge
              className={
                statusColors[termSheet.status] || "bg-muted text-muted-foreground"
              }
            >
              {termSheet.status}
            </Badge>
            <Badge variant="outline">v{termSheet.version}</Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Term Sheet &middot; Created{" "}
            {formatDistanceToNow(termSheet.createdAt, { addSuffix: true })}
          </p>
        </div>
        <StatusActions
          termSheetId={termSheet.id}
          currentStatus={termSheet.status}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Financial Terms */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Financial Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Valuation</span>
                <p className="font-display font-medium tabular-nums">
                  {termSheet.valuation
                    ? termSheet.valuation >= 1_000_000
                      ? `$${(termSheet.valuation / 1_000_000).toFixed(2)}M`
                      : `$${(termSheet.valuation / 1_000).toFixed(0)}K`
                    : "---"}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Cheque Size</span>
                <p className="font-display font-medium tabular-nums">
                  {termSheet.chequeSize
                    ? termSheet.chequeSize >= 1_000_000
                      ? `$${(termSheet.chequeSize / 1_000_000).toFixed(2)}M`
                      : `$${(termSheet.chequeSize / 1_000).toFixed(0)}K`
                    : "---"}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Equity %</span>
                <p className="font-display font-medium tabular-nums">
                  {termSheet.equityPercent
                    ? `${termSheet.equityPercent}%`
                    : "---"}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Liquidation Pref</span>
                <p className="font-medium">
                  {termSheet.liquidationPref || "---"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Investor Rights */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Investor Rights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${
                    termSheet.boardSeat ? "bg-health-green" : "bg-muted-foreground/30"
                  }`}
                />
                <span>Board Seat</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${
                    termSheet.proRataRights ? "bg-health-green" : "bg-muted-foreground/30"
                  }`}
                />
                <span>Pro-Rata Rights</span>
              </div>
            </div>
            {termSheet.investorRights && (
              <>
                <Separator />
                <div>
                  <span className="text-sm text-muted-foreground">
                    Additional Rights
                  </span>
                  <p className="text-sm mt-1 whitespace-pre-wrap">
                    {termSheet.investorRights}
                  </p>
                </div>
              </>
            )}
            {termSheet.otherTerms && (
              <>
                <Separator />
                <div>
                  <span className="text-sm text-muted-foreground">
                    Other Terms
                  </span>
                  <p className="text-sm mt-1 whitespace-pre-wrap">
                    {termSheet.otherTerms}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Key Dates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Key Dates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Created</span>
                <p>{format(termSheet.createdAt, "MMM d, yyyy")}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Last Updated</span>
                <p>{format(termSheet.updatedAt, "MMM d, yyyy")}</p>
              </div>
              {termSheet.sentAt && (
                <div>
                  <span className="text-muted-foreground">Sent</span>
                  <p>{format(termSheet.sentAt, "MMM d, yyyy")}</p>
                </div>
              )}
              {termSheet.signedAt && (
                <div>
                  <span className="text-muted-foreground">Signed</span>
                  <p>{format(termSheet.signedAt, "MMM d, yyyy")}</p>
                </div>
              )}
              {termSheet.expiresAt && (
                <div>
                  <span className="text-muted-foreground">Expires</span>
                  <p>{format(termSheet.expiresAt, "MMM d, yyyy")}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Linked Deal */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Linked Deal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-muted-foreground">Company</span>
                <p>
                  <Link
                    href={`/deals/${termSheet.deal.id}`}
                    className="text-primary hover:underline"
                  >
                    {termSheet.deal.companyName}
                  </Link>
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Stage</span>
                <p>{termSheet.deal.stage}</p>
              </div>
            </div>
            {termSheet.deal.founders && termSheet.deal.founders.length > 0 && (
              <>
                <Separator />
                <div>
                  <span className="text-muted-foreground">Founders</span>
                  {termSheet.deal.founders.map((founder) => (
                    <p key={founder.id} className="mt-1">
                      {founder.name}
                      {founder.email && (
                        <span className="text-muted-foreground">
                          {" "}
                          &middot; {founder.email}
                        </span>
                      )}
                    </p>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documents ({termSheet.documents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {termSheet.documents.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No documents attached to this term sheet.
            </p>
          ) : (
            <div className="space-y-2">
              {termSheet.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-2 rounded border text-sm"
                >
                  <div>
                    <p className="font-medium">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(doc.createdAt, "MMM d, yyyy h:mm a")}
                    </p>
                  </div>
                  <Badge variant="outline">{doc.mimeType || "file"}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revision Timeline */}
      <RevisionTimeline revisions={termSheet.revisions} />
    </div>
  );
}
