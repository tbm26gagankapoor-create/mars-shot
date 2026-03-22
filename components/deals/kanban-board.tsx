"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { KanbanColumn } from "./kanban-column";
import { DealCard, type DealCardData } from "./deal-card";
import { DEAL_STAGES } from "@/lib/constants";
import { moveDealToStage } from "@/actions/deals";
import { toast } from "sonner";

type KanbanBoardProps = {
  initialDeals: Record<string, DealCardData[]>;
};

export function KanbanBoard({ initialDeals }: KanbanBoardProps) {
  const [dealsByStage, setDealsByStage] = useState(initialDeals);
  const [activeDeal, setActiveDeal] = useState<DealCardData | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const findDealStage = useCallback(
    (dealId: string): string | null => {
      for (const [stage, deals] of Object.entries(dealsByStage)) {
        if (deals.some((d) => d.id === dealId)) return stage;
      }
      return null;
    },
    [dealsByStage]
  );

  const handleDragStart = (event: DragStartEvent) => {
    const dealId = event.active.id as string;
    const stage = findDealStage(dealId);
    if (stage) {
      const deal = dealsByStage[stage].find((d) => d.id === dealId);
      setActiveDeal(deal || null);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeDealId = active.id as string;
    const overId = over.id as string;

    const activeStage = findDealStage(activeDealId);
    // over could be a stage column or another deal
    let overStage = findDealStage(overId);
    if (!overStage) {
      // overId might be the column itself
      overStage = DEAL_STAGES.find((s) => s.key === overId)?.key || null;
    }

    if (!activeStage || !overStage || activeStage === overStage) return;

    setDealsByStage((prev) => {
      const deal = prev[activeStage].find((d) => d.id === activeDealId);
      if (!deal) return prev;

      return {
        ...prev,
        [activeStage]: prev[activeStage].filter((d) => d.id !== activeDealId),
        [overStage]: [...prev[overStage], deal],
      };
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveDeal(null);

    const { active, over } = event;
    if (!over) return;

    const dealId = active.id as string;
    const currentStage = findDealStage(dealId);
    if (!currentStage) return;

    // Find original stage from initialDeals
    let originalStage: string | null = null;
    for (const [stage, deals] of Object.entries(initialDeals)) {
      if (deals.some((d) => d.id === dealId)) {
        originalStage = stage;
        break;
      }
    }

    if (currentStage !== originalStage && currentStage) {
      try {
        await moveDealToStage(dealId, currentStage as never);
        toast.success(`Deal moved to ${DEAL_STAGES.find((s) => s.key === currentStage)?.label}`);
      } catch {
        // Revert on failure
        setDealsByStage(initialDeals);
        toast.error("Failed to move deal");
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <ScrollArea className="w-full">
        <div className="flex gap-4 p-4 min-w-max">
          {DEAL_STAGES.map((stage) => (
            <KanbanColumn
              key={stage.key}
              stageKey={stage.key}
              label={stage.label}
              slaHours={stage.slaHours}
              deals={dealsByStage[stage.key] || []}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <DragOverlay>
        {activeDeal ? (
          <div className="rotate-3 opacity-90">
            <DealCard deal={activeDeal} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
