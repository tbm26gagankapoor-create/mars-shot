"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Eye } from "lucide-react";

const SAMPLE_DATA: Record<string, string> = {
  companyName: "Acme Corp",
  founderName: "Jane Smith",
  founderEmail: "jane@acme.com",
  sector: "Fintech",
  fundingStage: "Series A",
  chequeSize: "$500K",
  stage: "Active DD",
  senderName: "Gagan Kapoor",
  contactName: "John Doe",
  contactOrg: "Partner Fund",
  portfolioCompany: "TechStart Inc",
  today: new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }),
};

type TemplatePreviewProps = {
  subject: string;
  body: string;
};

function renderWithVariables(text: string): string {
  let rendered = text;
  for (const [key, value] of Object.entries(SAMPLE_DATA)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    rendered = rendered.replace(regex, value);
  }
  return rendered;
}

function highlightUnresolved(text: string): React.ReactNode[] {
  const parts = text.split(/(\{\{[^}]+\}\})/g);
  return parts.map((part, i) => {
    if (/^\{\{[^}]+\}\}$/.test(part)) {
      return (
        <span
          key={i}
          className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 px-1 rounded text-xs font-mono"
        >
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function TemplatePreview({ subject, body }: TemplatePreviewProps) {
  const renderedSubject = renderWithVariables(subject);
  const renderedBody = renderWithVariables(body);

  // Check for unresolved variables
  const unresolvedInSubject = (renderedSubject.match(/\{\{[^}]+\}\}/g) || []);
  const unresolvedInBody = (renderedBody.match(/\{\{[^}]+\}\}/g) || []);
  const hasUnresolved =
    unresolvedInSubject.length > 0 || unresolvedInBody.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Live Preview
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Variables are replaced with sample data
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {!subject && !body ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Start typing to see a live preview
          </p>
        ) : (
          <>
            {/* Rendered Subject */}
            {subject && (
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wide">
                  Subject
                </span>
                <p className="font-medium mt-1">
                  {highlightUnresolved(renderedSubject)}
                </p>
              </div>
            )}

            <Separator />

            {/* Rendered Body */}
            {body && (
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wide">
                  Body
                </span>
                <div className="mt-2 text-sm whitespace-pre-wrap leading-relaxed rounded border p-4 bg-muted/20">
                  {highlightUnresolved(renderedBody)}
                </div>
              </div>
            )}

            {/* Unresolved warning */}
            {hasUnresolved && (
              <>
                <Separator />
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="text-yellow-700 border-yellow-300"
                  >
                    {unresolvedInSubject.length + unresolvedInBody.length}{" "}
                    unresolved variable
                    {unresolvedInSubject.length + unresolvedInBody.length !== 1
                      ? "s"
                      : ""}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Highlighted in yellow above
                  </span>
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
