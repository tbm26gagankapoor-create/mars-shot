import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FileText, ExternalLink } from "lucide-react";

const DOC_TYPE_LABELS: Record<string, string> = {
  PITCH_DECK: "Pitch Deck",
  ONE_PAGER: "One Pager",
  DD_MATERIAL: "DD Material",
  PARTNER_BRIEF: "Partner Brief",
  TERM_SHEET: "Term Sheet",
  OTHER: "Other",
};

interface Doc {
  id: string;
  name: string;
  type: string;
  storagePath: string;
  fileSize: number | null;
  createdAt: Date | string;
}

interface DocumentsListProps {
  documents: Doc[];
}

export function DocumentsList({ documents }: DocumentsListProps) {
  if (documents.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No documents"
        description="No documents have been linked to this portfolio company yet."
      />
    );
  }

  return (
    <div className="space-y-2">
      {documents.map((doc) => (
        <Card key={doc.id}>
          <CardContent className="flex items-center justify-between py-3 px-4">
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{doc.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="secondary" className="text-[10px]">
                    {DOC_TYPE_LABELS[doc.type] ?? doc.type}
                  </Badge>
                  {doc.fileSize && (
                    <span className="text-[11px] text-muted-foreground">
                      {(doc.fileSize / 1024).toFixed(0)} KB
                    </span>
                  )}
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <a
              href={doc.storagePath}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
