"use client";

// Must be imported before @schedule-x so the polyfill is on globalThis
// when Schedule-X validates Temporal types.
import "@/lib/temporal-polyfill-global";

import { useCalendarApp, ScheduleXCalendar } from "@schedule-x/react";
import {
  createViewDay,
  createViewWeek,
  createViewMonthGrid,
} from "@schedule-x/calendar";
import { useRouter } from "next/navigation";
import "@schedule-x/theme-default/dist/index.css";

// Use the Temporal from globalThis (set by our polyfill) so that instanceof
// checks inside Schedule-X pass — both sides reference the same class.
const T = (globalThis as unknown as { Temporal: typeof import("temporal-polyfill").Temporal }).Temporal;

type CalendarViewEvent = {
  id: string;
  title: string;
  start: string; // ISO 8601 datetime string
  end: string;
  description?: string;
};

type CalendarViewProps = {
  events: CalendarViewEvent[];
};

function toZonedDateTime(dateStr: string) {
  return T.PlainDateTime.from(dateStr).toZonedDateTime(T.Now.timeZoneId());
}

export function CalendarView({ events }: CalendarViewProps) {
  const router = useRouter();

  const calendar = useCalendarApp({
    views: [createViewMonthGrid(), createViewWeek(), createViewDay()],
    events: events.map((e) => ({
      id: e.id,
      title: e.title,
      start: toZonedDateTime(e.start),
      end: toZonedDateTime(e.end),
      description: e.description,
    })),
    callbacks: {
      onEventClick(calendarEvent) {
        router.push(`/calendar/${calendarEvent.id}`);
      },
    },
  });

  if (!calendar) return null;

  return (
    <div className="h-[calc(100vh-200px)]">
      <ScheduleXCalendar calendarApp={calendar} />
    </div>
  );
}
