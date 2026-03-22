import { getEmailTemplates } from "@/actions/email-templates";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, Mail, Star, Code } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

const typeColors: Record<string, string> = {
  OUTREACH: "bg-primary/10 text-primary",
  FOLLOW_UP: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  REJECTION: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  TERM_SHEET: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  INTRO: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  CUSTOM: "bg-muted text-muted-foreground",
};

function countMergeVariables(text: string): number {
  const matches = text.match(/\{\{[^}]+\}\}/g);
  return matches ? new Set(matches).size : 0;
}

export default async function EmailTemplatesPage() {
  let templates: Awaited<ReturnType<typeof getEmailTemplates>> = [];

  try {
    templates = await getEmailTemplates();
  } catch {
    // DB not connected yet
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Email Templates
          </h1>
          <p className="text-muted-foreground">
            Reusable templates with merge variables for deal communications
          </p>
        </div>
        <Link href="/email-templates/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            New Template
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-display text-2xl font-semibold tabular-nums">{templates.length}</p>
                <p className="text-xs text-muted-foreground">
                  Total Templates
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Star className="h-5 w-5 text-primary" />
              <div>
                <p className="font-display text-2xl font-semibold tabular-nums">
                  {templates.filter((t) => t.isDefault).length}
                </p>
                <p className="text-xs text-muted-foreground">Defaults</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Code className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-display text-2xl font-semibold tabular-nums">
                  {new Set(templates.map((t) => t.type)).size}
                </p>
                <p className="text-xs text-muted-foreground">Types</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-display font-medium">No email templates yet</p>
            <p className="text-xs text-muted-foreground">
              Create one to get started
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => {
            const mergeVarCount =
              countMergeVariables(template.subject) +
              countMergeVariables(template.body);

            return (
              <Link
                key={template.id}
                href={`/email-templates/${template.id}`}
              >
                <Card className="hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">
                          {template.name}
                        </CardTitle>
                        {template.isDefault && (
                          <Star className="h-3 w-3 text-primary fill-primary" />
                        )}
                      </div>
                      <Badge
                        className={
                          typeColors[template.type] ||
                          "bg-gray-100 text-gray-800"
                        }
                      >
                        {template.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Subject</span>
                      <p className="font-medium truncate">
                        {template.subject}
                      </p>
                    </div>

                    <p className="text-muted-foreground line-clamp-2">
                      {template.body.replace(/\{\{[^}]+\}\}/g, "[...]")}
                    </p>

                    <Separator />

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {mergeVarCount} merge variable
                        {mergeVarCount !== 1 ? "s" : ""}
                      </span>
                      <span>
                        Updated{" "}
                        {formatDistanceToNow(template.updatedAt, {
                          addSuffix: true,
                        })}
                      </span>
                    </div>

                    {template.forStage && (
                      <Badge variant="outline" className="text-xs">
                        Stage: {template.forStage}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
