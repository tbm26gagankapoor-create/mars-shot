import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getContacts, getColdContacts } from "@/actions/ecosystem";
import { CONTACT_TYPES, WARMTH_SCORES, SECTOR_LABELS } from "@/lib/constants";
import { AlertTriangle, Users, Building2, Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { AddContactDialog } from "@/components/ecosystem/add-contact-dialog";

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

export default async function EcosystemPage() {
  let contacts: Awaited<ReturnType<typeof getContacts>> = [];
  let coldContacts: Awaited<ReturnType<typeof getColdContacts>> = [];

  try {
    [contacts, coldContacts] = await Promise.all([
      getContacts(),
      getColdContacts(),
    ]);
  } catch {
    // DB not connected — render empty state
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Ecosystem</h1>
          <p className="text-muted-foreground">
            VCs, co-investors, operators — warmth-scored relationships
          </p>
        </div>
        <AddContactDialog />
      </div>

      {/* Cold contacts alert */}
      {coldContacts.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800 px-4 py-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
          <div className="text-sm">
            <span className="font-medium text-amber-800 dark:text-amber-400">
              {coldContacts.length} cold contact{coldContacts.length !== 1 ? "s" : ""}
            </span>{" "}
            <span className="text-amber-700 dark:text-amber-300">
              — needs outreach to maintain relationships
            </span>
          </div>
        </div>
      )}

      {/* Contact List */}
      {contacts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3">
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-display font-medium">No contacts yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Add your first VC, co-investor, or operator to get started
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Contacts ({contacts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0 divide-y">
              {contacts.map((contact) => (
                <Link
                  key={contact.id}
                  href={`/ecosystem/${contact.id}`}
                  className="flex items-center justify-between py-3 px-2 -mx-2 rounded-md hover:bg-muted/50 transition-colors group first:pt-0"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Name + org */}
                    <div className="min-w-0">
                      <p className="font-medium truncate group-hover:text-primary transition-colors">
                        {contact.name}
                      </p>
                      {contact.organization && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 truncate">
                          <Building2 className="h-3 w-3 shrink-0" />
                          {contact.organization}
                        </p>
                      )}
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-2 shrink-0">
                      {getTypeBadge(contact.type)}
                      {getWarmthBadge(contact.warmthScore)}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-muted-foreground shrink-0 ml-4">
                    {/* Sector tags */}
                    {contact.sectorExpertise.length > 0 && (
                      <div className="hidden md:flex items-center gap-1">
                        {contact.sectorExpertise.slice(0, 3).map((s) => (
                          <Badge key={s} variant="outline" className="text-xs font-normal">
                            {SECTOR_LABELS[s] || s}
                          </Badge>
                        ))}
                        {contact.sectorExpertise.length > 3 && (
                          <span className="text-xs">+{contact.sectorExpertise.length - 3}</span>
                        )}
                      </div>
                    )}

                    {/* Interaction count */}
                    <span className="hidden sm:flex items-center gap-1" title="Interactions">
                      <Activity className="h-3 w-3" />
                      {contact._count.activities}
                    </span>

                    {/* Last interaction */}
                    <span className="text-xs whitespace-nowrap w-24 text-right">
                      {contact.lastInteractionAt
                        ? formatDistanceToNow(contact.lastInteractionAt, { addSuffix: true })
                        : "No interactions"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
