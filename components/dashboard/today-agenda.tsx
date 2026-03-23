import Link from "next/link";
import { Calendar, Phone, Users, FileSearch, Gavel } from "lucide-react";

type TodayEvent = {
  id: string;
  title: string;
  type: string;
  startAt: Date;
  deal?: { id: string; companyName: string } | null;
  contact?: { id: string; name: string } | null;
};

const typeIcons: Record<string, typeof Calendar> = {
  INTRO_CALL: Phone,
  PARTNER_REVIEW: Users,
  DD_MEETING: FileSearch,
  BOARD_MEETING: Gavel,
  OTHER: Calendar,
};

const typeColors: Record<string, { icon: string; container: string }> = {
  INTRO_CALL: { icon: "text-blue-600 dark:text-blue-400", container: "bg-blue-500/10" },
  PARTNER_REVIEW: { icon: "text-purple-600 dark:text-purple-400", container: "bg-purple-500/10" },
  DD_MEETING: { icon: "text-amber-600 dark:text-amber-400", container: "bg-amber-500/10" },
  BOARD_MEETING: { icon: "text-red-600 dark:text-red-400", container: "bg-red-500/10" },
  OTHER: { icon: "text-primary/70", container: "bg-primary/10" },
};

export function TodayAgenda({ events }: { events: TodayEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3 animate-scale-in">
          <Calendar className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-display font-medium">Clear day</p>
        <p className="text-xs text-muted-foreground">
          Good time to review the pipeline
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-1">
      {events.map((evt) => {
        const Icon = typeIcons[evt.type] || typeIcons.OTHER;
        const colors = typeColors[evt.type] || typeColors.OTHER;
        const time = new Date(evt.startAt).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        });

        return (
          <li key={evt.id}>
            <Link
              href={`/calendar/${evt.id}`}
              className="group flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/50 transition-all duration-150"
            >
              <span className="text-xs font-mono bg-muted rounded-md px-2 py-1 text-muted-foreground w-[4.5rem] text-center shrink-0">
                {time}
              </span>
              <div className={`rounded-lg p-1.5 ${colors.container} shrink-0`}>
                <Icon className={`h-3.5 w-3.5 ${colors.icon}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{evt.title}</p>
                {(evt.deal || evt.contact) && (
                  <p className="text-xs text-muted-foreground truncate">
                    {evt.deal?.companyName || evt.contact?.name}
                  </p>
                )}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
