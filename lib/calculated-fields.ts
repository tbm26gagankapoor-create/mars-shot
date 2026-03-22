import { prismadb as prisma } from "@/lib/prisma";

// ─── Deal Scoring ───────────────────────────────────────

export type DealScore = {
  total: number; // 0-100
  factors: {
    sectorFit: number;
    stageFit: number;
    chequeFit: number;
    razorpayRelevance: number;
    founderStrength: number;
    velocity: number;
  };
};

export async function calculateDealScore(dealId: string): Promise<DealScore> {
  const deal = await prisma.deal.findUnique({
    where: { id: dealId },
    include: { founders: true, documents: true },
  });

  if (!deal) throw new Error("Deal not found");

  const factors = {
    sectorFit: deal.sectorFit ? 20 : 0,
    stageFit: deal.stageFit ? 20 : 0,
    chequeFit: deal.chequeFit ? 15 : 0,
    razorpayRelevance: deal.razorpayRelevance ? 15 : 0,
    founderStrength: deal.founderBackground ? 15 : deal.founders.length > 0 ? 8 : 0,
    velocity: calculateVelocityScore(deal.stageEnteredAt, deal.createdAt),
  };

  return {
    total: Object.values(factors).reduce((sum, v) => sum + v, 0),
    factors,
  };
}

function calculateVelocityScore(stageEnteredAt: Date, createdAt: Date): number {
  const daysInPipeline =
    (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  // Faster deals score higher (max 15 points)
  if (daysInPipeline < 7) return 15;
  if (daysInPipeline < 14) return 12;
  if (daysInPipeline < 30) return 8;
  if (daysInPipeline < 60) return 4;
  return 0;
}

// ─── MOIC Calculation ───────────────────────────────────

export async function calculateMOIC(portfolioCompanyId: string) {
  const company = await prisma.portfolioCompany.findUnique({
    where: { id: portfolioCompanyId },
    include: { followOnRounds: { orderBy: { date: "desc" } } },
  });

  if (!company || !company.chequeAmount) return null;

  const latestRound = company.followOnRounds[0];
  if (!latestRound?.amount) return null;

  // Simplified MOIC: latest round valuation / initial investment
  // In reality this needs cap table data
  return {
    initialInvestment: company.chequeAmount,
    latestValuation: latestRound.amount,
    moic: Math.round((latestRound.amount / company.chequeAmount) * 100) / 100,
  };
}

// ─── Warmth Decay ───────────────────────────────────────

export async function decayContactWarmth() {
  const now = new Date();

  // Contacts not interacted with in 30+ days: HOT → WARM
  await prisma.contact.updateMany({
    where: {
      warmthScore: "HOT",
      lastInteractionAt: {
        lt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      },
    },
    data: { warmthScore: "WARM" },
  });

  // Contacts not interacted with in 90+ days: WARM → COLD
  await prisma.contact.updateMany({
    where: {
      warmthScore: "WARM",
      lastInteractionAt: {
        lt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      },
    },
    data: { warmthScore: "COLD" },
  });
}
