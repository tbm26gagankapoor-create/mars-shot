"use server";

import { prismadb as prisma } from "@/lib/prisma";

// ─── Pipeline Velocity ──────────────────────────────────

export async function getPipelineVelocity() {
  // Average time (days) deals spend in each stage
  const deals = await prisma.deal.findMany({
    where: { status: { in: ["ACTIVE", "CLOSED_WON", "CLOSED_LOST"] } },
    select: {
      stage: true,
      stageEnteredAt: true,
      updatedAt: true,
    },
  });

  const stageMap: Record<string, { totalDays: number; count: number }> = {};
  for (const deal of deals) {
    const days =
      (deal.updatedAt.getTime() - deal.stageEnteredAt.getTime()) /
      (1000 * 60 * 60 * 24);
    if (!stageMap[deal.stage]) stageMap[deal.stage] = { totalDays: 0, count: 0 };
    stageMap[deal.stage].totalDays += days;
    stageMap[deal.stage].count += 1;
  }

  return Object.entries(stageMap).map(([stage, data]) => ({
    stage,
    avgDays: Math.round((data.totalDays / data.count) * 10) / 10,
    dealCount: data.count,
  }));
}

// ─── Conversion Rates ───────────────────────────────────

export async function getConversionRates() {
  const stages = [
    "DEAL_SOURCE",
    "RADAR",
    "SCREENING",
    "INTRO_CALL",
    "PARTNER_GUT_CHECK",
    "ACTIVE_DD",
    "PARTNER_REVIEW",
    "DECISION",
  ];

  const counts = await Promise.all(
    stages.map(async (stage) => {
      const count = await prisma.deal.count({
        where: {
          OR: [
            { stage: stage as never },
            // Count deals that passed through this stage (simplified)
          ],
        },
      });
      return { stage, count };
    })
  );

  return counts.map((c, i) => ({
    stage: c.stage,
    count: c.count,
    conversionRate:
      i === 0 ? 100 : counts[0].count > 0
        ? Math.round((c.count / counts[0].count) * 100)
        : 0,
  }));
}

// ─── Source Attribution ─────────────────────────────────

export async function getSourceAttribution() {
  const sources = await prisma.deal.groupBy({
    by: ["sourceType"],
    _count: { id: true },
    where: { sourceType: { not: null } },
  });

  const wonBySource = await prisma.deal.groupBy({
    by: ["sourceType"],
    _count: { id: true },
    where: { status: "CLOSED_WON", sourceType: { not: null } },
  });

  const wonMap = new Map(wonBySource.map((s) => [s.sourceType, s._count.id]));

  return sources.map((s) => ({
    sourceType: s.sourceType || "UNKNOWN",
    totalDeals: s._count.id,
    wonDeals: wonMap.get(s.sourceType) || 0,
    winRate:
      s._count.id > 0
        ? Math.round(((wonMap.get(s.sourceType) || 0) / s._count.id) * 100)
        : 0,
  }));
}

// ─── Portfolio Metrics ──────────────────────────────────

export async function getPortfolioMetrics() {
  const [totalCompanies, totalInvested, followOnCount] = await Promise.all([
    prisma.portfolioCompany.count(),
    prisma.portfolioCompany.aggregate({ _sum: { chequeAmount: true } }),
    prisma.followOnRound.count({ where: { marsShotParticipated: true } }),
  ]);

  const sectors = await prisma.portfolioCompany.groupBy({
    by: ["sector"],
    _count: { id: true },
    where: { sector: { not: null } },
  });

  return {
    totalCompanies,
    totalInvested: totalInvested._sum.chequeAmount || 0,
    followOnCount,
    sectorBreakdown: sectors.map((s) => ({
      sector: s.sector || "OTHER",
      count: s._count.id,
    })),
  };
}

// ─── Ecosystem Health ───────────────────────────────────

export async function getEcosystemHealth() {
  const warmthDistribution = await prisma.contact.groupBy({
    by: ["warmthScore"],
    _count: { id: true },
  });

  const typeDistribution = await prisma.contact.groupBy({
    by: ["type"],
    _count: { id: true },
  });

  const totalContacts = await prisma.contact.count();
  const staleContacts = await prisma.contact.count({
    where: {
      lastInteractionAt: {
        lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days
      },
    },
  });

  return {
    totalContacts,
    staleContacts,
    warmthDistribution: warmthDistribution.map((w) => ({
      warmth: w.warmthScore,
      count: w._count.id,
    })),
    typeDistribution: typeDistribution.map((t) => ({
      type: t.type,
      count: t._count.id,
    })),
  };
}

// ─── Deal Funnel ────────────────────────────────────────

export async function getDealFunnel(dateRange?: {
  start: Date;
  end: Date;
}) {
  const where = dateRange
    ? { createdAt: { gte: dateRange.start, lte: dateRange.end } }
    : {};

  const stages = [
    "DEAL_SOURCE",
    "RADAR",
    "SCREENING",
    "INTRO_CALL",
    "PARTNER_GUT_CHECK",
    "ACTIVE_DD",
    "PARTNER_REVIEW",
    "DECISION",
  ];

  const counts = await Promise.all(
    stages.map(async (stage) => ({
      stage,
      count: await prisma.deal.count({
        where: { ...where, stage: stage as never },
      }),
    }))
  );

  return counts;
}

// ─── Dashboard Summary ──────────────────────────────────

export async function getDashboardStats() {
  const [
    activeDeals,
    draftDeals,
    portfolioCount,
    contactCount,
    breachedSla,
  ] = await Promise.all([
    prisma.deal.count({ where: { status: "ACTIVE" } }),
    prisma.deal.count({ where: { status: "DRAFT" } }),
    prisma.portfolioCompany.count(),
    prisma.contact.count(),
    prisma.deal.count({
      where: { status: "ACTIVE", slaDueAt: { lt: new Date() } },
    }),
  ]);

  return { activeDeals, draftDeals, portfolioCount, contactCount, breachedSla };
}
