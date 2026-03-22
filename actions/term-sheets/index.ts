"use server";

import { prismadb as prisma } from "@/lib/prisma";
import type { TermSheetStatus } from "@prisma/client";

// ─── Types ──────────────────────────────────────────────

export type CreateTermSheetInput = {
  dealId: string;
  valuation?: number;
  chequeSize?: number;
  equityPercent?: number;
  investorRights?: string;
  boardSeat?: boolean;
  proRataRights?: boolean;
  liquidationPref?: string;
  otherTerms?: string;
  expiresAt?: Date;
};

export type UpdateTermSheetInput = Partial<
  Omit<CreateTermSheetInput, "dealId">
>;

// ─── CRUD ───────────────────────────────────────────────

export async function getTermSheets(filters?: {
  status?: TermSheetStatus;
}) {
  return prisma.termSheet.findMany({
    where: {
      ...(filters?.status && { status: filters.status }),
    },
    include: {
      deal: { select: { id: true, companyName: true, stage: true } },
      _count: { select: { documents: true, revisions: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getTermSheetById(id: string) {
  return prisma.termSheet.findUnique({
    where: { id },
    include: {
      deal: {
        select: { id: true, companyName: true, stage: true, chequeSize: true },
        include: { founders: true },
      },
      documents: { orderBy: { createdAt: "desc" } },
      revisions: { orderBy: { versionNumber: "desc" } },
    },
  });
}

export async function getTermSheetByDealId(dealId: string) {
  return prisma.termSheet.findUnique({
    where: { dealId },
    include: {
      deal: { select: { id: true, companyName: true } },
      revisions: { orderBy: { versionNumber: "desc" }, take: 5 },
    },
  });
}

export async function createTermSheet(input: CreateTermSheetInput) {
  // Check no existing term sheet for this deal
  const existing = await prisma.termSheet.findUnique({
    where: { dealId: input.dealId },
  });
  if (existing) {
    throw new Error("A term sheet already exists for this deal");
  }

  return prisma.termSheet.create({
    data: {
      dealId: input.dealId,
      valuation: input.valuation,
      chequeSize: input.chequeSize,
      equityPercent: input.equityPercent,
      investorRights: input.investorRights,
      boardSeat: input.boardSeat || false,
      proRataRights: input.proRataRights || false,
      liquidationPref: input.liquidationPref,
      otherTerms: input.otherTerms,
      expiresAt: input.expiresAt,
    },
    include: { deal: { select: { id: true, companyName: true } } },
  });
}

export async function updateTermSheet(
  id: string,
  input: UpdateTermSheetInput
) {
  const current = await prisma.termSheet.findUnique({ where: { id } });
  if (!current) throw new Error("Term sheet not found");

  // Auto-create revision with the changes
  const changes: Record<string, { from: unknown; to: unknown }> = {};
  for (const [key, value] of Object.entries(input)) {
    const currentVal = (current as Record<string, unknown>)[key];
    if (currentVal !== value) {
      changes[key] = { from: currentVal, to: value };
    }
  }

  const [termSheet] = await prisma.$transaction([
    prisma.termSheet.update({
      where: { id },
      data: {
        ...input,
        version: { increment: 1 },
      },
    }),
    prisma.termSheetRevision.create({
      data: {
        termSheetId: id,
        versionNumber: current.version + 1,
        changes: JSON.parse(JSON.stringify(changes)),
        note: `Updated fields: ${Object.keys(changes).join(", ")}`,
      },
    }),
  ]);

  return termSheet;
}

export async function deleteTermSheet(id: string) {
  await prisma.termSheet.delete({ where: { id } });
}

// ─── Status Transitions ─────────────────────────────────

export async function sendTermSheet(id: string) {
  return prisma.termSheet.update({
    where: { id },
    data: {
      status: "SENT",
      sentAt: new Date(),
    },
  });
}

export async function signTermSheet(id: string) {
  return prisma.termSheet.update({
    where: { id },
    data: {
      status: "SIGNED",
      signedAt: new Date(),
    },
  });
}

export async function expireTermSheet(id: string) {
  return prisma.termSheet.update({
    where: { id },
    data: { status: "EXPIRED" },
  });
}

// ─── Deals without Term Sheets ──────────────────────────

export async function getDealsWithoutTermSheet() {
  return prisma.deal.findMany({
    where: {
      status: "ACTIVE",
      termSheet: null,
      stage: { in: ["ACTIVE_DD", "PARTNER_REVIEW", "DECISION"] },
    },
    select: { id: true, companyName: true, stage: true, chequeSize: true },
    orderBy: { updatedAt: "desc" },
  });
}
