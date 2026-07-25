import { NextResponse } from "next/server";
import { buildOperationalState } from "@/lib/operational-state";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * @deprecated Renamed to /api/operational-state (Sprint 2.4 — consolidated
 * on "OperationalState" as the one name for this concept everywhere, so
 * dashboard and conversational agents are never at risk of drifting onto
 * two subtly different ideas). Kept as a working alias so an old
 * bookmark/fetch doesn't just 404 — don't build anything new against this
 * path, use /api/operational-state instead. (Not a re-export of that
 * route's GET, deliberately: Next.js's route config export detection is
 * static per-file, so `runtime`/`dynamic` are re-declared here rather
 * than relied upon via re-export.)
 */
export async function GET() {
  const state = await buildOperationalState();
  return NextResponse.json(state);
}
