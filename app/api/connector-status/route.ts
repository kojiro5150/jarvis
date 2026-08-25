import { NextResponse } from "next/server";
import { buildConnectorStatusSnapshot } from "@/lib/connectors/status";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Status-only UI chrome. This route must never acquire private content. */
export async function GET() {
  return NextResponse.json(await buildConnectorStatusSnapshot());
}
