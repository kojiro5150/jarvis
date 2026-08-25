import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * @deprecated Renamed to /api/operational-state (Sprint 2.4 — consolidated
 * on "OperationalState" as the one name for this concept everywhere, so
 * dashboard and conversational agents are never at risk of drifting onto
 * two subtly different ideas). It is now fail-closed rather than forwarding
 * to the eager legacy builder.
 */
export async function GET() {
  return NextResponse.json(
    {
      error: "operational_picture_retired",
      message: "The deprecated operational-picture API has been retired.",
    },
    { status: 410 },
  );
}
