"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  createEmailTemplate,
  updateEmailTemplate,
  getAvailableMergeVariables,
} from "@/actions/email-templates";
import { DEAL_STAGES } from "@/lib/constants";
import { TemplatePreview } from "@/components/email-templates/template-preview";
import { MergeVariablePicker } from "@/components/email-templates/merge-variable-picker";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const TEMPLATE_TYPES = [
  { key: "OUTREACH", label: "Outreach" },
  { key: "FOLLOW_UP", label: "Follow Up" },
  { key: "REJECTION", label: "Rejection" },
  { key: "TERM_SHEET", label: "Term Sheet" },
  { key: "INTRO", label: "Introduction" },
  { key: "CUSTOM", label: "Custom" },
];

type TemplateFormProps = {
  templateId?: string;
  defaultValues?: {
    name: string;
    type: string;
    subject: string;
    body: string;
    isDefault: boolean;
    forStage?: string;
  };
};

type MergeVariable = {
  key: string;
  label: string;
  placeholder: string;
};

export function TemplateForm({ templateId, defaultValues }: TemplateFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(defaultValues?.name || "");
  const [type, setType] = useState(defaultValues?.type || "CUSTOM");
  const [subject, setSubject] = useState(defaultValues?.subject || "");
  const [body, setBody] = useState(defaultValues?.body || "");
  const [isDefault, setIsDefault] = useState(defaultValues?.isDefault || false);
  const [forStage, setForStage] = useState(defaultValues?.forStage || "");
  const [mergeVariables, setMergeVariables] = useState<MergeVariable[]>([]);
  const [activeField, setActiveField] = useState<"subject" | "body">("body");

  const subjectRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    async function loadVariables() {
      try {
        const vars = await getAvailableMergeVariables();
        setMergeVariables(vars);
      } catch {
        // Fallback
      }
    }
    loadVariables();
  }, []);

  function handleInsertVariable(placeholder: string) {
    if (activeField === "subject") {
      const input = subjectRef.current;
      if (input) {
        const start = input.selectionStart ?? subject.length;
        const end = input.selectionEnd ?? subject.length;
        const newValue =
          subject.substring(0, start) + placeholder + subject.substring(end);
        setSubject(newValue);
        // Restore cursor position after React re-render
        setTimeout(() => {
          input.focus();
          input.setSelectionRange(
            start + placeholder.length,
            start + placeholder.length
          );
        }, 0);
      }
    } else {
      const textarea = bodyRef.current;
      if (textarea) {
        const start = textarea.selectionStart ?? body.length;
        const end = textarea.selectionEnd ?? body.length;
        const newValue =
          body.substring(0, start) + placeholder + body.substring(end);
        setBody(newValue);
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(
            start + placeholder.length,
            start + placeholder.length
          );
        }, 0);
      }
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      if (templateId) {
        await updateEmailTemplate(templateId, {
          name,
          type: type as never,
          subject,
          body,
          isDefault,
          forStage: forStage || undefined,
        });
        toast.success("Template updated");
        router.refresh();
      } else {
        const template = await createEmailTemplate({
          name,
          type: type as never,
          subject,
          body,
          isDefault,
          forStage: forStage || undefined,
        });
        toast.success(`Template "${template.name}" created`);
        router.push(`/email-templates/${template.id}`);
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save template"
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const isEditing = !!templateId;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Form */}
        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Template Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Initial Outreach"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {TEMPLATE_TYPES.map((t) => (
                        <SelectItem key={t.key} value={t.key}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="forStage">For Pipeline Stage</Label>
                  <Select value={forStage} onValueChange={setForStage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none">Any stage</SelectItem>
                      {DEAL_STAGES.map((s) => (
                        <SelectItem key={s.key} value={s.key}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isDefault"
                  checked={isDefault}
                  onCheckedChange={(checked) => setIsDefault(checked === true)}
                />
                <Label htmlFor="isDefault">
                  Set as default for this type
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  ref={subjectRef}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  onFocus={() => setActiveField("subject")}
                  required
                  placeholder="Re: {{companyName}} — Partnership Opportunity"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="body">Body *</Label>
                <Textarea
                  id="body"
                  ref={bodyRef}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  onFocus={() => setActiveField("body")}
                  required
                  rows={12}
                  placeholder="Hi {{founderName}},&#10;&#10;I came across {{companyName}} and..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Merge Variables */}
          <MergeVariablePicker
            variables={mergeVariables}
            onInsert={handleInsertVariable}
            activeField={activeField}
          />
        </div>

        {/* Right: Live Preview */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <TemplatePreview subject={subject} body={body} />
        </div>
      </div>

      <Separator />

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading
            ? "Saving..."
            : isEditing
              ? "Update Template"
              : "Create Template"}
        </Button>
      </div>
    </form>
  );
}
