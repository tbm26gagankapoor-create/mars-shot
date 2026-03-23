import { Suspense } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Calendar,
  FileEdit,
  Users,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getMorningBriefing,
  getDealsNeedingAttention,
  getTodayEvents,
  getDraftsPreview,
  getPipelineVelocity,
  getDealFlowPulse,
  getCoolingContacts,
  getTopReferrers,
} from "@/actions/dashboard";
import { SectionCards } from "@/components/dashboard/section-cards";
import { AttentionList } from "@/components/dashboard/attention-list";
import { TodayAgenda } from "@/components/dashboard/today-agenda";
import { VelocityCompact } from "@/components/dashboard/velocity-compact";
import { DealFlowPulse } from "@/components/dashboard/deal-flow-pulse";
import { DraftsPreview } from "@/components/dashboard/drafts-preview";
import { NetworkPulse } from "@/components/dashboard/network-pulse";
import { QuickAddSheet } from "@/components/dashboard/quick-add-sheet";

// ─── Helpers ───────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function SectionSkeleton() {
  return (
    <Card>
      <CardContent className="py-8">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted rounded w-1/3" />
          <div className="h-3 bg-muted rounded w-2/3" />
          <div className="h-3 bg-muted rounded w-1/2" />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Async Section Components ───────────────────────────────

async function BriefingHeader() {
  const briefing = await getMorningBriefing().catch(() => null);
  return (
    <>
      <div className="flex flex-col gap-2 px-4 lg:px-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              {getGreeting()}
            </h1>
            <p className="text-sm text-muted-foreground">
              {briefing?.briefingText ?? "Pipeline is healthy — all deals within SLA."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <QuickAddSheet />
            <Button variant="outline" size="sm" asChild>
              <Link href="/deals" className="gap-1.5">
                Pipeline
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {briefing && (
        <SectionCards
          data={{
            breachedCount: briefing.breachedCount,
            atRiskCount: briefing.atRiskCount,
            todayEventsCount: briefing.todayEventsCount,
            draftCount: briefing.draftCount,
            totalActiveDeals: briefing.totalActiveDeals,
          }}
        />
      )}
    </>
  );
}

async function AttentionSection() {
  const attentionDeals = await getDealsNeedingAttention().catch(() => []);
  return (
    <Card>
      <CardHeader>
        <CardDescription>Deals Needing Attention</CardDescription>
        <CardTitle className="text-lg font-semibold">
          {attentionDeals.length > 0
            ? `${attentionDeals.length} deal${attentionDeals.length > 1 ? "s" : ""} flagged`
            : "All clear"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AttentionList deals={attentionDeals} />
      </CardContent>
    </Card>
  );
}

async function AgendaSection() {
  const todayEvents = await getTodayEvents().catch(() => []);
  return (
    <Card>
      <CardHeader>
        <CardDescription>Today&apos;s Agenda</CardDescription>
        <CardTitle className="text-lg font-semibold">
          {todayEvents.length > 0
            ? `${todayEvents.length} event${todayEvents.length > 1 ? "s" : ""}`
            : "No events"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TodayAgenda events={todayEvents} />
      </CardContent>
    </Card>
  );
}

async function VelocitySection() {
  const velocity = await getPipelineVelocity().catch(() => []);
  return (
    <Card>
      <CardHeader>
        <CardDescription>Pipeline Velocity</CardDescription>
        <CardTitle className="text-lg font-semibold">
          Stage duration (avg days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <VelocityCompact data={velocity} />
      </CardContent>
    </Card>
  );
}

async function FlowSection() {
  const flow = await getDealFlowPulse().catch(() => null);
  if (!flow) return null;
  return (
    <Card>
      <CardHeader>
        <CardDescription>Deal Flow — This Month</CardDescription>
        <CardTitle className="text-lg font-semibold">
          Inflow vs Outflow
        </CardTitle>
      </CardHeader>
      <CardContent>
        <DealFlowPulse data={flow} />
      </CardContent>
    </Card>
  );
}

async function DraftsSection() {
  const [drafts, briefing] = await Promise.all([
    getDraftsPreview().catch(() => []),
    getMorningBriefing().catch(() => null),
  ]);
  const draftCount = briefing?.draftCount ?? drafts.length;
  if (draftCount === 0) return null;
  return (
    <Card>
      <CardHeader>
        <CardDescription>Drafts to Triage</CardDescription>
        <CardTitle className="text-lg font-semibold">
          {draftCount} pending
        </CardTitle>
      </CardHeader>
      <CardContent>
        <DraftsPreview drafts={drafts} totalCount={draftCount} />
      </CardContent>
    </Card>
  );
}

async function NetworkSection() {
  const [coolingContacts, topReferrers] = await Promise.all([
    getCoolingContacts().catch(() => []),
    getTopReferrers().catch(() => []),
  ]);
  return (
    <Card>
      <CardHeader>
        <CardDescription>Network Pulse</CardDescription>
        <CardTitle className="text-lg font-semibold">
          Relationships & referrals
        </CardTitle>
      </CardHeader>
      <CardContent>
        <NetworkPulse
          coolingContacts={coolingContacts}
          topReferrers={topReferrers}
        />
      </CardContent>
    </Card>
  );
}

// ─── Page ──────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* A. Briefing Header + KPI Cards */}
          <Suspense
            fallback={
              <>
                <div className="flex flex-col gap-2 px-4 lg:px-6">
                  <h1 className="text-3xl font-semibold tracking-tight">
                    {getGreeting()}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Loading your briefing...
                  </p>
                </div>
                <div className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 px-4 lg:px-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <SectionSkeleton key={i} />
                  ))}
                </div>
              </>
            }
          >
            <BriefingHeader />
          </Suspense>

          {/* B. Deals Needing Attention */}
          <div className="px-4 lg:px-6">
            <Suspense fallback={<SectionSkeleton />}>
              <AttentionSection />
            </Suspense>
          </div>

          {/* C & D. Today's Agenda + Pipeline Velocity */}
          <div className="@xl/main:grid-cols-2 grid grid-cols-1 gap-4 px-4 lg:px-6">
            <Suspense fallback={<SectionSkeleton />}>
              <AgendaSection />
            </Suspense>
            <Suspense fallback={<SectionSkeleton />}>
              <VelocitySection />
            </Suspense>
          </div>

          {/* E. Deal Flow Pulse */}
          <div className="px-4 lg:px-6">
            <Suspense fallback={<SectionSkeleton />}>
              <FlowSection />
            </Suspense>
          </div>

          {/* F & G. Drafts + Network Pulse */}
          <div className="@xl/main:grid-cols-2 grid grid-cols-1 gap-4 px-4 lg:px-6">
            <Suspense fallback={<SectionSkeleton />}>
              <DraftsSection />
            </Suspense>
            <Suspense fallback={<SectionSkeleton />}>
              <NetworkSection />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
