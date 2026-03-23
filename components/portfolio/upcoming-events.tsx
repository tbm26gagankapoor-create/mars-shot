import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays } from "lucide-react";

const EVENT_TYPE_LABELS: Record<string, string> = {
  INTRO_CALL: "Intro Call",
  PARTNER_REVIEW: "Partner Review",
  DD_MEETING: "DD Meeting",
  BOARD_MEETING: "Board Meeting",
  ECOSYSTEM_CATCHUP: "Catchup",
  TASK: "Task",
  OTHER: "Other",
};

interface CalendarEvent {
  id: string;
  title: string;
  type: string;
  startAt: Date | string;
}

interface UpcomingEventsProps {
  events: CalendarEvent[];
}

export function UpcomingEvents({ events }: UpcomingEventsProps) {
  if (events.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">No upcoming events.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {events.slice(0, 3).map((event) => {
          const start = new Date(event.startAt);
          const now = new Date();
          const diffDays = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          const relLabel =
            diffDays === 0 ? "today" : diffDays === 1 ? "tomorrow" : `in ${diffDays}d`;

          return (
            <div key={event.id} className="flex items-center gap-3">
              <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{event.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="secondary" className="text-[10px]">
                    {EVENT_TYPE_LABELS[event.type] ?? event.type}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground">
                    {start.toLocaleDateString()} &middot; {relLabel}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
