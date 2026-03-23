"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { STAGE_LABEL_MAP } from "@/lib/constants";

type ExistingDeal = {
  id: string;
  companyName: string;
  stage: string;
  status: string;
};

interface DuplicateWarningProps {
  deals: ExistingDeal[];
}

export function DuplicateWarning({ deals }: DuplicateWarningProps) {
  if (deals.length === 0) return null;

  return (
    <div className="rounded-md border border-yellow-300 bg-yellow-50 p-3 dark:border-yellow-700 dark:bg-yellow-950/30">
      <div className="flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 shrink-0" />
        <div className="text-sm">
          <p className="font-medium text-yellow-800 dark:text-yellow-300">
            Possible duplicate{deals.length > 1 ? "s" : ""} found
          </p>
          <ul className="mt-1 space-y-1">
            {deals.map((deal) => (
              <li key={deal.id}>
                <Link
                  href={`/deals/${deal.id}`}
                  className="text-yellow-700 underline hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-200"
                >
                  {deal.companyName}
                </Link>
                <span className="text-yellow-600 dark:text-yellow-500">
                  {" "}&mdash; {STAGE_LABEL_MAP[deal.stage] || deal.stage} ({deal.status.toLowerCase().replace("_", " ")})
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
