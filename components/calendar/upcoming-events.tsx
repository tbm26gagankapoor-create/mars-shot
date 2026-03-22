import { getUpcomingEvents } from "@/actions/calendar";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import Link from "next/link";

const TYPE_LABELS: Record<string, string> = {
  INTRO_CALL: "Intro Call",
  PARTNER_REVIEW: "Partner Review",
  DD_MEETING: "DD Meeting",
  BOARD_MEETING: "Board Meeting",
  ECOSYSTEM_CATCHUP: "Ecosystem Catchup",
  TASK: "Task",
  OTHER: "Other",
};

type UpcomingEvent = {
  id: string;
  title: string;
  type: string;
  startAt: Date;
  deal: { id: string; companyName: string } | null;
  contact: { id: string; name: string } | null;
};

export async function UpcomingEvents() {
  let events: UpcomingEvent[] | null = null;

  try {
    events = await getUpcomingEvents(7);
  } catch {
    /* DB unavailable */
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
        <Calendar className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {events && events.length > 0 ? (
          <ul className="space-y-3">
            {events.map((event) => (
              <li key={event.id}>
                <Link
                  href={`/calendar/${event.id}`}
                  className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-muted transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(event.startAt, "MMM d, h:mm a")}
                      {event.deal && ` - ${event.deal.companyName}`}
                    </p>
                  </div>
                  <Badge variant="outline" className="ml-2 shrink-0">
                    {TYPE_LABELS[event.type] ?? event.type}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            No upcoming events this week.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
