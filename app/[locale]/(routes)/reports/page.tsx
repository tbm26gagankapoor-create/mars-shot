import {
  getPipelineVelocity,
  getConversionRates,
  getSourceAttribution,
  getPortfolioMetrics,
  getEcosystemHealth,
  getDealFunnel,
  getDashboardStats,
} from "@/actions/reports";

import { MetricCard } from "@/components/reports/metric-card";
import { PipelineVelocity } from "@/components/reports/pipeline-velocity";
import { ConversionFunnel } from "@/components/reports/conversion-funnel";
import { SourceAttribution } from "@/components/reports/source-attribution";
import { EcosystemHealth } from "@/components/reports/ecosystem-health";
import { PortfolioMetrics } from "@/components/reports/portfolio-metrics";

export default async function ReportsPage() {
  const [
    pipelineVelocity,
    conversionRates,
    sourceAttribution,
    portfolioMetrics,
    ecosystemHealth,
    dealFunnel,
    dashboardStats,
  ] = await Promise.all([
    getPipelineVelocity(),
    getConversionRates(),
    getSourceAttribution(),
    getPortfolioMetrics(),
    getEcosystemHealth(),
    getDealFunnel(),
    getDashboardStats(),
  ]);

  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-tight">Reports</h2>
        <p className="text-muted-foreground">
          Pipeline analytics and portfolio performance
        </p>
      </div>

      {/* Row 1: Key metric cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <MetricCard
          title="Active Deals"
          value={dashboardStats.activeDeals}
          description="in pipeline"
        />
        <MetricCard
          title="Draft Deals"
          value={dashboardStats.draftDeals}
          description="pending submission"
        />
        <MetricCard
          title="Portfolio"
          value={dashboardStats.portfolioCount}
          description="companies"
        />
        <MetricCard
          title="Contacts"
          value={dashboardStats.contactCount}
          description="in ecosystem"
        />
        <MetricCard
          title="Breached SLAs"
          value={dashboardStats.breachedSla}
          trend={dashboardStats.breachedSla > 0 ? "down" : "neutral"}
          trendValue={dashboardStats.breachedSla > 0 ? "Needs attention" : "All clear"}
        />
      </div>

      {/* Row 2: Pipeline velocity + Deal funnel */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <PipelineVelocity data={pipelineVelocity} />
        <ConversionFunnel data={dealFunnel.map((f, i) => ({
          stage: f.stage,
          count: f.count,
          conversionRate:
            i === 0
              ? 100
              : dealFunnel[0].count > 0
                ? Math.round((f.count / dealFunnel[0].count) * 100)
                : 0,
        }))} />
      </div>

      {/* Row 3: Source attribution + Ecosystem health */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <SourceAttribution data={sourceAttribution} />
        <EcosystemHealth data={ecosystemHealth} />
      </div>

      {/* Row 4: Portfolio metrics */}
      <div className="grid gap-4 grid-cols-1">
        <PortfolioMetrics data={portfolioMetrics} />
      </div>
    </div>
  );
}
