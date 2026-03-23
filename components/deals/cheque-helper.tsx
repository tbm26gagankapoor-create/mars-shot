"use client";

import { CHEQUE_RANGE } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

interface ChequeHelperProps {
  value: number | undefined;
}

export function ChequeHelper({ value }: ChequeHelperProps) {
  const min = CHEQUE_RANGE.min / 1000;
  const max = CHEQUE_RANGE.max / 1000;

  const isWithinRange =
    value !== undefined && value >= CHEQUE_RANGE.min && value <= CHEQUE_RANGE.max;
  const isOutOfRange = value !== undefined && value > 0 && !isWithinRange;

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span>Mars Shot range: ${min}K&ndash;${max}K</span>
      {isWithinRange && (
        <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px] px-1.5 py-0">
          Within range
        </Badge>
      )}
      {isOutOfRange && (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 text-[10px] px-1.5 py-0">
          Outside fund range
        </Badge>
      )}
    </div>
  );
}
