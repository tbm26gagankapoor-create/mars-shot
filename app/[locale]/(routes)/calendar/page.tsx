import { getCalendarEvents } from "@/actions/calendar";
import { CalendarView } from "@/components/calendar/calendar-view";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

/**
 * Format a Date into ISO 8601 datetime string for Temporal parsing.
 */
function toIsoDateTime(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export default async function CalendarPage() {
  // Fetch events for current month with a 1-month buffer on each side
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 2, 0);

  type CalendarEvent = {
    id: string;
    title: string;
    description: string | null;
    startAt: Date;
    endAt: Date;
  };

  let events: CalendarEvent[] = [];

  try {
    events = await getCalendarEvents({ startDate, endDate });
  } catch {
    /* DB unavailable */
  }

  const calendarEvents = events.map((e: CalendarEvent) => ({
    id: e.id,
    title: e.title,
    start: toIsoDateTime(e.startAt),
    end: toIsoDateTime(e.endAt),
    description: e.description || undefined,
  }));

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight">Calendar</h2>
          <p className="text-muted-foreground">
            {format(now, "MMMM yyyy")}
          </p>
        </div>
        <Button asChild>
          <Link href="/calendar/new">
            <Plus className="mr-2 h-4 w-4" />
            New Event
          </Link>
        </Button>
      </div>
      <CalendarView events={calendarEvents} />
    </div>
  );
}
