import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Retired: aggregate private acquisition must not be reachable from an API. */
export async function GET() {
  return NextResponse.json(
    {
      error: "operational_state_retired",
      message: "The legacy operational-state API has been retired.",
    },
    { status: 410 },
  );
}
