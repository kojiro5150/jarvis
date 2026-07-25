import { NextResponse } from "next/server";
import { buildOperationalState } from "@/lib/operational-state";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * The one OperationalState, fetched fresh on every request — the same
 * builder (lib/operational-state.ts) that /api/chat uses server-side to
 * inject context into every conversational agent. The dashboard is one
 * consumer of this; agents are the others. See Sprint 2.4.
 */
export async function GET() {
  const state = await buildOperationalState();
  return NextResponse.json(state);
}
