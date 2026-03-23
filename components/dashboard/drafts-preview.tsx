import Link from "next/link";
import { Globe, Mail, MessageCircle, Send, Smartphone, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type DraftDeal = {
  id: string;
  companyName: string;
  ingestionChannel: string | null;
  aiConfidence: number | null;
  createdAt: Date;
};

const channelIcons: Record<string, typeof Globe> = {
  WEB: Globe,
  EMAIL: Mail,
  WHATSAPP: MessageCircle,
  TELEGRAM: Send,
  MOBILE_PWA: Smartphone,
};

const channelColors: Record<string, { icon: string; container: string }> = {
  WEB: { icon: "text-blue-600 dark:text-blue-400", container: "bg-blue-500/10" },
  EMAIL: { icon: "text-purple-600 dark:text-purple-400", container: "bg-purple-500/10" },
  WHATSAPP: { icon: "text-green-600 dark:text-green-400", container: "bg-green-500/10" },
  TELEGRAM: { icon: "text-sky-600 dark:text-sky-400", container: "bg-sky-500/10" },
  MOBILE_PWA: { icon: "text-amber-600 dark:text-amber-400", container: "bg-amber-500/10" },
};

function getConfidenceBadge(confidence: number) {
  const pct = Math.round(confidence * 100);
  if (pct >= 80) return { variant: "success" as const, label: `${pct}% conf` };
  if (pct >= 50) return { variant: "outline" as const, label: `${pct}% conf` };
  return { variant: "warning" as const, label: `${pct}% conf` };
}

export function DraftsPreview({
  drafts,
  totalCount,
}: {
  drafts: DraftDeal[];
  totalCount: number;
}) {
  if (drafts.length === 0) return null;

  return (
    <div>
      <ul className="space-y-1">
        {drafts.map((draft) => {
          const channel = draft.ingestionChannel ?? "WEB";
          const ChannelIcon = channelIcons[channel] || Globe;
          const colors = channelColors[channel] || channelColors.WEB;

          return (
            <li key={draft.id}>
              <Link
                href={`/deals/${draft.id}`}
                className="group flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/50 transition-all duration-150"
              >
                <div className={`rounded-lg p-1.5 ${colors.container} shrink-0`}>
                  <ChannelIcon className={`h-3.5 w-3.5 ${colors.icon}`} />
                </div>
                <span className="text-sm font-medium truncate flex-1 group-hover:text-primary transition-colors">
                  {draft.companyName}
                </span>
                {draft.aiConfidence !== null && (() => {
                  const badge = getConfidenceBadge(draft.aiConfidence);
                  return (
                    <Badge
                      variant={badge.variant}
                      className="text-[10px] tabular-nums shrink-0"
                    >
                      {badge.label}
                    </Badge>
                  );
                })()}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-3 flex justify-center">
        <Button variant="outline" size="sm" asChild className="w-full">
          <Link href="/deals/drafts" className="gap-1.5">
            {totalCount > 3 ? `View all ${totalCount} drafts` : "Triage drafts"}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
