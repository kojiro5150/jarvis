import { NextResponse } from "next/server";
import { LIGHTER_SPECIALISTS } from "@/lib/lighter-jarvis/specialists";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    specialists: Object.values(LIGHTER_SPECIALISTS).map(({ id, name, purpose, invokedOnly }) => ({
      id, name, purpose, invokedOnly,
    })),
    excluded: ["phdss"],
  });
}
