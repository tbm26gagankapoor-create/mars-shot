import { z } from "zod";

// ─── Enums (mirrored from Prisma / constants) ────────

const healthStatusEnum = z.enum(["ON_TRACK", "WATCH", "AT_RISK", "WRITE_OFF"]);

// ─── KPI Snapshot schema ─────────────────────────────

export const kpiSnapshotSchema = z.object({
  periodDate: z.coerce.date({ required_error: "Month is required" }),
  arr: z.coerce.number().nonnegative("Must be non-negative").optional(),
  mrr: z.coerce.number().nonnegative("Must be non-negative").optional(),
  burnRate: z.coerce.number().nonnegative("Must be non-negative").optional(),
  runway: z.coerce.number().nonnegative("Must be non-negative").optional(),
  headcount: z.coerce.number().int().nonnegative("Must be non-negative").optional(),
  customers: z.coerce.number().int().nonnegative("Must be non-negative").optional(),
  notes: z.string().optional(),
});

export type KpiSnapshotData = z.infer<typeof kpiSnapshotSchema>;

// ─── Investment & health update schema ───────────────

export const investmentUpdateSchema = z.object({
  entryValuation: z.coerce.number().positive("Must be positive").optional(),
  ownershipPct: z.coerce
    .number()
    .min(0, "Cannot be negative")
    .max(100, "Cannot exceed 100%")
    .optional(),
  currentValuation: z.coerce.number().positive("Must be positive").optional(),
  proRataRights: z.boolean().optional(),
  boardSeat: z.boolean().optional(),
  healthStatus: healthStatusEnum.optional(),
  nextMilestone: z.string().optional(),
  coInvestors: z.array(z.string()).optional(),
});

export type InvestmentUpdateData = z.infer<typeof investmentUpdateSchema>;

// Re-export enum for reuse
export { healthStatusEnum };
