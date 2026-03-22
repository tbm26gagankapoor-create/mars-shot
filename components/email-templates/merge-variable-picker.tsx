"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code } from "lucide-react";

type MergeVariable = {
  key: string;
  label: string;
  placeholder: string;
};

type MergeVariablePickerProps = {
  variables: MergeVariable[];
  onInsert: (placeholder: string) => void;
  activeField: "subject" | "body";
};

export function MergeVariablePicker({
  variables,
  onInsert,
  activeField,
}: MergeVariablePickerProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Code className="h-4 w-4" />
          Merge Variables
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Click to insert into the{" "}
          <span className="font-medium">{activeField}</span> field at cursor
          position
        </p>
      </CardHeader>
      <CardContent>
        {variables.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Loading variables...
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {variables.map((variable) => (
              <Badge
                key={variable.key}
                variant="outline"
                className="cursor-pointer hover:bg-primary/10 transition-colors px-3 py-1"
                onClick={() => onInsert(variable.placeholder)}
              >
                <span className="font-mono text-xs mr-1">
                  {variable.placeholder}
                </span>
                <span className="text-muted-foreground text-xs">
                  {variable.label}
                </span>
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
