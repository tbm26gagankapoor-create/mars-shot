"use server";

import { prismadb as prisma } from "@/lib/prisma";
import { DEAL_STAGES, STAGE_GATES } from "@/lib/constants";
import { executeStageChangeHooks } from "@/lib/workflows/engine";
import { logAudit } from "@/lib/audit";
import type { DealStage, DealStatus, Sector, FundingStage, SourceType, IngestionChannel } from "@prisma/client";

// ─── Types ──────────────────────────────────────────────

export type CreateDealInput = {
  companyName: string;
  website?: string;
  sector?: Sector;
  fundingStage?: FundingStage;
  chequeSize?: number;
  source?: string;
  sourceType?: SourceType;
  stage?: DealStage;
  status?: DealStatus;
  ingestionChannel?: IngestionChannel;
  rawIngestionText?: string;
  aiConfidence?: number;
  // Screening
  sectorFit?: boolean;
  stageFit?: boolean;
  chequeFit?: boolean;
  razorpayRelevance?: boolean;
  founderBackground?: string;
  // Founders
  founders?: {
    name: string;
    email?: string;
    phone?: string;
    linkedin?: string;
    title?: string;
  }[];
};

export type UpdateDealInput = Partial<CreateDealInput> & {
  callNotes?: string;
  founderEmailConfirmed?: boolean;
  onePagerApproved?: boolean;
  partnerNotified?: boolean;
  ddChecklistStarted?: boolean;
  partnerBriefUploaded?: boolean;
  finalDecisionRecorded?: boolean;
};

// ─── CRUD ───────────────────────────────────────────────

export async function getDeals(filters?: {
  stage?: DealStage;
  status?: DealStatus;
  sector?: Sector;
}) {
  return prisma.deal.findMany({
    where: {
      ...(filters?.stage && { stage: filters.stage }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.sector && { sector: filters.sector }),
    },
    include: {
      founders: true,
      _count: { select: { documents: true, activities: true, aiOutputs: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getDealById(id: string) {
  return prisma.deal.findUnique({
    where: { id },
    include: {
      founders: true,
      documents: { orderBy: { createdAt: "desc" } },
      activities: { orderBy: { createdAt: "desc" }, take: 20 },
      aiOutputs: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function getDealsByStage() {
  const deals = await prisma.deal.findMany({
    where: { status: { in: ["ACTIVE", "DRAFT"] } },
    include: {
      founders: true,
      _count: { select: { documents: true } },
    },
    orderBy: { stageEnteredAt: "asc" },
  });

  // Group by stage
  const grouped: Record<string, typeof deals> = {};
  for (const stage of DEAL_STAGES) {
    grouped[stage.key] = [];
  }
  for (const deal of deals) {
    if (grouped[deal.stage]) {
      grouped[deal.stage].push(deal);
    }
  }
  return grouped;
}

export async function createDeal(input: CreateDealInput) {
  const { founders, ...dealData } = input;

  const stage = dealData.stage || "DEAL_SOURCE";
  const stageEnteredAt = new Date();
  const stageDef = DEAL_STAGES.find((s) => s.key === stage);
  const slaDueAt = stageDef?.slaHours
    ? new Date(stageEnteredAt.getTime() + stageDef.slaHours * 60 * 60 * 1000)
    : null;

  const deal = await prisma.deal.create({
    data: {
      ...dealData,
      stage,
      stageEnteredAt,
      slaDueAt,
      founders: founders?.length
        ? { create: founders }
        : undefined,
    },
    include: { founders: true },
  });

  // Log activity
  await prisma.activity.create({
    data: {
      type: "DEAL_CREATED",
      title: `Deal created: ${deal.companyName}`,
      description: `New deal via ${deal.ingestionChannel}`,
      dealId: deal.id,
    },
  });

  return deal;
}

export async function updateDeal(id: string, input: UpdateDealInput) {
  const { founders, ...dealData } = input;

  const deal = await prisma.deal.update({
    where: { id },
    data: dealData,
    include: { founders: true },
  });

  await logAudit({
    entity: "Deal",
    entityId: id,
    action: "UPDATE",
    changes: dealData as Record<string, unknown>,
  }).catch(console.error);

  return deal;
}

export async function deleteDeal(id: string) {
  await prisma.deal.delete({ where: { id } });
}

// ─── Stage Advancement ─────────────────────────────────

export type GateCheckResult = {
  canAdvance: boolean;
  missingFields: string[];
  nextStage: DealStage | null;
};

export async function checkStageGate(dealId: string): Promise<GateCheckResult> {
  const deal = await prisma.deal.findUnique({
    where: { id: dealId },
    include: { founders: true, documents: true },
  });

  if (!deal) throw new Error("Deal not found");

  const currentIdx = DEAL_STAGES.findIndex((s) => s.key === deal.stage);
  if (currentIdx === DEAL_STAGES.length - 1) {
    return { canAdvance: false, missingFields: [], nextStage: null };
  }

  const nextStage = DEAL_STAGES[currentIdx + 1].key as DealStage;
  const requiredFields = STAGE_GATES[nextStage] || [];
  const missingFields: string[] = [];

  for (const field of requiredFields) {
    switch (field) {
      case "companyName":
        if (!deal.companyName) missingFields.push("Company Name");
        break;
      case "sector":
        if (!deal.sector) missingFields.push("Sector");
        break;
      case "source":
        if (!deal.source) missingFields.push("Source");
        break;
      case "deckUploaded":
        if (deal.documents.length === 0) missingFields.push("Pitch Deck");
        break;
      case "sectorFit":
        if (deal.sectorFit === null) missingFields.push("Sector Fit");
        break;
      case "stageFit":
        if (deal.stageFit === null) missingFields.push("Stage Fit");
        break;
      case "chequeFit":
        if (deal.chequeFit === null) missingFields.push("Cheque Fit");
        break;
      case "callNotes":
        if (!deal.callNotes) missingFields.push("Call Notes");
        break;
      case "founderEmailConfirmed":
        if (!deal.founderEmailConfirmed) missingFields.push("Founder Email Confirmed");
        break;
      case "onePagerApproved":
        if (!deal.onePagerApproved) missingFields.push("One-Pager Approved");
        break;
      case "partnerNotified":
        if (!deal.partnerNotified) missingFields.push("Partner Notified");
        break;
      case "ddChecklistStarted":
        if (!deal.ddChecklistStarted) missingFields.push("DD Checklist Started");
        break;
      case "partnerBriefUploaded":
        if (!deal.partnerBriefUploaded) missingFields.push("Partner Brief Uploaded");
        break;
      case "finalDecisionRecorded":
        if (!deal.finalDecisionRecorded) missingFields.push("Final Decision Recorded");
        break;
      default:
        // Catch-all for any fields mapped by name
        if (!(deal as Record<string, unknown>)[field]) missingFields.push(field);
    }
  }

  return {
    canAdvance: missingFields.length === 0,
    missingFields,
    nextStage,
  };
}

export async function advanceStage(dealId: string): Promise<{
  success: boolean;
  deal?: Awaited<ReturnType<typeof getDealById>>;
  error?: string;
  missingFields?: string[];
}> {
  const gate = await checkStageGate(dealId);

  if (!gate.nextStage) {
    return { success: false, error: "Deal is already at the final stage" };
  }

  if (!gate.canAdvance) {
    return { success: false, error: "Stage gate requirements not met", missingFields: gate.missingFields };
  }

  const stageEnteredAt = new Date();
  const stageDef = DEAL_STAGES.find((s) => s.key === gate.nextStage);
  const slaDueAt = stageDef?.slaHours
    ? new Date(stageEnteredAt.getTime() + stageDef.slaHours * 60 * 60 * 1000)
    : null;

  await prisma.deal.update({
    where: { id: dealId },
    data: {
      stage: gate.nextStage,
      stageEnteredAt,
      slaDueAt,
    },
  });

  // Log activity
  const stageLabel = DEAL_STAGES.find((s) => s.key === gate.nextStage)?.label || gate.nextStage;
  await prisma.activity.create({
    data: {
      type: "STAGE_CHANGE",
      title: `Moved to ${stageLabel}`,
      dealId,
    },
  });

  // If deal reaches DECISION with CLOSED_WON, auto-create portfolio company
  // (handled separately in closeDeal)

  const deal = await getDealById(dealId);
  return { success: true, deal };
}

export async function moveDealToStage(dealId: string, targetStage: DealStage) {
  const currentDeal = await prisma.deal.findUnique({ where: { id: dealId } });
  if (!currentDeal) throw new Error("Deal not found");

  const fromStage = currentDeal.stage;
  const stageEnteredAt = new Date();
  const stageDef = DEAL_STAGES.find((s) => s.key === targetStage);
  const slaDueAt = stageDef?.slaHours
    ? new Date(stageEnteredAt.getTime() + stageDef.slaHours * 60 * 60 * 1000)
    : null;

  const deal = await prisma.deal.update({
    where: { id: dealId },
    data: {
      stage: targetStage,
      stageEnteredAt,
      slaDueAt,
    },
    include: { founders: true },
  });

  const stageLabel = DEAL_STAGES.find((s) => s.key === targetStage)?.label || targetStage;
  await prisma.activity.create({
    data: {
      type: "STAGE_CHANGE",
      title: `Moved to ${stageLabel}`,
      dealId: deal.id,
    },
  });

  // Execute workflow hooks and audit
  await executeStageChangeHooks(dealId, fromStage, targetStage).catch(console.error);
  await logAudit({
    entity: "Deal",
    entityId: dealId,
    action: "STAGE_CHANGE",
    changes: { from: fromStage, to: targetStage },
  }).catch(console.error);

  return deal;
}

// ─── Deal Closure ───────────────────────────────────────

export async function closeDeal(dealId: string, status: "CLOSED_WON" | "CLOSED_LOST" | "PASSED") {
  const deal = await prisma.deal.update({
    where: { id: dealId },
    data: { status },
    include: { founders: true },
  });

  await logAudit({
    entity: "Deal",
    entityId: dealId,
    action: "CLOSE",
    changes: { status },
  }).catch(console.error);

  await prisma.activity.create({
    data: {
      type: "DEAL_CLOSED",
      title: `Deal ${status === "CLOSED_WON" ? "won" : status === "PASSED" ? "passed" : "lost"}: ${deal.companyName}`,
      dealId: deal.id,
    },
  });

  // Auto-create portfolio company on CLOSED_WON
  if (status === "CLOSED_WON") {
    const primaryFounder = deal.founders[0];
    await prisma.portfolioCompany.create({
      data: {
        companyName: deal.companyName,
        sector: deal.sector,
        website: deal.website,
        chequeAmount: deal.chequeSize,
        dateInvested: new Date(),
        fundingStage: deal.fundingStage,
        founderName: primaryFounder?.name,
        founderEmail: primaryFounder?.email,
        founderPhone: primaryFounder?.phone,
        dealId: deal.id,
      },
    });

    await prisma.activity.create({
      data: {
        type: "PORTFOLIO_CREATED",
        title: `${deal.companyName} added to portfolio`,
        dealId: deal.id,
      },
    });
  }

  return deal;
}

// ─── Draft Deals (from ingestion) ───────────────────────

export async function getDraftDeals() {
  return prisma.deal.findMany({
    where: { status: "DRAFT" },
    include: { founders: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function approveDraft(dealId: string) {
  const deal = await prisma.deal.update({
    where: { id: dealId },
    data: { status: "ACTIVE" },
    include: { founders: true },
  });

  await prisma.activity.create({
    data: {
      type: "DRAFT_APPROVED",
      title: `Draft approved: ${deal.companyName}`,
      dealId: deal.id,
    },
  });

  return deal;
}

// ─── SLA Queries ────────────────────────────────────────

export async function getBreachedDeals() {
  return prisma.deal.findMany({
    where: {
      status: "ACTIVE",
      slaDueAt: { lt: new Date() },
    },
    include: { founders: true },
    orderBy: { slaDueAt: "asc" },
  });
}

export async function getDealsNearingSla(hoursThreshold = 12) {
  const threshold = new Date(Date.now() + hoursThreshold * 60 * 60 * 1000);
  return prisma.deal.findMany({
    where: {
      status: "ACTIVE",
      slaDueAt: { gt: new Date(), lt: threshold },
    },
    include: { founders: true },
    orderBy: { slaDueAt: "asc" },
  });
}
