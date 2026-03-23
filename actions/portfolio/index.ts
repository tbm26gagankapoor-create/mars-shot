"use server";

import { prismadb as prisma } from "@/lib/prisma";
import type { Sector, FundingStage, CompanyHealthStatus } from "@prisma/client";

// ─── Read operations ────────────────────────────────────

export async function getPortfolioCompanies() {
  return prisma.portfolioCompany.findMany({
    include: {
      followOnRounds: { orderBy: { date: "desc" } },
      kpiSnapshots: { orderBy: { periodDate: "desc" }, take: 1 },
      _count: { select: { boardNotes: true, activities: true } },
    },
    orderBy: { dateInvested: "desc" },
  });
}

export async function getPortfolioCompanyById(id: string) {
  return prisma.portfolioCompany.findUnique({
    where: { id },
    include: {
      followOnRounds: { orderBy: { date: "desc" } },
      boardNotes: { orderBy: { date: "desc" } },
      activities: { orderBy: { createdAt: "desc" }, take: 20 },
      deal: true,
      documents: { orderBy: { createdAt: "desc" } },
      calendarEvents: {
        where: { startAt: { gte: new Date() } },
        orderBy: { startAt: "asc" },
        take: 5,
      },
      kpiSnapshots: { orderBy: { periodDate: "desc" }, take: 12 },
    },
  });
}

export async function getQuietPortfolioCompanies(daysSilent = 90) {
  const cutoff = new Date(Date.now() - daysSilent * 24 * 60 * 60 * 1000);
  return prisma.portfolioCompany.findMany({
    where: {
      activities: { none: { createdAt: { gt: cutoff } } },
    },
    orderBy: { updatedAt: "asc" },
  });
}

// ─── Update operations ──────────────────────────────────

export async function updatePortfolioCompany(
  id: string,
  data: {
    companyName?: string;
    sector?: Sector;
    website?: string;
    chequeAmount?: number;
    fundingStage?: FundingStage;
    founderName?: string;
    founderEmail?: string;
    founderPhone?: string;
  }
) {
  return prisma.portfolioCompany.update({ where: { id }, data });
}

export async function updatePortfolioInvestment(
  id: string,
  data: {
    entryValuation?: number;
    ownershipPct?: number;
    currentValuation?: number;
    proRataRights?: boolean;
    boardSeat?: boolean;
    healthStatus?: CompanyHealthStatus;
    nextMilestone?: string;
    coInvestors?: string[];
  }
) {
  const company = await prisma.portfolioCompany.update({
    where: { id },
    data,
  });

  await prisma.activity.create({
    data: {
      type: "INVESTMENT_UPDATE",
      title: "Investment details updated",
      portfolioCompanyId: id,
    },
  });

  return company;
}

// ─── Follow-on rounds ───────────────────────────────────

export async function addFollowOnRound(
  portfolioCompanyId: string,
  data: {
    roundName: string;
    amount?: number;
    leadInvestor?: string;
    marsShotParticipated?: boolean;
    date?: Date;
  }
) {
  const round = await prisma.followOnRound.create({
    data: { ...data, portfolioCompanyId },
  });

  await prisma.activity.create({
    data: {
      type: "FOLLOW_ON_ROUND",
      title: `Follow-on: ${data.roundName}`,
      description: data.leadInvestor ? `Led by ${data.leadInvestor}` : undefined,
      portfolioCompanyId,
    },
  });

  return round;
}

// ─── Board notes ────────────────────────────────────────

export async function addBoardNote(
  portfolioCompanyId: string,
  data: { title: string; content: string; date?: Date }
) {
  return prisma.boardNote.create({
    data: { ...data, portfolioCompanyId },
  });
}

// ─── KPI snapshots ──────────────────────────────────────

export async function upsertKpiSnapshot(
  portfolioCompanyId: string,
  data: {
    periodDate: Date;
    arr?: number;
    mrr?: number;
    burnRate?: number;
    runway?: number;
    headcount?: number;
    customers?: number;
    notes?: string;
  }
) {
  const snapshot = await prisma.kpiSnapshot.upsert({
    where: {
      portfolioCompanyId_periodDate: {
        portfolioCompanyId,
        periodDate: data.periodDate,
      },
    },
    update: data,
    create: { ...data, portfolioCompanyId },
  });

  const monthLabel = data.periodDate.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  await prisma.activity.create({
    data: {
      type: "KPI_UPDATE",
      title: `KPI snapshot for ${monthLabel}`,
      portfolioCompanyId,
    },
  });

  return snapshot;
}

export async function deleteKpiSnapshot(snapshotId: string) {
  return prisma.kpiSnapshot.delete({ where: { id: snapshotId } });
}

// ─── Manual activity logging ────────────────────────────

export async function addManualActivity(
  portfolioCompanyId: string,
  data: { title: string; type: string; description?: string }
) {
  return prisma.activity.create({
    data: {
      type: data.type,
      title: data.title,
      description: data.description || undefined,
      portfolioCompanyId,
    },
  });
}
