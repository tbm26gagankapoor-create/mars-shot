import { prismadb as prisma } from "@/lib/prisma";
import { DEAL_STAGES } from "@/lib/constants";
import { logAudit } from "@/lib/audit";

// ─── Stage Change Hooks ─────────────────────────────────

type StageHook = {
  stage: string;
  onEnter?: (dealId: string) => Promise<void>;
  onExit?: (dealId: string) => Promise<void>;
};

const stageHooks: StageHook[] = [
  {
    stage: "SCREENING",
    onEnter: async (dealId) => {
      // Auto-set screening SLA
      const stageDef = DEAL_STAGES.find((s) => s.key === "SCREENING");
      if (stageDef?.slaHours) {
        const slaDueAt = new Date(
          Date.now() + stageDef.slaHours * 60 * 60 * 1000
        );
        await prisma.deal.update({
          where: { id: dealId },
          data: { slaDueAt },
        });
      }
    },
  },
  {
    stage: "INTRO_CALL",
    onEnter: async (dealId) => {
      // Log that deal moved to active engagement
      await prisma.activity.create({
        data: {
          type: "WORKFLOW_TRIGGER",
          title: "Intro call stage entered — schedule call",
          dealId,
        },
      });
    },
  },
  {
    stage: "ACTIVE_DD",
    onEnter: async (dealId) => {
      await prisma.activity.create({
        data: {
          type: "WORKFLOW_TRIGGER",
          title: "Due diligence started — checklist activated",
          dealId,
        },
      });
    },
  },
  {
    stage: "DECISION",
    onEnter: async (dealId) => {
      await prisma.activity.create({
        data: {
          type: "WORKFLOW_TRIGGER",
          title: "Decision stage — partner vote required",
          dealId,
        },
      });
    },
  },
];

export async function executeStageChangeHooks(
  dealId: string,
  fromStage: string,
  toStage: string,
  userId?: string
) {
  // Execute exit hooks for old stage
  const exitHook = stageHooks.find((h) => h.stage === fromStage);
  if (exitHook?.onExit) {
    await exitHook.onExit(dealId);
  }

  // Execute enter hooks for new stage
  const enterHook = stageHooks.find((h) => h.stage === toStage);
  if (enterHook?.onEnter) {
    await enterHook.onEnter(dealId);
  }

  // Audit the stage change
  await logAudit({
    entity: "Deal",
    entityId: dealId,
    action: "STAGE_CHANGE",
    changes: { from: fromStage, to: toStage },
    userId,
  });
}
