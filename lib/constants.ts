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

export const PASS_REASON_CATEGORIES = [
  { key: "SECTOR_MISMATCH", label: "Sector Mismatch" },
  { key: "STAGE_TOO_LATE", label: "Stage Too Late" },
  { key: "WEAK_TEAM", label: "Weak Team" },
  { key: "VALUATION", label: "Valuation Too High" },
  { key: "COMPETITIVE", label: "Competitive Market" },
  { key: "OTHER", label: "Other" },
] as const;

export const REVENUE_TYPES = [
  { key: "MRR", label: "MRR" },
  { key: "ARR", label: "ARR" },
  { key: "GMV", label: "GMV" },
  { key: "NONE", label: "None / Pre-Revenue" },
] as const;

export const BUSINESS_MODELS = [
  { key: "SAAS", label: "SaaS" },
  { key: "MARKETPLACE", label: "Marketplace" },
  { key: "TRANSACTIONAL", label: "Transactional" },
  { key: "D2C_ECOMMERCE", label: "D2C / E-commerce" },
  { key: "ADVERTISING", label: "Advertising" },
  { key: "OTHER", label: "Other" },
] as const;

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

export const PASS_REASON_LABELS: Record<string, string> = Object.fromEntries(
  PASS_REASON_CATEGORIES.map((c) => [c.key, c.label])
);

export const REVENUE_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  REVENUE_TYPES.map((r) => [r.key, r.label])
);

// ─── Badge color maps (Tailwind classes) ────────────────

export const SECTOR_COLORS: Record<string, string> = {
  SAAS: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
  FINTECH: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300",
  D2C: "border-pink-200 bg-pink-50 text-pink-700 dark:border-pink-800 dark:bg-pink-900/20 dark:text-pink-300",
  CONSUMER: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-900/20 dark:text-orange-300",
  AI: "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-900/20 dark:text-violet-300",
  HEALTHTECH: "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-900/20 dark:text-teal-300",
  OTHER: "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-900/20 dark:text-gray-300",
};

export const FUNDING_STAGE_COLORS: Record<string, string> = {
  PRE_SEED: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300",
  SEED: "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300",
  SERIES_A: "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300",
  OTHER: "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-900/20 dark:text-gray-300",
};

// ─── Sector icon backgrounds (for logo fallback avatars) ─

export const SECTOR_AVATAR_COLORS: Record<string, string> = {
  SAAS: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  FINTECH: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  D2C: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
  CONSUMER: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  AI: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  HEALTHTECH: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  OTHER: "bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-300",
};

export const BUSINESS_MODEL_LABELS: Record<string, string> = Object.fromEntries(
  BUSINESS_MODELS.map((b) => [b.key, b.label])
);

export const STAGE_LABEL_MAP: Record<string, string> = Object.fromEntries(
  DEAL_STAGES.map((s) => [s.key, s.label])
);

// ─── Portfolio Health Status ────────────────────────────

export const COMPANY_HEALTH_STATUSES = [
  { key: "ON_TRACK", label: "On Track", icon: "CheckCircle2" },
  { key: "WATCH", label: "Watch", icon: "Eye" },
  { key: "AT_RISK", label: "At Risk", icon: "AlertTriangle" },
  { key: "WRITE_OFF", label: "Write-off", icon: "XCircle" },
] as const;

export type CompanyHealthStatusKey = (typeof COMPANY_HEALTH_STATUSES)[number]["key"];

export const HEALTH_STATUS_LABELS: Record<string, string> = Object.fromEntries(
  COMPANY_HEALTH_STATUSES.map((s) => [s.key, s.label])
);

export const HEALTH_STATUS_COLORS: Record<string, string> = {
  ON_TRACK: "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300",
  WATCH: "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
  AT_RISK: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300",
  WRITE_OFF: "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-900/20 dark:text-gray-300",
};

// Runway thresholds (months)
export const RUNWAY_THRESHOLDS = { critical: 3, warning: 6 } as const;
