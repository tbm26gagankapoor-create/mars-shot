"use server";

import { prismadb as prisma } from "@/lib/prisma";
import type { EmailTemplateType } from "@prisma/client";

// ─── Types ──────────────────────────────────────────────

export type CreateEmailTemplateInput = {
  name: string;
  type?: EmailTemplateType;
  subject: string;
  body: string;
  isDefault?: boolean;
  forStage?: string;
};

export type UpdateEmailTemplateInput = Partial<CreateEmailTemplateInput>;

// ─── Merge Variables ────────────────────────────────────

const MERGE_VARIABLES = [
  { key: "companyName", label: "Company Name", source: "deal" },
  { key: "founderName", label: "Founder Name", source: "deal.founders[0]" },
  { key: "founderEmail", label: "Founder Email", source: "deal.founders[0]" },
  { key: "sector", label: "Sector", source: "deal" },
  { key: "fundingStage", label: "Funding Stage", source: "deal" },
  { key: "chequeSize", label: "Cheque Size", source: "deal" },
  { key: "stage", label: "Pipeline Stage", source: "deal" },
  { key: "senderName", label: "Sender Name", source: "user" },
  { key: "contactName", label: "Contact Name", source: "contact" },
  { key: "contactOrg", label: "Contact Organization", source: "contact" },
  { key: "portfolioCompany", label: "Portfolio Company", source: "portfolio" },
  { key: "today", label: "Today's Date", source: "system" },
] as const;

export async function getAvailableMergeVariables() {
  return MERGE_VARIABLES.map((v) => ({
    key: v.key,
    label: v.label,
    placeholder: `{{${v.key}}}`,
  }));
}

// ─── CRUD ───────────────────────────────────────────────

export async function getEmailTemplates(filters?: {
  type?: EmailTemplateType;
}) {
  return prisma.emailTemplate.findMany({
    where: {
      ...(filters?.type && { type: filters.type }),
    },
    orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
  });
}

export async function getEmailTemplateById(id: string) {
  return prisma.emailTemplate.findUnique({ where: { id } });
}

export async function createEmailTemplate(input: CreateEmailTemplateInput) {
  // If setting as default, unset other defaults for this type
  if (input.isDefault && input.type) {
    await prisma.emailTemplate.updateMany({
      where: { type: input.type, isDefault: true },
      data: { isDefault: false },
    });
  }

  return prisma.emailTemplate.create({
    data: {
      name: input.name,
      type: input.type || "CUSTOM",
      subject: input.subject,
      body: input.body,
      isDefault: input.isDefault || false,
      forStage: input.forStage,
    },
  });
}

export async function updateEmailTemplate(
  id: string,
  input: UpdateEmailTemplateInput
) {
  if (input.isDefault && input.type) {
    await prisma.emailTemplate.updateMany({
      where: { type: input.type, isDefault: true, id: { not: id } },
      data: { isDefault: false },
    });
  }

  return prisma.emailTemplate.update({
    where: { id },
    data: input,
  });
}

export async function deleteEmailTemplate(id: string) {
  await prisma.emailTemplate.delete({ where: { id } });
}

// ─── Template Rendering ─────────────────────────────────

export async function renderTemplate(
  templateId: string,
  variables: Record<string, string>
) {
  const template = await prisma.emailTemplate.findUnique({
    where: { id: templateId },
  });
  if (!template) throw new Error("Template not found");

  let subject = template.subject;
  let body = template.body;

  // Add system variables
  const allVars = {
    ...variables,
    today: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  };

  // Replace {{variable}} placeholders
  for (const [key, value] of Object.entries(allVars)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    subject = subject.replace(regex, value);
    body = body.replace(regex, value);
  }

  return { subject, body };
}

// ─── Stage Defaults ─────────────────────────────────────

export async function getDefaultTemplateForStage(stage: string) {
  return prisma.emailTemplate.findFirst({
    where: {
      OR: [
        { forStage: stage, isDefault: true },
        { forStage: stage },
      ],
    },
    orderBy: { isDefault: "desc" },
  });
}
