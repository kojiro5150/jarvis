import { NextResponse } from "next/server";
import { callClaude } from "@/lib/claude";
import type { ChatMessage } from "@/lib/agents/types";
import { areValidMessages, buildSpecialistPrompt } from "@/lib/lighter-jarvis/runtime";
import { getLighterSpecialist } from "@/lib/lighter-jarvis/specialists";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface LighterChatBody { specialistId?: unknown; messages?: unknown }
type ModelCall = (systemPrompt: string, messages: ChatMessage[]) => Promise<string>;

export function createLighterChatHandler(callModel: ModelCall = callClaude) {
  return async function POST(request: Request) {
    let body: LighterChatBody;
    try { body = await request.json() as LighterChatBody; }
    catch { return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }); }

    if (typeof body.specialistId !== "string") {
      return NextResponse.json({ error: "`specialistId` is required." }, { status: 400 });
    }
    const specialist = getLighterSpecialist(body.specialistId.toLowerCase());
    if (!specialist) {
      return NextResponse.json({ error: "Unknown or inactive specialist." }, { status: 404 });
    }
    if (!areValidMessages(body.messages)) {
      return NextResponse.json({ error: "`messages` must contain 1-40 valid conversation messages." }, { status: 400 });
    }

    try {
      const systemPrompt = await buildSpecialistPrompt(specialist);
      const reply = await callModel(systemPrompt, body.messages);
      return NextResponse.json({ reply, specialistId: specialist.id, execution: "none" });
    } catch (error) {
      console.error("[/api/lighter/chat] Specialist invocation failed:", error);
      return NextResponse.json({ error: "Specialist invocation failed.", state: "unknown" }, { status: 502 });
    }
  };
}

export const POST = createLighterChatHandler();
