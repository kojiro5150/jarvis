import { NextRequest, NextResponse } from "next/server";
import { readMemory, updateMemory } from "@/lib/memory/store";
import type { MemoryStore } from "@/lib/memory/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PATCHABLE_KEYS = [
  "priorities",
  "projects",
  "signals",
  "calendar",
  "gmailThreads",
  "driveFiles",
] as const;

type PatchableKey = (typeof PATCHABLE_KEYS)[number];

function isValidPatch(body: unknown): body is Partial<MemoryStore> {
  if (!body || typeof body !== "object") return false;
  return Object.entries(body as Record<string, unknown>).every(
    ([key, value]) => PATCHABLE_KEYS.includes(key as PatchableKey) && Array.isArray(value)
  );
}

export async function GET() {
  const memory = await readMemory();
  return NextResponse.json(memory);
}

export async function PATCH(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!isValidPatch(body)) {
    return NextResponse.json(
      {
        error: `Body must be an object with only these array fields: ${PATCHABLE_KEYS.join(", ")}.`,
      },
      { status: 400 }
    );
  }

  try {
    const updated = await updateMemory(body);
    return NextResponse.json(updated);
  } catch (err) {
    console.error("[/api/memory] update failed:", err);
    return NextResponse.json(
      { error: "Operational memory update didn't go through. Try again." },
      { status: 500 }
    );
  }
}
