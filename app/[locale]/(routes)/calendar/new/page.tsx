"use client";

import { EventForm } from "@/components/calendar/event-form";

export default function NewEventPage() {
  return (
    <div className="space-y-6 p-4 pt-6 md:p-8 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">New Event</h1>
        <p className="text-muted-foreground">
          Schedule a meeting, call, or task
        </p>
      </div>
      <EventForm mode="create" />
    </div>
  );
}
