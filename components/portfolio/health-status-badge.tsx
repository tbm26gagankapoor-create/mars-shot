import { Badge } from "@/components/ui/badge";
import { HEALTH_STATUS_LABELS, HEALTH_STATUS_COLORS } from "@/lib/constants";
import { CheckCircle2, Eye, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ElementType> = {
  ON_TRACK: CheckCircle2,
  WATCH: Eye,
  AT_RISK: AlertTriangle,
  WRITE_OFF: XCircle,
};

interface HealthStatusBadgeProps {
  status: string;
  size?: "sm" | "default";
  className?: string;
}

export function HealthStatusBadge({ status, size = "default", className }: HealthStatusBadgeProps) {
  const Icon = ICONS[status] ?? CheckCircle2;
  const iconSize = size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3";
  return (
    <Badge className={cn(HEALTH_STATUS_COLORS[status], size === "sm" && "text-[10px] px-1.5 py-0", className)}>
      <Icon className={cn(iconSize, "mr-0.5")} />
      {HEALTH_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}
