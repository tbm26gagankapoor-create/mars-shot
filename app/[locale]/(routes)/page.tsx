import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Crosshair,
  Briefcase,
  Users,
  AlertTriangle,
  TrendingUp,
  FileEdit,
  Activity,
  BarChart3,
  PieChart,
  Shield,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getDashboardStats,
  getPipelineDistribution,
  getSectorDistribution,
} from "@/actions/dashboard";
import { getBreachedDeals } from "@/actions/deals";
import { getUpcomingEvents } from "@/actions/calendar";
import { DEAL_STAGES } from "@/lib/constants";
import { PipelineChart } from "@/components/dashboard/pipeline-chart";
import { SectorDonut } from "@/components/dashboard/sector-donut";

// ─── Helpers ───────────────────────────────────────────────

function stageLabel(key: string) {
  return DEAL_STAGES.find((s) => s.key === key)?.label ?? key;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// ─── Page ──────────────────────────────────────────────────

export default async function DashboardPage() {
  const [statsResult, pipelineResult, sectorsResult, breachedResult, eventsResult] =
    await Promise.allSettled([
      getDashboardStats(),
      getPipelineDistribution(),
      getSectorDistribution(),
      getBreachedDeals(),
      getUpcomingEvents(3),
    ]);

  const stats = statsResult.status === "fulfilled" ? statsResult.value : null;
  const pipeline = pipelineResult.status === "fulfilled" ? pipelineResult.value : null;
  const sectors = sectorsResult.status === "fulfilled" ? sectorsResult.value : null;
  const breachedDealsList = breachedResult.status === "fulfilled" ? breachedResult.value : null;
  const upcomingEvents = eventsResult.status === "fulfilled" ? eventsResult.value : null;

  const breachCount = stats?.breachedDeals ?? 0;
  const sectorData = sectors
    ?.filter((s) => s.sector !== null)
    .map((s) => ({ sector: s.sector as string, count: s.count })) ?? [];

  return (
    <div className="space-y-6">
      {/* Hero Greeting */}
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          {getGreeting()}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {breachCount > 0
            ? `${breachCount} SLA breach${breachCount > 1 ? "es" : ""} need attention`
            : "All deals within SLA — pipeline is healthy"}
        </p>
      </div>

      {/* ── Hero Stat Cards (2 large) ─────────────────────── */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card className="hover:border-primary/20 transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Pipeline</CardTitle>
            <Crosshair className="h-4 w-4 text-primary/60" />
          </CardHeader>
          <CardContent>
            <Link href="/deals" className="block group">
              <div className="font-display text-3xl font-semibold tabular-nums">
                {stats?.activeDeals ?? "-"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.dealsThisMonth
                  ? `${stats.dealsThisMonth} new this month`
                  : "deals in progress"}
              </p>
            </Link>
          </CardContent>
        </Card>

        <Card
          className={
            breachCount > 0
              ? "border-l-[3px] border-l-destructive hover:border-destructive/30 transition-all hover:shadow-md"
              : "hover:border-primary/20 transition-all hover:shadow-md"
          }
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">SLA Health</CardTitle>
            <Shield
              className={`h-4 w-4 ${breachCount > 0 ? "text-destructive" : "text-health-green"}`}
            />
          </CardHeader>
          <CardContent>
            <div className="font-display text-3xl font-semibold tabular-nums">
              {breachCount === 0 ? (
                <span className="text-health-green">All clear</span>
              ) : (
                <span className="text-destructive">{breachCount} breach{breachCount > 1 ? "es" : ""}</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {breachCount > 0
                ? "Deals exceeding stage SLA"
                : "Every deal within time limits"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Compact Stat Cards (4 small) ──────────────────── */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <CompactStat
          title="Drafts"
          value={stats?.draftDeals ?? "-"}
          icon={FileEdit}
          href="/deals/drafts"
          accent="hsl(var(--chart-1))"
        />
        <CompactStat
          title="Portfolio"
          value={stats?.portfolioCount ?? "-"}
          icon={Briefcase}
          href="/portfolio"
          accent="hsl(var(--chart-2))"
        />
        <CompactStat
          title="Contacts"
          value={stats?.contactCount ?? "-"}
          icon={Users}
          href="/ecosystem"
          accent="hsl(var(--chart-3))"
        />
        <CompactStat
          title="This Month"
          value={stats?.dealsThisMonth ?? "-"}
          icon={TrendingUp}
          accent="hsl(var(--chart-4))"
        />
      </div>

      {/* ── Middle Row: Pipeline Funnel + Sectors ─────────── */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {/* Pipeline Funnel */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pipeline Distribution
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {pipeline && pipeline.length > 0 ? (
              <PipelineChart data={pipeline} />
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3">
                  <BarChart3 className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-display font-medium">No pipeline data</p>
                <p className="text-xs text-muted-foreground">
                  Create your first deal to see distribution
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sector Breakdown */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Sector Breakdown
            </CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {sectorData.length > 0 ? (
              <SectorDonut data={sectorData} />
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3">
                  <PieChart className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-display font-medium">No sector data</p>
                <p className="text-xs text-muted-foreground">
                  Sector breakdown appears as deals are added
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Bottom Row: SLA Breaches + Activity + Events ─── */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        {/* SLA Breach Alerts */}
        <Card
          className={
            breachedDealsList && breachedDealsList.length > 0
              ? "border-l-[3px] border-l-destructive"
              : ""
          }
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              SLA Breaches
            </CardTitle>
            <AlertTriangle
              className={`h-4 w-4 ${
                breachedDealsList && breachedDealsList.length > 0
                  ? "text-destructive"
                  : "text-muted-foreground"
              }`}
            />
          </CardHeader>
          <CardContent>
            {breachedDealsList && breachedDealsList.length > 0 ? (
              <ul className="space-y-2">
                {breachedDealsList.map((deal) => (
                  <li key={deal.id}>
                    <Link
                      href={`/deals/${deal.id}`}
                      className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-muted transition-colors"
                    >
                      <span className="font-medium">{deal.companyName}</span>
                      <Badge variant="destructive" className="text-[10px]">
                        {stageLabel(deal.stage)}
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-6">
                <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
                  <Shield className="h-5 w-5 text-health-green" />
                </div>
                <p className="text-sm font-display font-medium">All clear</p>
                <p className="text-xs text-muted-foreground">
                  No SLA breaches right now
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Activity
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {stats?.recentActivities && stats.recentActivities.length > 0 ? (
              <ul className="space-y-3">
                {stats.recentActivities.map((act) => (
                  <li
                    key={act.id}
                    className="flex items-start gap-3 text-sm"
                  >
                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="font-medium">{act.title}</span>
                      {act.deal?.companyName && (
                        <span className="text-muted-foreground">
                          {" "}— {act.deal.companyName}
                        </span>
                      )}
                      {act.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {act.description}
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                        {formatDistanceToNow(new Date(act.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-6">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3">
                  <Activity className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-display font-medium">No activity yet</p>
                <p className="text-xs text-muted-foreground">
                  Actions on deals will appear here
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Events
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {upcomingEvents && upcomingEvents.length > 0 ? (
              <ul className="space-y-3">
                {upcomingEvents.map((evt) => (
                  <li key={evt.id}>
                    <Link
                      href={`/calendar/${evt.id}`}
                      className="block rounded-md px-2 py-1.5 hover:bg-muted transition-colors"
                    >
                      <p className="text-sm font-medium truncate">{evt.title}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(evt.startAt).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-6">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-display font-medium">No upcoming events</p>
                <p className="text-xs text-muted-foreground">
                  <Link href="/calendar" className="text-primary hover:underline">
                    Schedule an event
                  </Link>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Compact Stat Card ────────────────────────────────────

function CompactStat({
  title,
  value,
  icon: Icon,
  href,
  accent,
}: {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  accent?: string;
}) {
  const inner = (
    <Card
      className="hover:border-primary/20 transition-all hover:shadow-sm"
      style={accent ? { borderLeftWidth: 3, borderLeftColor: accent } : undefined}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          <div className="relative h-7 w-7 rounded-full flex items-center justify-center">
            {accent && (
              <div
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: accent, opacity: 0.12 }}
              />
            )}
            <Icon className="relative h-3.5 w-3.5 text-muted-foreground/60" />
          </div>
        </div>
        <div className="font-display text-lg font-semibold tabular-nums mt-1">
          {value}
        </div>
      </CardContent>
    </Card>
  );

  if (href) return <Link href={href}>{inner}</Link>;
  return inner;
}
