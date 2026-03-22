"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export function DraftRawText({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const lines = text.split("\n");
  const preview = lines.slice(0, 2).join("\n");
  const hasMore = lines.length > 2;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div>
        <CollapsibleTrigger className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
          {open ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
          Raw ingestion text
        </CollapsibleTrigger>

        {!open && (
          <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap line-clamp-2">
            {preview}
          </p>
        )}

        <CollapsibleContent>
          <pre className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap bg-muted/50 rounded-md p-3 max-h-60 overflow-auto">
            {text}
          </pre>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
