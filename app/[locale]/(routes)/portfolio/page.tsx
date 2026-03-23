import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  getPortfolioCompanies,
  getQuietPortfolioCompanies,
} from "@/actions/portfolio";
import {
  SECTOR_LABELS,
  FUNDING_STAGE_LABELS,
  SECTOR_COLORS,
  HEALTH_STATUS_COLORS,
  HEALTH_STATUS_LABELS,
  RUNWAY_THRESHOLDS,
} from "@/lib/constants";
import { CompanyLogo } from "@/components/portfolio/company-logo";
import { HealthStatusBadge } from "@/components/portfolio/health-status-badge";
import { format } from "date-fns";
import {
  AlertTriangle,
  Building2,
  DollarSign,
  User,
  Briefcase,
  TrendingUp,
  Flame,
} from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export default async function PortfolioPage() {
  let companies: Awaited<ReturnType<typeof getPortfolioCompanies>> = [];
  let quietCompanies: Awaited<
    ReturnType<typeof getQuietPortfolioCompanies>
  > = [];

  try {
    [companies, quietCompanies] = await Promise.all([
      getPortfolioCompanies(),
      getQuietPortfolioCompanies(),
    ]);
  } catch {
    // DB not connected
  }

  const totalDeployed = companies.reduce(
    (sum, c) => sum + (c.chequeAmount ?? 0),
    0
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Portfolio</h1>
        <p className="text-muted-foreground">
          Invested companies — auto-created when deals close
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Briefcase className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-display text-2xl font-semibold tabular-nums">{companies.length}</p>
                <p className="text-xs text-muted-foreground">
                  Portfolio Companies
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-display text-2xl font-semibold tabular-nums">
                  {totalDeployed >= 1_000_000
                    ? `$${(totalDeployed / 1_000_000).toFixed(2)}M`
                    : totalDeployed >= 1_000
                      ? `$${(totalDeployed / 1_000).toFixed(0)}K`
                      : `$${totalDeployed.toLocaleString()}`}
                </p>
                <p className="text-xs text-muted-foreground">
                  Total Deployed Capital
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-display text-2xl font-semibold tabular-nums">{quietCompanies.length}</p>
                <p className="text-xs text-muted-foreground">
                  Quiet Companies (90+ days)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quiet Companies Alert */}
      {quietCompanies.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4" />
              Quiet Companies — No activity in 90+ days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {quietCompanies.map((c) => (
                <Link key={c.id} href={`/portfolio/${c.id}`}>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/30"
                  >
                    {c.companyName}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Portfolio Grid */}
      {companies.length === 0 ? (
        <Card>
          <CardContent className="py-4">
            <EmptyState
              icon={Building2}
              title="No portfolio companies yet"
              description="Companies are auto-created when deals close"
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
          {companies.map((company) => (
            <Link key={company.id} href={`/portfolio/${company.id}`}>
              <Card className="hover:shadow-soft-lg hover:-translate-y-0.5 hover:border-primary/20 transition-all duration-200 cursor-pointer h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <CompanyLogo
                      companyName={company.companyName}
                      website={company.website}
                      sector={company.sector}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">
                        {company.companyName}
                      </CardTitle>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        {company.sector && (
                          <Badge
                            variant="outline"
                            className={SECTOR_COLORS[company.sector] ?? SECTOR_COLORS.OTHER}
                          >
                            {SECTOR_LABELS[company.sector] || company.sector}
                          </Badge>
                        )}
                        <HealthStatusBadge status={company.healthStatus} size="sm" />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-muted-foreground">Cheque</span>
                      <p className="font-medium">
                        {company.chequeAmount
                          ? company.chequeAmount >= 1_000_000
                            ? `$${(company.chequeAmount / 1_000_000).toFixed(2)}M`
                            : `$${(company.chequeAmount / 1_000).toFixed(0)}K`
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Invested</span>
                      <p className="font-medium">
                        {company.dateInvested
                          ? format(company.dateInvested, "MMM d, yyyy")
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Stage</span>
                      <p className="font-medium">
                        {company.fundingStage
                          ? FUNDING_STAGE_LABELS[company.fundingStage] ||
                            company.fundingStage
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Follow-ons</span>
                      <p className="font-medium">
                        {company.followOnRounds.length}
                      </p>
                    </div>
                  </div>

                  {/* Latest KPI metrics */}
                  {company.kpiSnapshots?.[0] && (() => {
                    const kpi = company.kpiSnapshots[0];
                    const hasMrr = kpi.mrr != null;
                    const hasRunway = kpi.runway != null;
                    if (!hasMrr && !hasRunway) return null;
                    return (
                      <div className="flex items-center gap-3 text-xs">
                        {hasMrr && (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <TrendingUp className="h-3 w-3" />
                            MRR ${kpi.mrr! >= 1000 ? `${(kpi.mrr! / 1000).toFixed(0)}K` : kpi.mrr!.toLocaleString()}
                          </span>
                        )}
                        {hasRunway && (
                          <span className={`flex items-center gap-1 ${
                            kpi.runway! < RUNWAY_THRESHOLDS.critical
                              ? "text-red-600"
                              : kpi.runway! < RUNWAY_THRESHOLDS.warning
                                ? "text-amber-600"
                                : "text-muted-foreground"
                          }`}>
                            <Flame className="h-3 w-3" />
                            {kpi.runway}mo runway
                          </span>
                        )}
                      </div>
                    );
                  })()}

                  {company.founderName && (
                    <>
                      <Separator />
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>{company.founderName}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
