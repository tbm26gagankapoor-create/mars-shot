import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getContactById } from "@/actions/ecosystem";
import { CONTACT_TYPES, WARMTH_SCORES, SECTOR_LABELS, STAGE_LABEL_MAP, FUNDING_STAGE_LABELS } from "@/lib/constants";
import {
  Mail,
  Phone,
  Linkedin,
  Building2,
  ArrowLeft,
  Activity,
  Handshake,
  Calendar,
  AlertCircle,
  Users,
  Video,
  MapPin,
  ArrowUpRight,
  Bell,
} from "lucide-react";
import { format, formatDistanceToNow, isPast, differenceInDays } from "date-fns";
import { LogInteractionDialog } from "@/components/ecosystem/log-interaction-dialog";

type Props = {
  params: Promise<{ id: string }>;
};

interface ActivityMeta {
  interactionType?: string;
  meetingFormat?: string;
  meetingDate?: string;
  attendees?: string;
  followUpNote?: string;
  followUpDueAt?: string;
}

function parseMeta(metadata: unknown): ActivityMeta {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return {};
  return metadata as ActivityMeta;
}

function getWarmthBadge(warmth: string) {
  const config = WARMTH_SCORES.find((w) => w.key === warmth);
  const colorMap: Record<string, string> = {
    HOT: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
    WARM: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
    COLD: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
  };
  return (
    <Badge variant="outline" className={colorMap[warmth] || ""}>
      {config?.label || warmth}
    </Badge>
  );
}

function getTypeBadge(type: string) {
  const label = CONTACT_TYPES.find((t) => t.key === type)?.label || type;
  return <Badge variant="secondary">{label}</Badge>;
}

const INTERACTION_TYPE_LABELS: Record<string, string> = {
  MEETING: "Meeting",
  CALL: "Call",
  EMAIL: "Email",
  NOTE: "Note",
  WHATSAPP: "WhatsApp",
  INTERACTION: "Interaction",
  CONTACT_CREATED: "Contact added",
};

const INTERACTION_TYPE_COLORS: Record<string, string> = {
  MEETING: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  CALL: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  EMAIL: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  NOTE: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  WHATSAPP: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  INTERACTION: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  CONTACT_CREATED: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
};

const FORMAT_ICONS: Record<string, React.ReactNode> = {
  IN_PERSON: <MapPin className="h-3 w-3" />,
  VIDEO: <Video className="h-3 w-3" />,
  PHONE: <Phone className="h-3 w-3" />,
};

const FORMAT_LABELS: Record<string, string> = {
  IN_PERSON: "In-person",
  VIDEO: "Video call",
  PHONE: "Phone",
};

const DEAL_STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  DRAFT: "bg-gray-100 text-gray-600",
  ON_HOLD: "bg-amber-100 text-amber-700",
  PASSED: "bg-red-100 text-red-700",
  CLOSED_WON: "bg-green-100 text-green-700",
  CLOSED_LOST: "bg-gray-100 text-gray-500",
};

export default async function ContactDetailPage({ params }: Props) {
  const { id } = await params;

  let contact;
  try {
    contact = await getContactById(id);
  } catch {
    // DB not connected
  }

  if (!contact) return notFound();

  // Find next upcoming follow-up
  const now = new Date();
  const upcomingFollowUps = contact.activities
    .map((a) => ({ activity: a, meta: parseMeta(a.metadata) }))
    .filter(({ meta }) => meta.followUpDueAt && !isPast(new Date(meta.followUpDueAt)))
    .sort((a, b) =>
      new Date(a.meta.followUpDueAt!).getTime() - new Date(b.meta.followUpDueAt!).getTime()
    );

  const nextFollowUp = upcomingFollowUps[0] ?? null;
  const overdueFollowUps = contact.activities
    .map((a) => ({ activity: a, meta: parseMeta(a.metadata) }))
    .filter(({ meta }) => meta.followUpDueAt && isPast(new Date(meta.followUpDueAt)));

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/ecosystem"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Ecosystem
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-display text-2xl font-semibold tracking-tight">{contact.name}</h1>
            {getTypeBadge(contact.type)}
            {getWarmthBadge(contact.warmthScore)}
          </div>
          {contact.organization && (
            <p className="text-muted-foreground mt-1 flex items-center gap-1.5">
              <Building2 className="h-4 w-4 shrink-0" />
              {contact.organization}
            </p>
          )}
          {/* Contact action buttons */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {contact.email && (
              <Button size="sm" variant="outline" asChild>
                <a href={`mailto:${contact.email}`}>
                  <Mail className="h-3.5 w-3.5 mr-1.5" />
                  {contact.email}
                </a>
              </Button>
            )}
            {contact.phone && (
              <Button size="sm" variant="outline" asChild>
                <a href={`tel:${contact.phone}`}>
                  <Phone className="h-3.5 w-3.5 mr-1.5" />
                  {contact.phone}
                </a>
              </Button>
            )}
            {contact.linkedin && (
              <Button size="sm" variant="outline" asChild>
                <a href={contact.linkedin} target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-3.5 w-3.5 mr-1.5" />
                  LinkedIn
                  <ArrowUpRight className="h-3 w-3 ml-1 opacity-60" />
                </a>
              </Button>
            )}
          </div>
        </div>
        <LogInteractionDialog contactId={contact.id} />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="font-display text-2xl font-semibold tabular-nums">
                {contact.interactionCount}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total Interactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Handshake className="h-4 w-4 text-muted-foreground" />
              <span className="font-display text-2xl font-semibold tabular-nums">
                {contact.referredDeals.length}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Deals Sourced</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {contact.lastInteractionAt
                  ? formatDistanceToNow(contact.lastInteractionAt, { addSuffix: true })
                  : "Never"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Last Interaction</p>
          </CardContent>
        </Card>
      </div>

      {/* Overdue follow-ups alert */}
      {overdueFollowUps.length > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800 px-4 py-3">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-red-800 dark:text-red-300">
              {overdueFollowUps.length} overdue follow-up{overdueFollowUps.length > 1 ? "s" : ""}
            </p>
            {overdueFollowUps.slice(0, 2).map(({ activity, meta }) => (
              <p key={activity.id} className="text-red-700 dark:text-red-400 mt-0.5">
                {meta.followUpNote} —{" "}
                <span className="font-medium">
                  due {format(new Date(meta.followUpDueAt!), "MMM d")}
                </span>
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Next follow-up (upcoming) */}
      {nextFollowUp && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800 px-4 py-3">
          <Bell className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-amber-800 dark:text-amber-300">
              Next follow-up:{" "}
              {format(new Date(nextFollowUp.meta.followUpDueAt!), "MMM d, yyyy")}
              {" "}
              <span className="font-normal text-amber-700 dark:text-amber-400">
                ({differenceInDays(new Date(nextFollowUp.meta.followUpDueAt!), now)} days)
              </span>
            </p>
            <p className="text-amber-700 dark:text-amber-400 mt-0.5">
              {nextFollowUp.meta.followUpNote}
            </p>
          </div>
        </div>
      )}

      {/* Sector expertise */}
      {contact.sectorExpertise.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Sector expertise:</span>
          {contact.sectorExpertise.map((s) => (
            <Badge key={s} variant="outline">
              {SECTOR_LABELS[s] || s}
            </Badge>
          ))}
        </div>
      )}

      {contact.coInvestmentHistory && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Co-Investment History</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{contact.coInvestmentHistory}</p>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Tabs */}
      <Tabs defaultValue="interactions">
        <TabsList>
          <TabsTrigger value="interactions">
            Activity ({contact.activities.length})
          </TabsTrigger>
          <TabsTrigger value="deals">
            Deals Sourced ({contact.referredDeals.length})
          </TabsTrigger>
        </TabsList>

        {/* Activity Timeline */}
        <TabsContent value="interactions" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Activity Timeline</CardTitle>
                <LogInteractionDialog contactId={contact.id} />
              </div>
            </CardHeader>
            <CardContent>
              {contact.activities.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No interactions yet. Log your first interaction to start tracking.
                </p>
              ) : (
                <div className="space-y-4">
                  {contact.activities.map((activity) => {
                    const meta = parseMeta(activity.metadata);
                    const typeKey = meta.interactionType ?? activity.type;
                    const typeLabel = INTERACTION_TYPE_LABELS[typeKey] ?? typeKey;
                    const typeColor = INTERACTION_TYPE_COLORS[typeKey] ?? INTERACTION_TYPE_COLORS.NOTE;
                    const displayDate = meta.meetingDate
                      ? new Date(meta.meetingDate)
                      : activity.createdAt;

                    return (
                      <div key={activity.id} className="flex gap-3 text-sm">
                        <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                        <div className="min-w-0 flex-1">
                          {/* Type badge + date */}
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${typeColor}`}
                            >
                              {typeLabel}
                            </span>
                            {meta.meetingFormat && (
                              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                {FORMAT_ICONS[meta.meetingFormat]}
                                {FORMAT_LABELS[meta.meetingFormat] ?? meta.meetingFormat}
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {format(displayDate, "MMM d, yyyy · h:mm a")}
                            </span>
                          </div>

                          <p className="font-medium">{activity.title}</p>

                          {/* Attendees */}
                          {meta.attendees && (
                            <p className="text-muted-foreground mt-0.5 flex items-center gap-1">
                              <Users className="h-3 w-3 shrink-0" />
                              {meta.attendees}
                            </p>
                          )}

                          {/* Notes */}
                          {activity.description && (
                            <p className="text-muted-foreground mt-1">{activity.description}</p>
                          )}

                          {/* Follow-up */}
                          {meta.followUpNote && (
                            <div
                              className={`mt-2 flex items-start gap-1.5 text-xs rounded px-2 py-1.5 ${
                                meta.followUpDueAt && isPast(new Date(meta.followUpDueAt))
                                  ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                                  : "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                              }`}
                            >
                              <Bell className="h-3 w-3 mt-0.5 shrink-0" />
                              <span>
                                <span className="font-medium">Follow-up:</span> {meta.followUpNote}
                                {meta.followUpDueAt && (
                                  <span className="ml-1 opacity-75">
                                    · due {format(new Date(meta.followUpDueAt), "MMM d")}
                                  </span>
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deals Sourced */}
        <TabsContent value="deals" className="mt-4">
          {contact.referredDeals.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Handshake className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground">No deals sourced from this contact yet.</p>
                <p className="text-xs text-muted-foreground mt-1">
                  When you add a deal and mark this person as the referrer, it will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {contact.referredDeals.map((deal) => (
                <Link key={deal.id} href={`/deals/${deal.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{deal.companyName}</p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            {deal.stage && (
                              <Badge variant="outline" className="text-xs">
                                {STAGE_LABEL_MAP[deal.stage] ?? deal.stage}
                              </Badge>
                            )}
                            {deal.sector && (
                              <Badge variant="secondary" className="text-xs">
                                {SECTOR_LABELS[deal.sector] ?? deal.sector}
                              </Badge>
                            )}
                            {deal.fundingStage && (
                              <span className="text-xs text-muted-foreground">
                                {FUNDING_STAGE_LABELS[deal.fundingStage] ?? deal.fundingStage}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          {deal.status && (
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                DEAL_STATUS_COLORS[deal.status] ?? ""
                              }`}
                            >
                              {deal.status.replace("_", " ")}
                            </span>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(deal.createdAt, "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
