import Cerebras from "@cerebras/cerebras_cloud_sdk";

// Cerebras Cloud SDK — Llama 3.1 70B
// Free tier: 1M tokens/day
const cerebras = new Cerebras({
  apiKey: process.env.CEREBRAS_API_KEY,
});

export type AIExtractionResult = {
  companyName: string;
  website?: string;
  sector?: string;
  fundingStage?: string;
  chequeSize?: number;
  founders: { name: string; email?: string; phone?: string; linkedin?: string; title?: string }[];
  source?: string;
  sourceType?: string;
  summary?: string;
  confidence: number;
};

/**
 * Extract deal data from raw text (pasted lead, email body, WhatsApp message)
 */
export async function extractDealFromText(rawText: string): Promise<AIExtractionResult> {
  const response = await cerebras.chat.completions.create({
    model: "llama-3.3-70b",
    messages: [
      {
        role: "system",
        content: `You are a deal extraction AI for Mars Shot, an early-stage VC firm. Extract structured deal information from raw text. Return valid JSON only, no markdown.

JSON schema:
{
  "companyName": "string (required)",
  "website": "string or null",
  "sector": "one of: SAAS, FINTECH, D2C, CONSUMER, AI, HEALTHTECH, OTHER",
  "fundingStage": "one of: PRE_SEED, SEED, SERIES_A, OTHER",
  "chequeSize": "number in USD or null",
  "founders": [{"name": "string", "email": "string or null", "phone": "string or null", "linkedin": "string or null", "title": "string or null"}],
  "source": "who referred this deal (string or null)",
  "sourceType": "one of: INBOUND, VC_FORWARD, COLD_DM, RAZORPAY_NETWORK, EMAIL_FORWARD, OTHER",
  "summary": "1-2 sentence summary of the opportunity",
  "confidence": "0-100 integer, how confident you are in the extraction"
}`,
      },
      {
        role: "user",
        content: rawText,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.1,
    max_completion_tokens: 1024,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content = (response as any).choices?.[0]?.message?.content;
  if (!content) throw new Error("No AI response received");

  return JSON.parse(content) as AIExtractionResult;
}

/**
 * Generate a one-pager summary for partner review
 */
export async function generateOnePager(dealData: {
  companyName: string;
  sector: string;
  fundingStage: string;
  chequeSize?: number;
  founders: { name: string; title?: string }[];
  summary?: string;
  callNotes?: string;
  deckSummary?: string;
}): Promise<string> {
  const response = await cerebras.chat.completions.create({
    model: "llama-3.3-70b",
    messages: [
      {
        role: "system",
        content: `You are a VC analyst AI for Mars Shot (Razorpay founders' personal investment arm, $25K-$100K pre-seed/seed cheques). Generate a concise one-pager for partner review. Use markdown formatting.

Structure:
# [Company Name] — One Pager
## Overview
## Founding Team
## Market Opportunity
## Why Mars Shot (Razorpay synergy angle)
## Key Risks
## Recommendation`,
      },
      {
        role: "user",
        content: JSON.stringify(dealData),
      },
    ],
    temperature: 0.3,
    max_completion_tokens: 2048,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (response as any).choices?.[0]?.message?.content || "";
}

/**
 * Render {{variable}} placeholders in a template string.
 */
function renderPlaceholders(
  text: string,
  variables: Record<string, string>
): string {
  let result = text;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    result = result.replace(regex, value);
  }
  return result;
}

/**
 * Generate an email draft for a specific pipeline stage.
 *
 * If a `template` (inline subject/body with {{placeholders}}) or `templateId`
 * is provided, the template is rendered first and passed to the AI for
 * personalization. Otherwise the AI generates from scratch.
 */
export async function generateEmailDraft(context: {
  stage: string;
  companyName: string;
  founderName: string;
  founderEmail: string;
  notes?: string;
  /** Inline template with {{variable}} placeholders */
  template?: { subject: string; body: string };
  /** DB template ID — fetched and rendered at call time */
  templateId?: string;
}): Promise<{ subject: string; body: string }> {
  // Build the variable map from context for placeholder rendering
  const variables: Record<string, string> = {
    companyName: context.companyName,
    founderName: context.founderName,
    founderEmail: context.founderEmail,
    stage: context.stage,
    today: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  };

  // Resolve the template — either inline or from the database
  let rendered: { subject: string; body: string } | null = null;

  if (context.templateId) {
    const { renderTemplate } = await import("@/actions/email-templates");
    rendered = await renderTemplate(context.templateId, variables);
  } else if (context.template) {
    rendered = {
      subject: renderPlaceholders(context.template.subject, variables),
      body: renderPlaceholders(context.template.body, variables),
    };
  }

  // Build the user prompt
  const baseLine = `Draft an email for stage "${context.stage}" to ${context.founderName} (${context.founderEmail}) at ${context.companyName}.`;
  const notesLine = context.notes ? ` Notes: ${context.notes}` : "";

  const templateLine = rendered
    ? `\n\nUse this as a starting point and personalize it:\nSubject: ${rendered.subject}\nBody:\n${rendered.body}`
    : "";

  const response = await cerebras.chat.completions.create({
    model: "llama-3.3-70b",
    messages: [
      {
        role: "system",
        content: `You are drafting emails on behalf of a VP at Mars Shot (Razorpay founders' VC arm). Be professional, warm, and concise. Return JSON with "subject" and "body" fields only.${
          rendered
            ? " A template draft is provided — refine and personalize it while keeping the same intent."
            : ""
        }`,
      },
      {
        role: "user",
        content: `${baseLine}${notesLine}${templateLine}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.4,
    max_completion_tokens: 1024,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const emailContent = (response as any).choices?.[0]?.message?.content;
  if (!emailContent) throw new Error("No AI response received");

  return JSON.parse(emailContent);
}

export { cerebras };
