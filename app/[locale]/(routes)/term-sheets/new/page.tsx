"use client";

import { TermSheetForm } from "@/components/term-sheets/term-sheet-form";

export default function NewTermSheetPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Term Sheet</h1>
        <p className="text-muted-foreground">
          Create a term sheet for an active deal
        </p>
      </div>

      <TermSheetForm />
    </div>
  );
}
