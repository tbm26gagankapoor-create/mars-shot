"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { DealCard, type DealCardData } from "./deal-card";

type KanbanColumnProps = {
  stageKey: string;
  label: string;
  slaHours: number | null;
  deals: DealCardData[];
};

export function KanbanColumn({ stageKey, label, slaHours, deals }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stageKey });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col min-w-[280px] max-w-[280px] rounded-lg border bg-muted/20 ${
        isOver ? "ring-2 ring-primary" : ""
      }`}
    >
      <div className="p-3 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-semibold text-sm truncate">{label}</h3>
          <Badge variant="secondary" className="text-xs">
            {deals.length}
          </Badge>
        </div>
        {slaHours && (
          <p className="text-[10px] text-muted-foreground mt-1">
            SLA: {slaHours >= 24 ? `${slaHours / 24}d` : `${slaHours}h`}
          </p>
        )}
      </div>
      <ScrollArea className="flex-1 p-2" style={{ maxHeight: "calc(100vh - 220px)" }}>
        <SortableContext items={deals.map((d) => d.id)} strategy={verticalListSortingStrategy}>
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
          {deals.length === 0 && (
            <div className="text-center text-xs text-muted-foreground py-8">
              No deals
            </div>
          )}
        </SortableContext>
      </ScrollArea>
    </div>
  );
}
