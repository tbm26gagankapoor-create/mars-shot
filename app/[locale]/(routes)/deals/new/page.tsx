"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuickAddForm } from "@/components/deals/quick-add-form";
import { AIExtraction } from "@/components/deals/ai-extraction";
import { DealFormWizard } from "@/components/deals/deal-form-wizard";
import { URLImportForm } from "@/components/deals/url-import-form";
import { Zap, Sparkles, ClipboardList, Link2 } from "lucide-react";

export default function NewDealPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 py-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">New Deal</h1>
        <p className="text-muted-foreground">
          Choose how you want to add a deal — quick log, AI extract, full form, or URL import.
        </p>
      </div>

      <Tabs defaultValue="quick">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="quick" className="gap-1.5">
            <Zap className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Quick Add</span>
            <span className="sm:hidden">Quick</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">AI Extract</span>
            <span className="sm:hidden">AI</span>
          </TabsTrigger>
          <TabsTrigger value="full" className="gap-1.5">
            <ClipboardList className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Full Form</span>
            <span className="sm:hidden">Full</span>
          </TabsTrigger>
          <TabsTrigger value="url" className="gap-1.5">
            <Link2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">URL Import</span>
            <span className="sm:hidden">URL</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quick" className="mt-6">
          <QuickAddForm />
        </TabsContent>

        <TabsContent value="ai" className="mt-6">
          <AIExtraction directCreate />
        </TabsContent>

        <TabsContent value="full" className="mt-6">
          <DealFormWizard />
        </TabsContent>

        <TabsContent value="url" className="mt-6">
          <URLImportForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
