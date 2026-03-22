"use client";

import { DEAL_STAGES } from "@/lib/constants";
import { CheckCircle2, Circle } from "lucide-react";

export function DealStageProgress({ currentStage }: { currentStage: string }) {
  const currentIdx = DEAL_STAGES.findIndex((s) => s.key === currentStage);

  return (
    <div className="flex items-center gap-1 overflow-x-auto py-2">
      {DEAL_STAGES.map((stage, idx) => {
        const isPast = idx < currentIdx;
        const isCurrent = idx === currentIdx;

        return (
          <div key={stage.key} className="flex items-center">
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs whitespace-nowrap ${
              isCurrent
                ? "bg-primary text-primary-foreground font-medium"
                : isPast
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                : "bg-muted text-muted-foreground"
            }`}>
              {isPast ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <Circle className="h-3 w-3" />
              )}
              {stage.label}
            </div>
            {idx < DEAL_STAGES.length - 1 && (
              <div className={`h-0.5 w-4 ${
                idx < currentIdx ? "bg-green-500 dark:bg-green-400" : "bg-muted"
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
