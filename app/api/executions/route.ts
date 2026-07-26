import { NextRequest, NextResponse } from "next/server";

import { createExecutionAuditStore } from "@/lib/agents/execution-audit-store-factory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const requestedLimit = Number(req.nextUrl.searchParams.get("limit") ?? "50");
  const limit = Number.isFinite(requestedLimit) ? requestedLimit : 50;

  try {
    const records = await createExecutionAuditStore().list(limit);
    return NextResponse.json({ records });
  } catch (error) {
    console.error("[/api/executions] Failed to read execution audit history", error);
    return NextResponse.json(
      { error: "Execution audit history is unavailable" },
      { status: 500 }
    );
  }
}
