import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { getDealsByStage, getDraftDeals, getBreachedDeals } from "@/actions/deals";
import { KanbanBoard } from "@/components/deals/kanban-board";
import { DealsTable } from "@/components/deals/deals-table";

export default async function DealsPage() {
  let dealsByStage: Record<string, unknown[]> = {};
  let draftCount = 0;
  let breachedCount = 0;
  let allDeals: unknown[] = [];

  try {
    [dealsByStage, draftCount, breachedCount] = await Promise.all([
      getDealsByStage() as Promise<Record<string, unknown[]>>,
      getDraftDeals().then((d) => d.length),
      getBreachedDeals().then((d) => d.length),
    ]);
    allDeals = Object.values(dealsByStage).flat();
  } catch {
    // DB not connected yet — render with empty data
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Deal Pipeline</h1>
          <p className="text-muted-foreground">
            8-stage pipeline with SLA enforcement
          </p>
        </div>
        <div className="flex gap-2 items-center">
          {breachedCount > 0 && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              {breachedCount} SLA breach{breachedCount > 1 ? "es" : ""}
            </Badge>
          )}
          <Link href="/deals/drafts">
            <Button variant="outline" size="sm">
              Drafts
              {draftCount > 0 && (
                <Badge className="ml-1 bg-amber-500 text-white text-[10px] px-1.5">
                  {draftCount}
                </Badge>
              )}
            </Button>
          </Link>
          <Link href="/deals/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              New Deal
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="kanban">
        <TabsList>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="table">Table</TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="mt-4">
          <KanbanBoard initialDeals={dealsByStage as never} />
        </TabsContent>

        <TabsContent value="table" className="mt-4">
          <DealsTable deals={allDeals as never} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
