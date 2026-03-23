"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { DealEditSheet } from "./deal-edit-sheet";
import type { getDealById } from "@/actions/deals";

type Deal = NonNullable<Awaited<ReturnType<typeof getDealById>>>;

export function DealEditTrigger({ deal }: { deal: Deal }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" size="icon" onClick={() => setOpen(true)} title="Edit deal">
        <Pencil className="h-4 w-4" />
      </Button>
      <DealEditSheet deal={deal} open={open} onOpenChange={setOpen} />
    </>
  );
}
