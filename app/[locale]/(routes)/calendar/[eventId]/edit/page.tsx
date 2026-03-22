import { notFound } from "next/navigation";
import { getCalendarEventById } from "@/actions/calendar";
import { EventForm } from "@/components/calendar/event-form";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ eventId: string; locale: string }>;
}) {
  const { eventId } = await params;

  const event = await getCalendarEventById(eventId);
  if (!event) return notFound();

  return (
    <div className="space-y-6 p-4 pt-6 md:p-8 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Edit Event</h1>
        <p className="text-muted-foreground">Update event details</p>
      </div>
      <EventForm
        mode="edit"
        eventId={event.id}
        defaultValues={{
          title: event.title,
          description: event.description ?? undefined,
          type: event.type,
          startAt: event.startAt.toISOString(),
          endAt: event.endAt.toISOString(),
          allDay: event.allDay,
          location: event.location ?? undefined,
          dealId: event.dealId ?? undefined,
          contactId: event.contactId ?? undefined,
        }}
      />
    </div>
  );
}
