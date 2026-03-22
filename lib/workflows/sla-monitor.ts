import { prismadb as prisma } from "@/lib/prisma";

export type SlaBreachResult = {
  breachedDeals: {
    id: string;
    companyName: string;
    stage: string;
    slaDueAt: Date;
    hoursOverdue: number;
  }[];
  nearingDeals: {
    id: string;
    companyName: string;
    stage: string;
    slaDueAt: Date;
    hoursRemaining: number;
  }[];
};

/**
 * Check all active deals for SLA breaches and near-breaches.
 * Called by /api/cron/sla-check
 */
export async function checkSlaBreaches(
  nearingThresholdHours = 12
): Promise<SlaBreachResult> {
  const now = new Date();
  const threshold = new Date(
    now.getTime() + nearingThresholdHours * 60 * 60 * 1000
  );

  const [breached, nearing] = await Promise.all([
    prisma.deal.findMany({
      where: {
        status: "ACTIVE",
        slaDueAt: { lt: now, not: null },
      },
      select: {
        id: true,
        companyName: true,
        stage: true,
        slaDueAt: true,
      },
      orderBy: { slaDueAt: "asc" },
    }),
    prisma.deal.findMany({
      where: {
        status: "ACTIVE",
        slaDueAt: { gte: now, lte: threshold },
      },
      select: {
        id: true,
        companyName: true,
        stage: true,
        slaDueAt: true,
      },
      orderBy: { slaDueAt: "asc" },
    }),
  ]);

  return {
    breachedDeals: breached.map((d) => ({
      ...d,
      slaDueAt: d.slaDueAt!,
      hoursOverdue:
        Math.round(
          ((now.getTime() - d.slaDueAt!.getTime()) / (1000 * 60 * 60)) * 10
        ) / 10,
    })),
    nearingDeals: nearing.map((d) => ({
      ...d,
      slaDueAt: d.slaDueAt!,
      hoursRemaining:
        Math.round(
          ((d.slaDueAt!.getTime() - now.getTime()) / (1000 * 60 * 60)) * 10
        ) / 10,
    })),
  };
}

/**
 * Flag breached deals with an activity log entry
 */
export async function flagBreachedDeals() {
  const result = await checkSlaBreaches();

  for (const deal of result.breachedDeals) {
    // Check if already flagged today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await prisma.activity.findFirst({
      where: {
        dealId: deal.id,
        type: "SLA_BREACH",
        createdAt: { gte: today },
      },
    });

    if (!existing) {
      await prisma.activity.create({
        data: {
          type: "SLA_BREACH",
          title: `SLA breached: ${deal.companyName} (${deal.stage})`,
          description: `${deal.hoursOverdue}h overdue`,
          dealId: deal.id,
        },
      });
    }
  }

  return result;
}
