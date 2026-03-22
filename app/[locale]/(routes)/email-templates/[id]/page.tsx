import { notFound } from "next/navigation";
import { getEmailTemplateById } from "@/actions/email-templates";
import { TemplateForm } from "@/components/email-templates/template-form";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditEmailTemplatePage({ params }: Props) {
  const { id } = await params;

  let template;
  try {
    template = await getEmailTemplateById(id);
  } catch {
    // DB not connected
  }

  if (!template) return notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Edit: {template.name}
        </h1>
        <p className="text-muted-foreground">
          Update template content and preview with sample data
        </p>
      </div>

      <TemplateForm
        templateId={template.id}
        defaultValues={{
          name: template.name,
          type: template.type,
          subject: template.subject,
          body: template.body,
          isDefault: template.isDefault,
          forStage: template.forStage || undefined,
        }}
      />
    </div>
  );
}
