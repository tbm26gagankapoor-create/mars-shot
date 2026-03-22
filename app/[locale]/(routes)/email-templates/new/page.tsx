"use client";

import { TemplateForm } from "@/components/email-templates/template-form";

export default function NewEmailTemplatePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          New Email Template
        </h1>
        <p className="text-muted-foreground">
          Create a reusable email template with merge variables
        </p>
      </div>

      <TemplateForm />
    </div>
  );
}
