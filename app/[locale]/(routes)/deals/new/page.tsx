"use client";

import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { AIExtraction } from "@/components/deals/ai-extraction";
import { DealForm } from "@/components/deals/deal-form";

export default function NewDealPage() {
  const [prefill, setPrefill] = useState<Record<string, unknown> | null>(null);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">New Deal</h1>
        <p className="text-muted-foreground">
          Paste raw lead info or fill the form manually
        </p>
      </div>

      <AIExtraction onExtracted={(result) => setPrefill(result as never)} />

      <div className="flex items-center gap-4">
        <Separator className="flex-1" />
        <span className="text-sm text-muted-foreground">or fill manually</span>
        <Separator className="flex-1" />
      </div>

      <DealForm prefill={prefill as never} />
    </div>
  );
}
