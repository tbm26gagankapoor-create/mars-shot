"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { QuickAddForm } from "@/components/deals/quick-add-form";

export function QuickAddSheet() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm" className="gap-1.5 shadow-soft hover:shadow-soft-lg transition-all">
          <Plus className="h-3.5 w-3.5" />
          Quick Add Deal
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Quick Add Deal</SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          <QuickAddForm />
        </div>
      </SheetContent>
    </Sheet>
  );
}
