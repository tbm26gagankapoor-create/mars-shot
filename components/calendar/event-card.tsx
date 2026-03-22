import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Link2 } from "lucide-react";
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

const TYPE_VARIANTS: Record<string, "default" | "secondary" | "outline"> = {
  INTRO_CALL: "default",
  PARTNER_REVIEW: "secondary",
  DD_MEETING: "default",
  BOARD_MEETING: "secondary",
  ECOSYSTEM_CATCHUP: "outline",
  TASK: "outline",
  OTHER: "outline",
};

type EventCardProps = {
  id: string;
  title: string;
  type: string;
  startAt: Date;
  endAt: Date;
  allDay?: boolean;
  location?: string;
  deal?: { id: string; companyName: string } | null;
  contact?: { id: string; name: string } | null;
};

export function EventCard({
  id,
  title,
  type,
  startAt,
  endAt,
  allDay,
  location,
  deal,
  contact,
}: EventCardProps) {
  return (
    <Link href={`/calendar/${id}`}>
      <Card className="transition-colors hover:bg-muted/50">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium">{title}</CardTitle>
          <Badge variant={TYPE_VARIANTS[type] ?? "outline"}>
            {TYPE_LABELS[type] ?? type}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              {allDay
                ? format(startAt, "MMM d, yyyy")
                : `${format(startAt, "MMM d, yyyy")} ${format(startAt, "h:mm a")}`}
            </span>
          </div>
          {!allDay && (
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" />
              <span>
                {format(startAt, "h:mm a")} &ndash; {format(endAt, "h:mm a")}
              </span>
            </div>
          )}
          {location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5" />
              <span>{location}</span>
            </div>
          )}
          {(deal || contact) && (
            <div className="flex items-center gap-2">
              <Link2 className="h-3.5 w-3.5" />
              <span>
                {deal && deal.companyName}
                {deal && contact && " / "}
                {contact && contact.name}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
