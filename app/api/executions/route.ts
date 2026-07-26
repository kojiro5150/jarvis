import { NextRequest, NextResponse } from "next/server";

import { JsonlExecutionAuditStore } from "@/lib/agents/execution-audit-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const requestedLimit = Number(req.nextUrl.searchParams.get("limit") ?? "50");
  const limit = Number.isFinite(requestedLimit) ? requestedLimit : 50;

  try {
    const records = await new JsonlExecutionAuditStore().list(limit);
    return NextResponse.json({ records });
  } catch (error) {
    console.error("[/api/executions] Failed to read execution audit history", error);
    return NextResponse.json(
      { error: "Execution audit history is unavailable" },
      { status: 500 }
    );
  }
}
