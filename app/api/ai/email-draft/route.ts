import { NextRequest, NextResponse } from "next/server";
import { prismadb } from "@/lib/prisma";
import { generateEmailDraft } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const { dealId, founderIndex = 0 } = await req.json();

    if (!dealId) {
      return NextResponse.json(
        { error: "Missing required field: dealId" },
        { status: 400 }
      );
    }

    const deal = await prismadb.deal.findUnique({
      where: { id: dealId },
      include: { founders: true },
    });

    if (!deal) {
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    if (deal.founders.length === 0) {
      return NextResponse.json(
        { error: "No founders found for this deal" },
        { status: 400 }
      );
    }

    const founder = deal.founders[founderIndex] || deal.founders[0];

    const result = await generateEmailDraft({
      stage: deal.stage,
      companyName: deal.companyName,
      founderName: founder.name,
      founderEmail: founder.email || "",
      notes: deal.callNotes || undefined,
    });

    const content = JSON.stringify(result);

    const aiOutput = await prismadb.aIOutput.create({
      data: {
        type: "EMAIL_DRAFT",
        content,
        confidence: null,
        approved: false,
        dealId,
      },
    });

    await prismadb.activity.create({
      data: {
        type: "AI_GENERATION",
        title: "Email draft generated",
        description: `AI-drafted email for ${founder.name} at ${deal.companyName}`,
        dealId,
      },
    });

    return NextResponse.json(aiOutput, { status: 201 });
  } catch (error) {
    console.error("Email draft generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate email draft" },
      { status: 500 }
    );
  }
}
