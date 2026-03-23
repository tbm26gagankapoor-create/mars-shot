import { Badge } from "@/components/ui/badge";

interface CoInvestorsTagsProps {
  coInvestors: string[];
}

export function CoInvestorsTags({ coInvestors }: CoInvestorsTagsProps) {
  if (coInvestors.length === 0) return null;

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1.5">Co-investors</p>
      <div className="flex flex-wrap gap-1.5">
        {coInvestors.map((name) => (
          <Badge key={name} variant="secondary" className="text-xs">
            {name}
          </Badge>
        ))}
      </div>
    </div>
  );
}
