import { NextRequest, NextResponse } from "next/server";
import { prismadb } from "@/lib/prisma";
import type {
  IngestionChannel,
  Sector,
  FundingStage,
  RevenueType,
  BusinessModel,
} from "@prisma/client";
import { DEAL_STAGES } from "@/lib/constants";

// ─── Validation helpers ──────────────────────────────

const VALID_CHANNELS: IngestionChannel[] = [
  "EMAIL",
  "WHATSAPP",
  "TELEGRAM",
  "WEB",
];

const VALID_SECTORS: Sector[] = [
  "SAAS",
  "FINTECH",
  "D2C",
  "CONSUMER",
  "AI",
  "HEALTHTECH",
  "OTHER",
];

const VALID_FUNDING_STAGES: FundingStage[] = [
  "PRE_SEED",
  "SEED",
  "SERIES_A",
  "OTHER",
];

const VALID_REVENUE_TYPES: RevenueType[] = ["MRR", "ARR", "GMV", "NONE"];

const VALID_BUSINESS_MODELS: BusinessModel[] = [
  "SAAS",
  "MARKETPLACE",
  "TRANSACTIONAL",
  "D2C_ECOMMERCE",
  "ADVERTISING",
  "OTHER",
];

type IngestBody = {
  channel: string;
  rawText: string;
  senderName?: string;
  senderEmail?: string;
  companyName?: string;
  website?: string;
  sector?: string;
  fundingStage?: string;
  description?: string;
  revenue?: number;
  revenueType?: string;
  totalRoundSize?: number;
  location?: string;
  teamSize?: number;
  businessModel?: string;
  tags?: string[];
};

/**
 * POST /api/ingest
 *
 * Multi-channel deal ingestion webhook.
 * Accepts deal submissions from EMAIL, WHATSAPP, TELEGRAM, or WEB
 * and creates a DRAFT deal at the DEAL_SOURCE stage.
 */
export async function POST(req: NextRequest) {
  try {
    const body: IngestBody = await req.json();

    // ── Required field validation ──────────────────────
    const errors: string[] = [];

    if (!body.channel || typeof body.channel !== "string") {
      errors.push("channel is required");
    } else if (
      !VALID_CHANNELS.includes(body.channel as IngestionChannel)
    ) {
      errors.push(
        `channel must be one of: ${VALID_CHANNELS.join(", ")}`
      );
    }

    if (!body.rawText || typeof body.rawText !== "string") {
      errors.push("rawText is required");
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join("; ") }, { status: 400 });
    }

    // ── Optional field validation ──────────────────────
    if (body.sector && !VALID_SECTORS.includes(body.sector as Sector)) {
      return NextResponse.json(
        { error: `sector must be one of: ${VALID_SECTORS.join(", ")}` },
        { status: 400 }
      );
    }

    if (
      body.fundingStage &&
      !VALID_FUNDING_STAGES.includes(body.fundingStage as FundingStage)
    ) {
      return NextResponse.json(
        {
          error: `fundingStage must be one of: ${VALID_FUNDING_STAGES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    if (
      body.revenueType &&
      !VALID_REVENUE_TYPES.includes(body.revenueType as RevenueType)
    ) {
      return NextResponse.json(
        { error: `revenueType must be one of: ${VALID_REVENUE_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    if (
      body.businessModel &&
      !VALID_BUSINESS_MODELS.includes(body.businessModel as BusinessModel)
    ) {
      return NextResponse.json(
        { error: `businessModel must be one of: ${VALID_BUSINESS_MODELS.join(", ")}` },
        { status: 400 }
      );
    }

    // ── Compute SLA deadline ───────────────────────────
    const stageEnteredAt = new Date();
    const stageDef = DEAL_STAGES.find((s) => s.key === "DEAL_SOURCE");
    const slaDueAt = stageDef?.slaHours
      ? new Date(
          stageEnteredAt.getTime() + stageDef.slaHours * 60 * 60 * 1000
        )
      : null;

    // ── Create the DRAFT deal ──────────────────────────
    const deal = await prismadb.deal.create({
      data: {
        companyName: body.companyName || "Unknown (Ingested)",
        website: body.website || undefined,
        sector: body.sector
          ? (body.sector as Sector)
          : undefined,
        fundingStage: body.fundingStage
          ? (body.fundingStage as FundingStage)
          : undefined,
        source: body.senderName || "Webhook Ingest",
        sourceType: "INBOUND",
        stage: "DEAL_SOURCE",
        status: "DRAFT",
        ingestionChannel: body.channel as IngestionChannel,
        rawIngestionText: body.rawText,
        stageEnteredAt,
        slaDueAt,
        description: body.description || undefined,
        revenue: body.revenue || undefined,
        revenueType: body.revenueType
          ? (body.revenueType as RevenueType)
          : undefined,
        totalRoundSize: body.totalRoundSize || undefined,
        location: body.location || undefined,
        teamSize: body.teamSize || undefined,
        businessModel: body.businessModel
          ? (body.businessModel as BusinessModel)
          : undefined,
        tags: body.tags || undefined,
      },
    });

    // ── Log ingestion activity ─────────────────────────
    await prismadb.activity.create({
      data: {
        type: "DEAL_INGESTED",
        title: `Deal ingested via ${body.channel}: ${deal.companyName}`,
        description: body.senderEmail
          ? `Submitted by ${body.senderName || "unknown"} (${body.senderEmail})`
          : `Submitted by ${body.senderName || "Webhook Ingest"}`,
        dealId: deal.id,
        metadata: {
          channel: body.channel,
          senderName: body.senderName ?? null,
          senderEmail: body.senderEmail ?? null,
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        dealId: deal.id,
        message: `Deal "${deal.companyName}" created as DRAFT at DEAL_SOURCE stage`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[INGEST]", error);
    return NextResponse.json(
      { error: "Ingestion failed" },
      { status: 500 }
    );
  }
}
