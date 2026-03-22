import { NextResponse } from "next/server";
import { flagBreachedDeals } from "@/lib/workflows/sla-monitor";

export async function GET() {
  const result = await flagBreachedDeals();
  return NextResponse.json({
    breached: result.breachedDeals.length,
    nearing: result.nearingDeals.length,
    details: result,
  });
}
