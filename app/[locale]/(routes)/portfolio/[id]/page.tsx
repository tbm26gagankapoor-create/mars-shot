import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getPortfolioCompanyById } from "@/actions/portfolio";
import {
  SECTOR_LABELS,
  FUNDING_STAGE_LABELS,
  SECTOR_COLORS,
  FUNDING_STAGE_COLORS,
} from "@/lib/constants";
import { CompanyLogo } from "@/components/portfolio/company-logo";
import { HealthStatusBadge } from "@/components/portfolio/health-status-badge";
import { InvestmentSummaryCard } from "@/components/portfolio/investment-summary-card";
import { KpiLatestCard } from "@/components/portfolio/kpi-latest-card";
import { KpiChart } from "@/components/portfolio/kpi-chart";
import { DocumentsList } from "@/components/portfolio/documents-list";
import { UpcomingEvents } from "@/components/portfolio/upcoming-events";
import { CoInvestorsTags } from "@/components/portfolio/co-investors-tags";
import {
  EditInvestmentButton,
  AddKpiButton,
} from "@/components/portfolio/portfolio-detail-actions";
import { PortfolioActions } from "@/components/portfolio/portfolio-actions";
import { format, formatDistanceToNow } from "date-fns";
import {
  ExternalLink,
  Mail,
  Phone,
  User,
  DollarSign,
  CalendarDays,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
} from "lucide-react";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PortfolioDetailPage({ params }: Props) {
  const { id } = await params;

  let company: Awaited<ReturnType<typeof getPortfolioCompanyById>> = null;
  try {
    company = await getPortfolioCompanyById(id);
  } catch {
    // DB not connected
  }

  if (!company) return notFound();

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/portfolio"
        className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
      >
        <ArrowLeft className="h-3 w-3" /> Back to Portfolio
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <CompanyLogo
            companyName={company.companyName}
            website={company.website}
            sector={company.sector}
            size="lg"
          />
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display text-2xl font-semibold tracking-tight">
                {company.companyName}
              </h1>
              {company.sector && (
                <Badge
                  variant="outline"
                  className={SECTOR_COLORS[company.sector] ?? SECTOR_COLORS.OTHER}
                >
                  {SECTOR_LABELS[company.sector] || company.sector}
                </Badge>
              )}
              {company.fundingStage && (
                <Badge
                  variant="outline"
                  className={
                    FUNDING_STAGE_COLORS[company.fundingStage] ??
                    FUNDING_STAGE_COLORS.OTHER
                  }
                >
                  {FUNDING_STAGE_LABELS[company.fundingStage] ||
                    company.fundingStage}
                </Badge>
              )}
              <HealthStatusBadge status={company.healthStatus} />
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              {company.chequeAmount && (
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {company.chequeAmount >= 1_000_000
                    ? `$${(company.chequeAmount / 1_000_000).toFixed(2)}M`
                    : `$${(company.chequeAmount / 1_000).toFixed(0)}K`}
                </span>
              )}
              {company.dateInvested && (
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  Invested {format(company.dateInvested, "MMM d, yyyy")} (
                  {formatDistanceToNow(company.dateInvested, {
                    addSuffix: true,
                  })}
                  )
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PortfolioActions portfolioCompanyId={company.id} />
          <EditInvestmentButton company={company} />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="kpis">
            KPIs ({company.kpiSnapshots.length})
          </TabsTrigger>
          <TabsTrigger value="documents">
            Documents ({company.documents.length})
          </TabsTrigger>
          <TabsTrigger value="rounds">
            Rounds ({company.followOnRounds.length})
          </TabsTrigger>
          <TabsTrigger value="notes">
            Notes ({company.boardNotes.length})
          </TabsTrigger>
          <TabsTrigger value="activity">
            Activity ({company.activities.length})
          </TabsTrigger>
        </TabsList>

        {/* ── Overview ────────────────────────────────────── */}
        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-6">
              <InvestmentSummaryCard
                entryValuation={company.entryValuation}
                currentValuation={company.currentValuation}
                ownershipPct={company.ownershipPct}
                chequeAmount={company.chequeAmount}
                proRataRights={company.proRataRights}
                boardSeat={company.boardSeat}
              />

              {/* Company Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Company Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-xs text-muted-foreground">Sector</span>
                      <p>
                        {company.sector
                          ? SECTOR_LABELS[company.sector] || company.sector
                          : "---"}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Funding Stage</span>
                      <p>
                        {company.fundingStage
                          ? FUNDING_STAGE_LABELS[company.fundingStage] ||
                            company.fundingStage
                          : "---"}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Cheque Amount</span>
                      <p>
                        {company.chequeAmount
                          ? company.chequeAmount >= 1_000_000
                            ? `$${(company.chequeAmount / 1_000_000).toFixed(2)}M`
                            : `$${(company.chequeAmount / 1_000).toFixed(0)}K`
                          : "---"}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Date Invested</span>
                      <p>
                        {company.dateInvested
                          ? format(company.dateInvested, "MMM d, yyyy")
                          : "---"}
                      </p>
                    </div>
                  </div>

                  {company.website && (
                    <>
                      <Separator />
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary flex items-center gap-1 hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {company.website}
                      </a>
                    </>
                  )}

                  {company.dealId && (
                    <>
                      <Separator />
                      <Link
                        href={`/deals/${company.dealId}`}
                        className="text-sm text-primary flex items-center gap-1 hover:underline"
                      >
                        <FileText className="h-3 w-3" />
                        View Original Deal
                      </Link>
                    </>
                  )}
                </CardContent>
              </Card>

              <CoInvestorsTags coInvestors={company.coInvestors} />
            </div>

            {/* Right column */}
            <div className="space-y-6">
              <KpiLatestCard
                healthStatus={company.healthStatus}
                nextMilestone={company.nextMilestone}
                snapshots={company.kpiSnapshots}
              />

              <UpcomingEvents events={company.calendarEvents} />

              {/* Primary Founder */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Primary Founder</CardTitle>
                </CardHeader>
                <CardContent>
                  {company.founderName ? (
                    <div className="flex items-start gap-3 text-sm">
                      <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{company.founderName}</p>
                        <div className="flex flex-col gap-1 text-muted-foreground mt-1">
                          {company.founderEmail && (
                            <a
                              href={`mailto:${company.founderEmail}`}
                              className="flex items-center gap-1 hover:text-primary"
                            >
                              <Mail className="h-3 w-3" /> {company.founderEmail}
                            </a>
                          )}
                          {company.founderPhone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" /> {company.founderPhone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No founder contact recorded
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── KPIs ─────────────────────────────────────────── */}
        <TabsContent value="kpis" className="mt-4 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium">KPI Snapshots</h2>
            <AddKpiButton companyId={company.id} />
          </div>

          {company.kpiSnapshots.length > 1 && (
            <KpiChart snapshots={company.kpiSnapshots} />
          )}

          {company.kpiSnapshots.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <p className="text-sm text-muted-foreground text-center">
                  No KPI snapshots recorded yet. Add the first one to start tracking.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-xs text-muted-foreground">
                        <th className="p-3 font-medium">Month</th>
                        <th className="p-3 font-medium">MRR</th>
                        <th className="p-3 font-medium">ARR</th>
                        <th className="p-3 font-medium">Burn</th>
                        <th className="p-3 font-medium">Runway</th>
                        <th className="p-3 font-medium">Team</th>
                        <th className="p-3 font-medium">Customers</th>
                        <th className="p-3 font-medium">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {company.kpiSnapshots.map((s) => (
                        <tr key={s.id} className="border-b last:border-0">
                          <td className="p-3 font-medium">
                            {format(s.periodDate, "MMM yyyy")}
                          </td>
                          <td className="p-3">
                            {s.mrr != null ? `$${(s.mrr / 1_000).toFixed(0)}K` : "---"}
                          </td>
                          <td className="p-3">
                            {s.arr != null ? `$${(s.arr / 1_000).toFixed(0)}K` : "---"}
                          </td>
                          <td className="p-3">
                            {s.burnRate != null
                              ? `$${(s.burnRate / 1_000).toFixed(0)}K`
                              : "---"}
                          </td>
                          <td className="p-3">
                            {s.runway != null ? `${s.runway}mo` : "---"}
                          </td>
                          <td className="p-3">{s.headcount ?? "---"}</td>
                          <td className="p-3">{s.customers ?? "---"}</td>
                          <td className="p-3 max-w-[200px] truncate text-muted-foreground">
                            {s.notes || "---"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── Documents ─────────────────────────────────────── */}
        <TabsContent value="documents" className="mt-4">
          <DocumentsList documents={company.documents} />
        </TabsContent>

        {/* ── Follow-on Rounds ────────────────────────────── */}
        <TabsContent value="rounds" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Follow-on Rounds</CardTitle>
            </CardHeader>
            <CardContent>
              {company.followOnRounds.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No follow-on rounds recorded yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {company.followOnRounds.map((round) => (
                    <div
                      key={round.id}
                      className="flex items-start justify-between p-3 rounded border"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{round.roundName}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {round.amount && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              {round.amount >= 1_000_000
                                ? `$${(round.amount / 1_000_000).toFixed(2)}M`
                                : `$${(round.amount / 1_000).toFixed(0)}K`}
                            </span>
                          )}
                          {round.leadInvestor && (
                            <span>Led by {round.leadInvestor}</span>
                          )}
                          {round.date && (
                            <span className="flex items-center gap-1">
                              <CalendarDays className="h-3 w-3" />
                              {format(round.date, "MMM d, yyyy")}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge
                        variant={round.marsShotParticipated ? "default" : "secondary"}
                        className="shrink-0 flex items-center gap-1"
                      >
                        {round.marsShotParticipated ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {round.marsShotParticipated
                          ? "Participated"
                          : "Did not participate"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Board Notes ─────────────────────────────────── */}
        <TabsContent value="notes" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Board Notes</CardTitle>
            </CardHeader>
            <CardContent>
              {company.boardNotes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No board notes recorded yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {company.boardNotes.map((note) => (
                    <div key={note.id} className="rounded border p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">{note.title}</p>
                        <span className="text-xs text-muted-foreground">
                          {note.date
                            ? format(note.date, "MMM d, yyyy")
                            : format(note.createdAt, "MMM d, yyyy")}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                        {note.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Activity ────────────────────────────────────── */}
        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {company.activities.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No activity recorded yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {company.activities.map((activity) => (
                    <div key={activity.id} className="flex gap-3 text-sm">
                      <div className="flex flex-col items-center">
                        <Clock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <div className="w-px flex-1 bg-border mt-1" />
                      </div>
                      <div className="pb-4">
                        <p className="font-medium">{activity.title}</p>
                        {activity.description && (
                          <p className="text-muted-foreground">
                            {activity.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(activity.createdAt, "MMM d, yyyy h:mm a")}{" "}
                          &middot;{" "}
                          {formatDistanceToNow(activity.createdAt, {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
