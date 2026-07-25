import { NextRequest, NextResponse } from "next/server";
import { getAgent } from "@/lib/agents";
import { callClaude } from "@/lib/claude";
import { buildOperationalState } from "@/lib/operational-state";
import { buildContextBlock } from "@/lib/context-builder";
import type { ChatMessage } from "@/lib/agents/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ChatRequestBody {
  agentId?: string;
  messages?: ChatMessage[];
}

function isValidMessages(messages: unknown): messages is ChatMessage[] {
  return (
    Array.isArray(messages) &&
    messages.every(
      (m) =>
        m &&
        typeof m === "object" &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.length > 0 &&
        m.content.length < 8000
    )
  );
}

export async function POST(req: NextRequest) {
  let body: ChatRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { agentId, messages } = body;

  if (!isValidMessages(messages) || messages.length === 0) {
    return NextResponse.json(
      { error: "`messages` must be a non-empty array of { role, content }." },
      { status: 400 }
    );
  }

  if (messages.length > 40) {
    return NextResponse.json(
      { error: "Conversation too long for this request." },
      { status: 400 }
    );
  }

  const agent = getAgent(agentId ?? "jarvis");

  try {
    // Sprint 2.4: one OperationalState, built fresh per request, injected
    // into every agent's system prompt scoped to its role. Agents reason
    // from this — they never rediscover or infer priorities, projects,
    // signals, or schedule themselves. This is what fixed DAWNWATCH
    // reporting "no active projects" while the dashboard, reading the
    // same underlying memory, showed real ones: DAWNWATCH previously got
    // no operational data in its conversational context at all.
    const state = await buildOperationalState();
    const contextBlock = buildContextBlock(state, agent.contextScope);
    const systemPrompt = `${agent.systemPrompt}\n\n${contextBlock}`;

    const reply = await callClaude(systemPrompt, messages);
    return NextResponse.json({ reply, agentId: agent.id });
  } catch (err) {
    // Never leak internals (stack traces, key hints) to the client.
    console.error("[/api/chat] Claude call failed:", err);
    const message =
      err instanceof Error && err.message.includes("ANTHROPIC_API_KEY")
        ? "Intelligence link not established. Set ANTHROPIC_API_KEY in .env.local to bring this console online."
        : "Intelligence link interrupted. Try again.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
