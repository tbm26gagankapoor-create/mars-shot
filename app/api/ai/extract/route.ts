import { NextRequest, NextResponse } from "next/server";
import { extractDealFromText } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    const result = await extractDealFromText(text);
    return NextResponse.json(result);
  } catch (error) {
    console.error("AI extraction error:", error);
    return NextResponse.json(
      { error: "Extraction failed" },
      { status: 500 }
    );
  }
}
