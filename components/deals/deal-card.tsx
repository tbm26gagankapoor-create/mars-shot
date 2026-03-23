"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SlaTimer } from "./sla-timer";
import { SOURCE_TYPE_LABELS, SECTOR_LABELS, FUNDING_STAGE_LABELS, INGESTION_CHANNEL_ICONS } from "@/lib/constants";
import { Mail, MessageCircle, Globe, Send, Smartphone } from "lucide-react";
import Link from "next/link";

export type DealCardData = {
  id: string;
  companyName: string;
  sector: string | null;
  fundingStage: string | null;
  chequeSize: number | null;
  source: string | null;
  sourceType: string | null;
  stage: string;
  status: string;
  stageEnteredAt: Date;
  slaDueAt: Date | null;
  ingestionChannel: string;
  aiConfidence: number | null;
  founders: { id: string; name: string; title: string | null }[];
  _count: { documents: number };
};

const channelIcons: Record<string, React.ReactNode> = {
  EMAIL: <Mail className="h-3 w-3" />,
  WHATSAPP: <MessageCircle className="h-3 w-3" />,
  TELEGRAM: <Send className="h-3 w-3" />,
  WEB: <Globe className="h-3 w-3" />,
  MOBILE_PWA: <Smartphone className="h-3 w-3" />,
};

export function DealCard({ deal }: { deal: DealCardData }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Link href={`/deals/${deal.id}`}>
        <Card className="cursor-grab active:cursor-grabbing hover:shadow-soft-lg hover:-translate-y-0.5 transition-all duration-200 mb-2">
          <CardHeader className="p-3 pb-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h4 className="font-semibold text-sm truncate">{deal.companyName}</h4>
                <p className="text-xs text-muted-foreground truncate">
                  {deal.founders.map((f) => f.name).join(", ") || "No founders"}
                </p>
              </div>
              <SlaTimer stageEnteredAt={deal.stageEnteredAt} slaDueAt={deal.slaDueAt} />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="flex flex-wrap gap-1 mb-2">
              {deal.sector && (
                <Badge variant="secondary" className="text-[10px]">
                  {SECTOR_LABELS[deal.sector] || deal.sector}
                </Badge>
              )}
              {deal.fundingStage && (
                <Badge variant="outline" className="text-[10px]">
                  {FUNDING_STAGE_LABELS[deal.fundingStage] || deal.fundingStage}
                </Badge>
              )}
              {deal.chequeSize && (
                <Badge variant="outline" className="text-[10px]">
                  ${(deal.chequeSize / 1000).toFixed(0)}K
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <div className="flex items-center gap-1">
                {channelIcons[deal.ingestionChannel]}
                {deal.sourceType && (
                  <span>{SOURCE_TYPE_LABELS[deal.sourceType] || deal.sourceType}</span>
                )}
              </div>
              {deal.status === "DRAFT" && (
                <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 text-[10px]">
                  Draft
                </Badge>
              )}
              {deal.aiConfidence !== null && (
                <span className="text-[10px]">AI: {Math.round(deal.aiConfidence * 100)}%</span>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
