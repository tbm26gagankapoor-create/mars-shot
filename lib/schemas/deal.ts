import { z } from "zod";

// ─── Enum values (mirrored from Prisma / constants) ────

const sectorEnum = z.enum(["SAAS", "FINTECH", "D2C", "CONSUMER", "AI", "HEALTHTECH", "OTHER"]);
const fundingStageEnum = z.enum(["PRE_SEED", "SEED", "SERIES_A", "OTHER"]);
const sourceTypeEnum = z.enum([
  "INBOUND",
  "VC_FORWARD",
  "COLD_DM",
  "RAZORPAY_NETWORK",
  "EMAIL_FORWARD",
  "OTHER",
]);
const ingestionChannelEnum = z.enum(["WEB", "EMAIL", "WHATSAPP", "TELEGRAM", "MOBILE_PWA"]);
const dealStatusEnum = z.enum(["DRAFT", "ACTIVE", "ON_HOLD", "PASSED", "CLOSED_WON", "CLOSED_LOST"]);
const dealStageEnum = z.enum([
  "DEAL_SOURCE",
  "RADAR",
  "SCREENING",
  "INTRO_CALL",
  "PARTNER_GUT_CHECK",
  "ACTIVE_DD",
  "PARTNER_REVIEW",
  "DECISION",
]);

// ─── Shared pieces ─────────────────────────────────────

const founderSchema = z.object({
  name: z.string().min(1, "Founder name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  linkedin: z.string().optional().or(z.literal("")),
  title: z.string().optional().or(z.literal("")),
});

export type FounderFormData = z.infer<typeof founderSchema>;

// ─── Quick Add schema ──────────────────────────────────

export const quickAddDealSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  source: z.string().optional(),
  sector: sectorEnum.optional(),
  notes: z.string().optional(),
});

export type QuickAddDealData = z.infer<typeof quickAddDealSchema>;

// ─── Full Deal schema ──────────────────────────────────

export const fullDealSchema = z.object({
  // Company info
  companyName: z.string().min(1, "Company name is required"),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  sector: sectorEnum.optional(),
  fundingStage: fundingStageEnum.optional(),
  chequeSize: z.coerce.number().positive("Must be positive").optional(),
  source: z.string().optional(),
  sourceType: sourceTypeEnum.optional(),
  // Pipeline
  stage: dealStageEnum.optional(),
  status: dealStatusEnum.optional(),
  ingestionChannel: ingestionChannelEnum.optional(),
  rawIngestionText: z.string().optional(),
  aiConfidence: z.coerce.number().min(0).max(100).optional(),
  // Screening
  sectorFit: z.boolean().optional(),
  stageFit: z.boolean().optional(),
  chequeFit: z.boolean().optional(),
  razorpayRelevance: z.boolean().optional(),
  founderBackground: z.string().optional(),
  // Founders
  founders: z.array(founderSchema).optional(),
});

export type FullDealData = z.infer<typeof fullDealSchema>;

// ─── URL Import schema ─────────────────────────────────

export const urlImportSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
});

export type UrlImportData = z.infer<typeof urlImportSchema>;

// Re-export enums for reuse
export {
  sectorEnum,
  fundingStageEnum,
  sourceTypeEnum,
  ingestionChannelEnum,
  dealStatusEnum,
  dealStageEnum,
  founderSchema,
};
