import Link from "next/link";
import { UserMinus, Award, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type CoolingContact = {
  id: string;
  name: string;
  organization: string | null;
  daysSinceContact: number | null;
};

type TopReferrer = {
  id: string;
  name: string;
  organization: string | null;
  dealSourceCount: number;
};

export function NetworkPulse({
  coolingContacts,
  topReferrers,
}: {
  coolingContacts: CoolingContact[];
  topReferrers: TopReferrer[];
}) {
  const hasContent = coolingContacts.length > 0 || topReferrers.length > 0;

  if (!hasContent) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <p className="text-sm text-muted-foreground">
          Network data will appear as you log interactions
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {coolingContacts.length > 0 && (
        <div>
          <div className="inline-flex items-center gap-1.5 mb-2.5 rounded-md bg-yellow-500/10 px-2 py-1">
            <UserMinus className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-400" />
            <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-300">
              Going cold
            </p>
          </div>
          <ul className="space-y-1">
            {coolingContacts.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/ecosystem/${c.id}`}
                  className="group flex items-center justify-between rounded-lg px-2.5 py-2 hover:bg-muted/50 transition-all duration-150"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{c.name}</p>
                    {c.organization && (
                      <p className="text-xs text-muted-foreground truncate">
                        {c.organization}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant="warning"
                    className="text-[10px] shrink-0"
                  >
                    {c.daysSinceContact}d ago
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {topReferrers.length > 0 && (
        <div>
          <div className="inline-flex items-center gap-1.5 mb-2.5 rounded-md bg-primary/10 px-2 py-1">
            <Award className="h-3.5 w-3.5 text-primary" />
            <p className="text-xs font-semibold text-primary">
              Top referrers
            </p>
          </div>
          <ul className="space-y-1">
            {topReferrers.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/ecosystem/${r.id}`}
                  className="group flex items-center justify-between rounded-lg px-2.5 py-2 hover:bg-muted/50 transition-all duration-150"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{r.name}</p>
                    {r.organization && (
                      <p className="text-xs text-muted-foreground truncate">
                        {r.organization}
                      </p>
                    )}
                  </div>
                  <Badge variant="secondary" className="text-[10px] shrink-0">
                    {r.dealSourceCount} deal{r.dealSourceCount > 1 ? "s" : ""}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
