"use server";

import { prismadb as prisma } from "@/lib/prisma";
import type { Sector, FundingStage } from "@prisma/client";

export async function getPortfolioCompanies() {
  return prisma.portfolioCompany.findMany({
    include: {
      followOnRounds: { orderBy: { date: "desc" } },
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
    },
  });
}

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

export async function addBoardNote(
  portfolioCompanyId: string,
  data: { title: string; content: string; date?: Date }
) {
  return prisma.boardNote.create({
    data: { ...data, portfolioCompanyId },
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
