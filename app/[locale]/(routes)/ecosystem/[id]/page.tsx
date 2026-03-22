import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getContactById } from "@/actions/ecosystem";
import { CONTACT_TYPES, WARMTH_SCORES, SECTOR_LABELS } from "@/lib/constants";
import {
  Mail,
  Phone,
  Linkedin,
  Building2,
  ArrowLeft,
  Activity,
  Handshake,
  Calendar,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { LogInteractionDialog } from "@/components/ecosystem/log-interaction-dialog";

type Props = {
  params: Promise<{ id: string }>;
};

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

export default async function ContactDetailPage({ params }: Props) {
  const { id } = await params;

  let contact;
  try {
    contact = await getContactById(id);
  } catch {
    // DB not connected
  }

  if (!contact) return notFound();

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
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-semibold tracking-tight">{contact.name}</h1>
            {getTypeBadge(contact.type)}
            {getWarmthBadge(contact.warmthScore)}
          </div>
          {contact.organization && (
            <p className="text-muted-foreground mt-1 flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              {contact.organization}
            </p>
          )}
          {/* Contact links */}
          <div className="flex items-center gap-4 mt-2">
            {contact.email && (
              <a
                href={`mailto:${contact.email}`}
                className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
              >
                <Mail className="h-3.5 w-3.5" />
                {contact.email}
              </a>
            )}
            {contact.phone && (
              <a
                href={`tel:${contact.phone}`}
                className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
              >
                <Phone className="h-3.5 w-3.5" />
                {contact.phone}
              </a>
            )}
            {contact.linkedin && (
              <a
                href={contact.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
              >
                <Linkedin className="h-3.5 w-3.5" />
                LinkedIn
              </a>
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
              <span className="font-display text-2xl font-semibold tabular-nums">{contact.interactionCount}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total Interactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Handshake className="h-4 w-4 text-muted-foreground" />
              <span className="font-display text-2xl font-semibold tabular-nums">{contact.dealSourceCount}</span>
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

      {/* Tabs: Interaction Log + Deals Sourced */}
      <Tabs defaultValue="interactions">
        <TabsList>
          <TabsTrigger value="interactions">
            Interaction Log ({contact.activities.length})
          </TabsTrigger>
          <TabsTrigger value="deals">Deals Sourced</TabsTrigger>
        </TabsList>

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
                <div className="space-y-3">
                  {contact.activities.map((activity) => (
                    <div key={activity.id} className="flex gap-3 text-sm">
                      <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium">{activity.title}</p>
                        {activity.description && (
                          <p className="text-muted-foreground mt-0.5">
                            {activity.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(activity.createdAt, "MMM d, yyyy h:mm a")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deals" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Deals Sourced</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-8">
                Deal sourcing tracking will link deals back to this contact.
                {contact.dealSourceCount > 0
                  ? ` ${contact.dealSourceCount} deal${contact.dealSourceCount !== 1 ? "s" : ""} attributed.`
                  : " No deals sourced yet."}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
