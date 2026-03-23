"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface WizardStepsProps {
  steps: { label: string; description?: string }[];
  currentStep: number;
}

export function WizardSteps({ steps, currentStep }: WizardStepsProps) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {steps.map((step, idx) => {
        const isCompleted = idx < currentStep;
        const isCurrent = idx === currentStep;
        return (
          <div key={idx} className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium border-2 transition-colors",
                  isCompleted && "bg-primary border-primary text-primary-foreground",
                  isCurrent && "border-primary text-primary",
                  !isCompleted && !isCurrent && "border-muted-foreground/30 text-muted-foreground/50"
                )}
              >
                {isCompleted ? <Check className="h-3.5 w-3.5" /> : idx + 1}
              </div>
              <div className="min-w-0">
                <p
                  className={cn(
                    "text-xs font-medium truncate",
                    isCurrent ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </p>
                {step.description && (
                  <p className="text-[10px] text-muted-foreground truncate hidden md:block">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={cn(
                  "h-px flex-1 transition-colors",
                  isCompleted ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
