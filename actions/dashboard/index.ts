"use server";

import { prismadb as prisma } from "@/lib/prisma";

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
