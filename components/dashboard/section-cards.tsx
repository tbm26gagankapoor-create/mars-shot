import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type BriefingData = {
  breachedCount: number;
  atRiskCount: number;
  todayEventsCount: number;
  draftCount: number;
  totalActiveDeals: number;
};

export function SectionCards({ data }: { data: BriefingData }) {
  const urgentCount = data.breachedCount + data.atRiskCount;
  const urgentTrending = urgentCount > 0;
  const hasDrafts = data.draftCount > 0;

  return (
    <div className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6">
      {/* Active Deals */}
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Active Deals</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {data.totalActiveDeals}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              <TrendingUpIcon className="size-3" />
              Pipeline
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Across all stages <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Deals currently in pipeline
          </div>
        </CardFooter>
      </Card>

      {/* Needs Attention */}
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Needs Attention</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {urgentCount}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className={`flex gap-1 rounded-lg text-xs ${urgentTrending ? "text-destructive border-destructive/30" : "text-emerald-600 border-emerald-600/30"}`}>
              {urgentTrending ? (
                <><TrendingDownIcon className="size-3" />{data.breachedCount} breached</>
              ) : (
                <><TrendingUpIcon className="size-3" />All clear</>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {urgentTrending ? (
              <>SLA issues detected <TrendingDownIcon className="size-4" /></>
            ) : (
              <>Every deal on track <TrendingUpIcon className="size-4" /></>
            )}
          </div>
          <div className="text-muted-foreground">
            {data.atRiskCount > 0
              ? `${data.atRiskCount} at risk of breaching`
              : "No deals breaching SLA"}
          </div>
        </CardFooter>
      </Card>

      {/* Today's Agenda */}
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Today&apos;s Agenda</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {data.todayEventsCount}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              <TrendingUpIcon className="size-3" />
              {data.todayEventsCount > 0 ? "Events" : "Clear"}
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {data.todayEventsCount > 0
              ? <>Meetings scheduled <TrendingUpIcon className="size-4" /></>
              : <>No meetings today <TrendingUpIcon className="size-4" /></>
            }
          </div>
          <div className="text-muted-foreground">
            {data.todayEventsCount > 0
              ? "Review your calendar"
              : "Focus time — review pipeline"}
          </div>
        </CardFooter>
      </Card>

      {/* Drafts to Triage */}
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Drafts to Triage</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {data.draftCount}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className={`flex gap-1 rounded-lg text-xs ${hasDrafts ? "text-amber-600 border-amber-600/30" : ""}`}>
              {hasDrafts ? (
                <><TrendingDownIcon className="size-3" />Pending</>
              ) : (
                <><TrendingUpIcon className="size-3" />Clear</>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {hasDrafts ? (
              <>New deals awaiting review <TrendingDownIcon className="size-4" /></>
            ) : (
              <>Inbox clear <TrendingUpIcon className="size-4" /></>
            )}
          </div>
          <div className="text-muted-foreground">
            {hasDrafts
              ? "Triage incoming deal flow"
              : "All drafts have been reviewed"}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
