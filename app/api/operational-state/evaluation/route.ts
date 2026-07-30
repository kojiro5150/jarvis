import { NextResponse } from "next/server";
import { buildOperationalState } from "@/lib/operational-state";
import { evaluateDashboardOperationalPicture } from "@/lib/executive-context/operational-picture-parallel-evaluation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Evidence-only parallel view. The Dashboard continues to use /api/operational-state. */
export async function GET() {
  const observedAt = new Date().toISOString();
  const operationalState = await buildOperationalState();
  return NextResponse.json(await evaluateDashboardOperationalPicture(operationalState, observedAt));
}
