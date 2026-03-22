import { NextRequest, NextResponse } from "next/server";
import { prismadb } from "@/lib/prisma";
import { generateOnePager } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const { dealId } = await req.json();

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

    const result = await generateOnePager({
      companyName: deal.companyName,
      sector: deal.sector || "OTHER",
      fundingStage: deal.fundingStage || "OTHER",
      chequeSize: deal.chequeSize || undefined,
      founders: deal.founders.map((f) => ({
        name: f.name,
        title: f.title || undefined,
      })),
      summary: deal.rawIngestionText || undefined,
      callNotes: deal.callNotes || undefined,
    });

    const aiOutput = await prismadb.aIOutput.create({
      data: {
        type: "ONE_PAGER",
        content: result,
        confidence: null,
        approved: false,
        dealId,
      },
    });

    await prismadb.activity.create({
      data: {
        type: "AI_GENERATION",
        title: "One-Pager generated",
        description: `AI-generated one-pager for ${deal.companyName}`,
        dealId,
      },
    });

    return NextResponse.json(aiOutput, { status: 201 });
  } catch (error) {
    console.error("One-pager generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate one-pager" },
      { status: 500 }
    );
  }
}
