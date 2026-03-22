import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  getPortfolioCompanies,
  getQuietPortfolioCompanies,
} from "@/actions/portfolio";
import { SECTOR_LABELS, FUNDING_STAGE_LABELS } from "@/lib/constants";
import { format } from "date-fns";
import {
  AlertTriangle,
  Building2,
  DollarSign,
  User,
  Briefcase,
} from "lucide-react";

export default async function PortfolioPage() {
  let companies: Awaited<ReturnType<typeof getPortfolioCompanies>> = [];
  let quietCompanies: Awaited<
    ReturnType<typeof getQuietPortfolioCompanies>
  > = [];

  try {
    companies = await getPortfolioCompanies();
  } catch {
    // DB not connected
  }

  try {
    quietCompanies = await getQuietPortfolioCompanies();
  } catch {
    // DB not connected
  }

  const totalDeployed = companies.reduce(
    (sum, c) => sum + (c.chequeAmount ?? 0),
    0
  );

  return (
    <div className="space-y-6">
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
          <CardContent className="py-12 text-center">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
              <Building2 className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-display font-medium">No portfolio companies yet</p>
            <p className="text-xs text-muted-foreground">
              Companies are auto-created when deals close
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((company) => (
            <Link key={company.id} href={`/portfolio/${company.id}`}>
              <Card className="hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">
                      {company.companyName}
                    </CardTitle>
                    {company.sector && (
                      <Badge variant="secondary" className="shrink-0">
                        {SECTOR_LABELS[company.sector] || company.sector}
                      </Badge>
                    )}
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
