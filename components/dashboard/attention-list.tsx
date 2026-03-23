import Link from "next/link";
import { AlertTriangle, Clock, Pause, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type AttentionDeal = {
  id: string;
  companyName: string;
  stage: string;
  stageLabel: string;
  slaStatus: "breached" | "red" | "yellow" | "stalled";
  slaRemaining: string;
  nextAction: string;
};

const statusConfig = {
  breached: {
    icon: AlertTriangle,
    iconClass: "text-destructive",
    containerClass: "bg-destructive/10",
    badgeClass: "bg-destructive/10 text-destructive border-destructive/20",
    rowClass: "border-l-2 border-l-destructive",
    label: "Breached",
  },
  red: {
    icon: Clock,
    iconClass: "text-red-600 dark:text-red-400",
    containerClass: "bg-red-500/10",
    badgeClass: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    rowClass: "border-l-2 border-l-red-500",
    label: "Urgent",
  },
  yellow: {
    icon: Clock,
    iconClass: "text-yellow-600 dark:text-yellow-400",
    containerClass: "bg-yellow-500/10",
    badgeClass: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
    rowClass: "border-l-2 border-l-yellow-500",
    label: "At risk",
  },
  stalled: {
    icon: Pause,
    iconClass: "text-muted-foreground",
    containerClass: "bg-muted",
    badgeClass: "bg-muted text-muted-foreground border-muted",
    rowClass: "border-l-2 border-l-muted-foreground/30",
    label: "Stalled",
  },
};

export function AttentionList({ deals }: { deals: AttentionDeal[] }) {
  if (deals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3 animate-scale-in">
          <Clock className="h-5 w-5 text-health-green" />
        </div>
        <p className="text-sm font-display font-medium">All clear</p>
        <p className="text-xs text-muted-foreground">
          Every deal is on track
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-1">
      {deals.map((deal) => {
        const config = statusConfig[deal.slaStatus];
        const Icon = config.icon;

        return (
          <li key={deal.id}>
            <Link
              href={`/deals/${deal.id}`}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/50 transition-all duration-150 ${config.rowClass}`}
            >
              <div className={`rounded-md p-1.5 ${config.containerClass} shrink-0`}>
                <Icon className={`h-3.5 w-3.5 ${config.iconClass}`} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold tracking-tight truncate group-hover:text-primary transition-colors">
                    {deal.companyName}
                  </span>
                  <Badge variant="secondary" className="text-[10px] shrink-0">
                    {deal.stageLabel}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${config.badgeClass}`}
                  >
                    {deal.slaRemaining}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <ArrowRight className="h-3 w-3" />
                    {deal.nextAction}
                  </span>
                </div>
              </div>

              <ArrowRight className="h-4 w-4 text-muted-foreground/0 group-hover:text-muted-foreground transition-all shrink-0" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
