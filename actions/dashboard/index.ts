"use server";

import { prismadb as prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

// ─── Cache config ─────────────────────────────────────────
const DASHBOARD_REVALIDATE = 60; // seconds

export async function getDashboardStats() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    activeDeals,
    draftDeals,
    portfolioCount,
    contactCount,
    breachedDeals,
    dealsThisMonth,
    recentActivities,
    coldContacts,
  ] = await Promise.all([
    prisma.deal.count({ where: { status: "ACTIVE" } }),
    prisma.deal.count({ where: { status: "DRAFT" } }),
    prisma.portfolioCompany.count(),
    prisma.contact.count(),
    prisma.deal.count({
      where: { status: "ACTIVE", slaDueAt: { lt: now } },
    }),
    prisma.deal.count({
      where: { createdAt: { gte: monthStart } },
    }),
    prisma.activity.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { deal: { select: { companyName: true } } },
    }),
    prisma.contact.count({ where: { warmthScore: "COLD" } }),
  ]);

  return {
    activeDeals,
    draftDeals,
    portfolioCount,
    contactCount,
    breachedDeals,
    dealsThisMonth,
    coldContacts,
    recentActivities,
  };
}

export async function getPipelineDistribution() {
  const deals = await prisma.deal.groupBy({
    by: ["stage"],
    where: { status: { in: ["ACTIVE", "DRAFT"] } },
    _count: true,
  });

  return deals.map((d) => ({ stage: d.stage, count: d._count }));
}

export async function getSectorDistribution() {
  const companies = await prisma.portfolioCompany.groupBy({
    by: ["sector"],
    _count: true,
  });

  return companies.map((c) => ({ sector: c.sector, count: c._count }));
}

// ─── Morning Briefing Dashboard Actions ─────────────────

import {
  DEAL_STAGES,
  STAGE_GATES,
  computeSlaPercent,
  getSlaStatus,
} from "@/lib/constants";

// Human-readable labels for gate fields
const GATE_FIELD_LABELS: Record<string, string> = {
  companyName: "Add company name",
  sector: "Set sector",
  source: "Set deal source",
  deckUploaded: "Upload pitch deck",
  sectorFit: "Assess sector fit",
  stageFit: "Assess stage fit",
  chequeFit: "Assess cheque fit",
  callNotes: "Record call notes",
  founderEmailConfirmed: "Confirm founder email",
  onePagerApproved: "Approve one-pager",
  partnerNotified: "Notify partner",
  ddChecklistStarted: "Start DD checklist",
  partnerBriefUploaded: "Upload partner brief",
  finalDecisionRecorded: "Record final decision",
};

function formatTimeRemaining(slaDueAt: Date): string {
  const diffMs = slaDueAt.getTime() - Date.now();
  const absDiffMs = Math.abs(diffMs);
  const hours = Math.floor(absDiffMs / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) {
    const label = `${days}d ${hours % 24}h`;
    return diffMs < 0 ? `${label} overdue` : `${label} left`;
  }
  return diffMs < 0 ? `${hours}h overdue` : `${hours}h left`;
}

async function _getDealsNeedingAttention() {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Fetch active deals with SLA info — breached, at-risk, or stalled
  const deals = await prisma.deal.findMany({
    where: {
      status: "ACTIVE",
      stage: { not: "DEAL_SOURCE" }, // no SLA for DEAL_SOURCE
    },
    include: { _count: { select: { documents: true } } },
    orderBy: { slaDueAt: "asc" },
  });

  // Get last activity dates for stalled detection
  const dealIds = deals.map((d) => d.id);
  const lastActivities = dealIds.length > 0
    ? await prisma.activity.groupBy({
        by: ["dealId"],
        where: { dealId: { in: dealIds } },
        _max: { createdAt: true },
      })
    : [];

  const lastActivityMap = new Map(
    lastActivities
      .filter((a) => a.dealId !== null)
      .map((a) => [a.dealId!, a._max.createdAt])
  );

  type AttentionDeal = {
    id: string;
    companyName: string;
    stage: string;
    stageLabel: string;
    slaStatus: "breached" | "red" | "yellow" | "stalled";
    slaRemaining: string;
    nextAction: string;
  };

  const result: AttentionDeal[] = [];

  for (const deal of deals) {
    const stageInfo = DEAL_STAGES.find((s) => s.key === deal.stage);
    const label = stageInfo?.label ?? deal.stage;

    // Compute SLA status
    let slaStatus: "breached" | "red" | "yellow" | "stalled" | "green" = "green";
    let slaRemaining = "";

    if (deal.stageEnteredAt && deal.slaDueAt) {
      const pct = computeSlaPercent(deal.stageEnteredAt, deal.slaDueAt);
      slaStatus = getSlaStatus(pct);
      slaRemaining = formatTimeRemaining(deal.slaDueAt);
    }

    // Check stalled (no activity in 7 days)
    const lastAct = lastActivityMap.get(deal.id);
    const isStalled = !lastAct || lastAct < sevenDaysAgo;

    // Only include deals that need attention
    if (slaStatus === "green" && !isStalled) continue;

    // If green SLA but stalled, mark as stalled
    if (slaStatus === "green" && isStalled) {
      slaStatus = "stalled";
      slaRemaining = "No activity in 7+ days";
    }

    // Derive next action from STAGE_GATES for the CURRENT stage
    const gateFields = STAGE_GATES[deal.stage] || [];
    let nextAction = "Review deal";

    for (const field of gateFields) {
      let isMissing = false;
      if (field === "deckUploaded") {
        isMissing = deal._count.documents === 0;
      } else {
        const val = (deal as Record<string, unknown>)[field];
        isMissing = val === null || val === false || val === undefined || val === "";
      }
      if (isMissing) {
        nextAction = GATE_FIELD_LABELS[field] || field;
        break;
      }
    }

    result.push({
      id: deal.id,
      companyName: deal.companyName,
      stage: deal.stage,
      stageLabel: label,
      slaStatus: slaStatus as "breached" | "red" | "yellow" | "stalled",
      slaRemaining,
      nextAction,
    });
  }

  // Sort: breached first, then red, yellow, stalled
  const priority = { breached: 0, red: 1, yellow: 2, stalled: 3 };
  result.sort((a, b) => priority[a.slaStatus] - priority[b.slaStatus]);

  return result;
}

export const getDealsNeedingAttention = unstable_cache(
  _getDealsNeedingAttention,
  ["dashboard-attention"],
  { revalidate: DASHBOARD_REVALIDATE }
);

async function _getMorningBriefing() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  const [breachedCount, atRiskCount, todayEventsCount, draftCount, nextEvent, totalActiveDeals] =
    await Promise.all([
      prisma.deal.count({
        where: { status: "ACTIVE", slaDueAt: { lt: now } },
      }),
      prisma.deal.count({
        where: {
          status: "ACTIVE",
          slaDueAt: { gt: now, lt: new Date(now.getTime() + 12 * 60 * 60 * 1000) },
        },
      }),
      prisma.calendarEvent.count({
        where: {
          startAt: { gte: todayStart, lt: todayEnd },
          status: "SCHEDULED",
        },
      }),
      prisma.deal.count({ where: { status: "DRAFT" } }),
      prisma.calendarEvent.findFirst({
        where: {
          startAt: { gte: now, lt: todayEnd },
          status: "SCHEDULED",
        },
        orderBy: { startAt: "asc" },
        select: { title: true, startAt: true },
      }),
      prisma.deal.count({ where: { status: "ACTIVE" } }),
    ]);

  // Build the briefing sentence
  const parts: string[] = [];
  const attentionCount = breachedCount + atRiskCount;

  if (attentionCount > 0) {
    parts.push(
      `${attentionCount} deal${attentionCount > 1 ? "s" : ""} need${attentionCount === 1 ? "s" : ""} attention${breachedCount > 0 ? ` (${breachedCount} breached)` : ""}`
    );
  }

  if (nextEvent) {
    const time = nextEvent.startAt.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    parts.push(`${nextEvent.title} at ${time}`);
  } else if (todayEventsCount === 0) {
    parts.push("No meetings today");
  }

  if (draftCount > 0) {
    parts.push(`${draftCount} draft${draftCount > 1 ? "s" : ""} to triage`);
  }

  if (parts.length === 0) {
    parts.push("Pipeline is healthy — all deals within SLA");
  }

  return {
    breachedCount,
    atRiskCount,
    todayEventsCount,
    draftCount,
    totalActiveDeals,
    briefingText: parts.join(". ") + ".",
  };
}

export const getMorningBriefing = unstable_cache(
  _getMorningBriefing,
  ["dashboard-briefing"],
  { revalidate: DASHBOARD_REVALIDATE }
);

async function _getTodayEvents() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  return prisma.calendarEvent.findMany({
    where: {
      startAt: { gte: todayStart, lt: todayEnd },
      status: "SCHEDULED",
    },
    include: {
      deal: { select: { id: true, companyName: true } },
      contact: { select: { id: true, name: true } },
    },
    orderBy: { startAt: "asc" },
  });
}

export const getTodayEvents = unstable_cache(
  _getTodayEvents,
  ["dashboard-today-events"],
  { revalidate: DASHBOARD_REVALIDATE }
);

async function _getDraftsPreview() {
  return prisma.deal.findMany({
    where: { status: "DRAFT" },
    select: {
      id: true,
      companyName: true,
      ingestionChannel: true,
      aiConfidence: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 3,
  });
}

export const getDraftsPreview = unstable_cache(
  _getDraftsPreview,
  ["dashboard-drafts"],
  { revalidate: DASHBOARD_REVALIDATE }
);

async function _getPipelineVelocity() {
  const deals = await prisma.deal.findMany({
    where: { status: "ACTIVE", stage: { not: "DEAL_SOURCE" } },
    select: { stage: true, stageEnteredAt: true },
  });

  const now = Date.now();
  const byStage = new Map<string, { totalMs: number; count: number }>();

  for (const deal of deals) {
    if (!deal.stageEnteredAt) continue;
    const existing = byStage.get(deal.stage) || { totalMs: 0, count: 0 };
    existing.totalMs += now - deal.stageEnteredAt.getTime();
    existing.count += 1;
    byStage.set(deal.stage, existing);
  }

  return DEAL_STAGES
    .filter((s) => s.key !== "DEAL_SOURCE")
    .map((s) => {
      const data = byStage.get(s.key);
      const avgMs = data ? data.totalMs / data.count : 0;
      const avgDays = Math.round((avgMs / (1000 * 60 * 60 * 24)) * 10) / 10;
      return {
        stage: s.key,
        stageLabel: s.label,
        avgDays,
        slaLimitDays: s.slaHours ? Math.round((s.slaHours / 24) * 10) / 10 : null,
        dealCount: data?.count ?? 0,
      };
    });
}

export const getPipelineVelocity = unstable_cache(
  _getPipelineVelocity,
  ["dashboard-velocity"],
  { revalidate: DASHBOARD_REVALIDATE }
);

async function _getDealFlowPulse() {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [thisInflow, lastInflow, thisOutflow, lastOutflow] = await Promise.all([
    prisma.deal.count({
      where: { createdAt: { gte: thisMonthStart } },
    }),
    prisma.deal.count({
      where: { createdAt: { gte: lastMonthStart, lt: thisMonthStart } },
    }),
    prisma.deal.count({
      where: {
        status: { in: ["PASSED", "CLOSED_WON", "CLOSED_LOST"] },
        updatedAt: { gte: thisMonthStart },
      },
    }),
    prisma.deal.count({
      where: {
        status: { in: ["PASSED", "CLOSED_WON", "CLOSED_LOST"] },
        updatedAt: { gte: lastMonthStart, lt: thisMonthStart },
      },
    }),
  ]);

  return {
    thisMonth: { inflow: thisInflow, outflow: thisOutflow, net: thisInflow - thisOutflow },
    lastMonth: { inflow: lastInflow, outflow: lastOutflow, net: lastInflow - lastOutflow },
  };
}

export const getDealFlowPulse = unstable_cache(
  _getDealFlowPulse,
  ["dashboard-flow-pulse"],
  { revalidate: DASHBOARD_REVALIDATE }
);

async function _getCoolingContacts() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const contacts = await prisma.contact.findMany({
    where: {
      warmthScore: "WARM",
      lastInteractionAt: { lt: thirtyDaysAgo },
    },
    select: {
      id: true,
      name: true,
      organization: true,
      lastInteractionAt: true,
    },
    orderBy: { lastInteractionAt: "asc" },
    take: 3,
  });

  return contacts.map((c) => ({
    ...c,
    daysSinceContact: c.lastInteractionAt
      ? Math.floor((Date.now() - c.lastInteractionAt.getTime()) / (1000 * 60 * 60 * 24))
      : null,
  }));
}

export const getCoolingContacts = unstable_cache(
  _getCoolingContacts,
  ["dashboard-cooling-contacts"],
  { revalidate: DASHBOARD_REVALIDATE }
);

async function _getTopReferrers() {
  return prisma.contact.findMany({
    where: { dealSourceCount: { gt: 0 } },
    select: {
      id: true,
      name: true,
      organization: true,
      dealSourceCount: true,
    },
    orderBy: { dealSourceCount: "desc" },
    take: 3,
  });
}

export const getTopReferrers = unstable_cache(
  _getTopReferrers,
  ["dashboard-top-referrers"],
  { revalidate: DASHBOARD_REVALIDATE }
);
