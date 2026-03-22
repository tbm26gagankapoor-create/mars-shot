"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { computeSlaPercent, getSlaStatus } from "@/lib/constants";

type SlaTimerProps = {
  stageEnteredAt: Date;
  slaDueAt: Date | null;
};

function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return "BREACHED";
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 48) return `${Math.floor(hours / 24)}d`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

const statusColors: Record<string, string> = {
  green: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  red: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 animate-pulse-subtle",
  breached: "bg-red-600 text-white dark:bg-red-700 animate-pulse-subtle",
};

export function SlaTimer({ stageEnteredAt, slaDueAt }: SlaTimerProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000); // update every minute
    return () => clearInterval(interval);
  }, []);

  if (!slaDueAt) return null;

  const percent = computeSlaPercent(new Date(stageEnteredAt), new Date(slaDueAt));
  const status = getSlaStatus(percent);
  const remaining = new Date(slaDueAt).getTime() - now.getTime();

  return (
    <Badge variant="outline" className={`text-[10px] font-mono ${statusColors[status]}`}>
      {formatTimeRemaining(remaining)}
    </Badge>
  );
}
