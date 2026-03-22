// Mars Shot VC CRM — Pipeline & Configuration Constants

export const DEAL_STAGES = [
  { key: "DEAL_SOURCE", label: "Deal Source", order: 1, slaHours: null },
  { key: "RADAR", label: "Radar — Log & Capture", order: 2, slaHours: 24 },
  { key: "SCREENING", label: "Screening", order: 3, slaHours: 48 },
  { key: "INTRO_CALL", label: "Intro Call", order: 4, slaHours: 120 }, // 5 days
  { key: "PARTNER_GUT_CHECK", label: "Partner Gut-Check", order: 5, slaHours: 72 }, // 3 days
  { key: "ACTIVE_DD", label: "Active DD", order: 6, slaHours: 336 }, // 14 days
  { key: "PARTNER_REVIEW", label: "Partner Review", order: 7, slaHours: 168 }, // 7 days
  { key: "DECISION", label: "Decision", order: 8, slaHours: 48 },
] as const;

export type DealStageKey = (typeof DEAL_STAGES)[number]["key"];

export const DEAL_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "ON_HOLD",
  "PASSED",
  "CLOSED_WON",
  "CLOSED_LOST",
] as const;

export type DealStatusKey = (typeof DEAL_STATUSES)[number];

export const SECTORS = [
  { key: "SAAS", label: "SaaS" },
  { key: "FINTECH", label: "Fintech" },
  { key: "D2C", label: "D2C" },
  { key: "CONSUMER", label: "Consumer" },
  { key: "AI", label: "AI" },
  { key: "HEALTHTECH", label: "Healthtech" },
  { key: "OTHER", label: "Other" },
] as const;

export const FUNDING_STAGES = [
  { key: "PRE_SEED", label: "Pre-Seed" },
  { key: "SEED", label: "Seed" },
  { key: "SERIES_A", label: "Series A" },
  { key: "OTHER", label: "Other" },
] as const;

export const CONTACT_TYPES = [
  { key: "VC", label: "VC" },
  { key: "CO_INVESTOR", label: "Co-Investor" },
  { key: "OPERATOR", label: "Operator" },
  { key: "FOUNDER", label: "Founder" },
  { key: "ADVISOR", label: "Advisor" },
] as const;

export const WARMTH_SCORES = [
  { key: "HOT", value: 3, label: "Hot", color: "text-green-500" },
  { key: "WARM", value: 2, label: "Warm", color: "text-yellow-500" },
  { key: "COLD", value: 1, label: "Cold", color: "text-red-500" },
] as const;

export const DOCUMENT_TYPES = [
  "PITCH_DECK",
  "ONE_PAGER",
  "DD_MATERIAL",
  "PARTNER_BRIEF",
  "TERM_SHEET",
  "OTHER",
] as const;

export const AI_OUTPUT_TYPES = [
  "DEAL_EXTRACTION",
  "ONE_PAGER",
  "EMAIL_DRAFT",
  "PARTNER_BRIEF",
  "SCREENING_SUMMARY",
] as const;

export const INGESTION_CHANNELS = [
  { key: "WEB", label: "Web App", icon: "Globe" },
  { key: "EMAIL", label: "Email Forward", icon: "Mail" },
  { key: "WHATSAPP", label: "WhatsApp", icon: "MessageCircle" },
  { key: "TELEGRAM", label: "Telegram", icon: "Send" },
  { key: "MOBILE_PWA", label: "Mobile App", icon: "Smartphone" },
] as const;

// Stage gate requirements — fields that must be filled before advancing
export const STAGE_GATES: Record<string, string[]> = {
  RADAR: ["companyName", "sector", "source"],
  SCREENING: ["deckUploaded", "sectorFit", "stageFit", "chequeFit"],
  INTRO_CALL: ["callNotes", "founderEmailConfirmed"],
  PARTNER_GUT_CHECK: ["onePagerApproved", "partnerNotified"],
  ACTIVE_DD: ["ddChecklistStarted"],
  PARTNER_REVIEW: ["partnerBriefUploaded"],
  DECISION: ["finalDecisionRecorded"],
};

// Cheque range for Mars Shot
export const CHEQUE_RANGE = { min: 25_000, max: 100_000 } as const;

// SLA color thresholds
export function getSlaStatus(percentRemaining: number): "green" | "yellow" | "red" | "breached" {
  if (percentRemaining <= 0) return "breached";
  if (percentRemaining < 25) return "red";
  if (percentRemaining < 50) return "yellow";
  return "green";
}

export function computeSlaPercent(stageEnteredAt: Date, slaDueAt: Date): number {
  const now = new Date();
  const total = slaDueAt.getTime() - stageEnteredAt.getTime();
  if (total <= 0) return 0;
  const remaining = slaDueAt.getTime() - now.getTime();
  return Math.max(0, Math.min(100, (remaining / total) * 100));
}

// ─── Quick-lookup label maps ────────────────────────────

export const SECTOR_LABELS: Record<string, string> = Object.fromEntries(
  SECTORS.map((s) => [s.key, s.label])
);

export const FUNDING_STAGE_LABELS: Record<string, string> = Object.fromEntries(
  FUNDING_STAGES.map((s) => [s.key, s.label])
);

export const SOURCE_TYPE_LABELS: Record<string, string> = {
  INBOUND: "Inbound",
  VC_FORWARD: "VC Forward",
  COLD_DM: "Cold DM",
  RAZORPAY_NETWORK: "Razorpay Network",
  EMAIL_FORWARD: "Email Forward",
  OTHER: "Other",
};

export const INGESTION_CHANNEL_ICONS: Record<string, string> = Object.fromEntries(
  INGESTION_CHANNELS.map((c) => [c.key, c.icon])
);

export const STAGE_LABEL_MAP: Record<string, string> = Object.fromEntries(
  DEAL_STAGES.map((s) => [s.key, s.label])
);
