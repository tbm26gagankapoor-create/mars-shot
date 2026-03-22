import { notFound } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import {
  getCalendarEventById,
  deleteCalendarEvent,
} from "@/actions/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Calendar,
  Clock,
  MapPin,
  ArrowLeft,
  Pencil,
  Trash2,
  Link2,
} from "lucide-react";
import { redirect } from "next/navigation";

const TYPE_LABELS: Record<string, string> = {
  INTRO_CALL: "Intro Call",
  PARTNER_REVIEW: "Partner Review",
  DD_MEETING: "DD Meeting",
  BOARD_MEETING: "Board Meeting",
  ECOSYSTEM_CATCHUP: "Ecosystem Catchup",
  TASK: "Task",
  OTHER: "Other",
};

const STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  SCHEDULED: "default",
  COMPLETED: "secondary",
  CANCELLED: "destructive",
  NO_SHOW: "outline",
};

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string; locale: string }>;
}) {
  const { eventId } = await params;

  const event = await getCalendarEventById(eventId);
  if (!event) return notFound();

  async function handleDelete() {
    "use server";
    await deleteCalendarEvent(eventId);
    redirect("/calendar");
  }

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8 max-w-3xl">
      {/* Back link */}
      <Link
        href="/calendar"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Calendar
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-semibold tracking-tight">{event.title}</h1>
          <div className="flex items-center gap-2">
            <Badge variant={STATUS_VARIANTS[event.status] ?? "outline"}>
              {event.status}
            </Badge>
            <Badge variant="outline">
              {TYPE_LABELS[event.type] ?? event.type}
            </Badge>
            {event.isSlaReminder && (
              <Badge variant="destructive">SLA Reminder</Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/calendar/${event.id}/edit`}>
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              Edit
            </Link>
          </Button>
          <form action={handleDelete}>
            <Button variant="destructive" size="sm" type="submit">
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Delete
            </Button>
          </form>
        </div>
      </div>

      {/* Details card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Event Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Date/Time */}
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>
              {event.allDay
                ? format(event.startAt, "EEEE, MMMM d, yyyy")
                : format(event.startAt, "EEEE, MMMM d, yyyy")}
            </span>
          </div>
          {!event.allDay && (
            <div className="flex items-center gap-3 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {format(event.startAt, "h:mm a")} &ndash;{" "}
                {format(event.endAt, "h:mm a")}
              </span>
            </div>
          )}

          {/* Location */}
          {event.location && (
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{event.location}</span>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="pt-2 border-t">
              <p className="text-sm whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
          )}

          {/* Linked entities */}
          {(event.deal || event.portfolioCompany || event.contact) && (
            <div className="pt-2 border-t space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Linked to
              </p>
              {event.deal && (
                <Link
                  href={`/deals/${event.deal.id}`}
                  className="flex items-center gap-2 text-sm hover:underline"
                >
                  <Link2 className="h-3.5 w-3.5" />
                  Deal: {event.deal.companyName}
                  {event.deal.stage && (
                    <Badge variant="outline" className="ml-1">
                      {event.deal.stage}
                    </Badge>
                  )}
                </Link>
              )}
              {event.portfolioCompany && (
                <Link
                  href={`/portfolio/${event.portfolioCompany.id}`}
                  className="flex items-center gap-2 text-sm hover:underline"
                >
                  <Link2 className="h-3.5 w-3.5" />
                  Portfolio: {event.portfolioCompany.companyName}
                </Link>
              )}
              {event.contact && (
                <Link
                  href={`/ecosystem/${event.contact.id}`}
                  className="flex items-center gap-2 text-sm hover:underline"
                >
                  <Link2 className="h-3.5 w-3.5" />
                  Contact: {event.contact.name}
                  {event.contact.email && (
                    <span className="text-muted-foreground">
                      ({event.contact.email})
                    </span>
                  )}
                </Link>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="pt-2 border-t text-xs text-muted-foreground">
            <p>Created: {format(event.createdAt, "MMM d, yyyy h:mm a")}</p>
            <p>Updated: {format(event.updatedAt, "MMM d, yyyy h:mm a")}</p>
            {event.reminderMinutes != null && (
              <p>Reminder: {event.reminderMinutes} minutes before</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
