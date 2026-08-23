import { NextResponse } from "next/server";
import { callClaude } from "@/lib/claude";
import type { ClaudeContentBlock, ClaudeResult, ClaudeTool } from "@/lib/claude";
import type { ChatMessage } from "@/lib/agents/types";
import { areValidMessages, buildSpecialistPrompt, type RelaySpecialistReply } from "@/lib/lighter-jarvis/runtime";
import { getLighterSpecialist } from "@/lib/lighter-jarvis/specialists";

interface LighterChatBody {
  specialistId?: unknown;
  messages?: unknown;
  relaySpecialistReply?: RelaySpecialistReply;
}
type ModelCall = (
  systemPrompt: string,
  messages: ChatMessage[],
  tools?: ClaudeTool[],
) => Promise<string | ClaudeResult>;

const ORACLE_TOOLS: ClaudeTool[] = [
  { type: "web_search_20250305", name: "web_search" },
  { type: "web_fetch_20250910", name: "web_fetch", max_uses: 5 },
];

const JARVIS_TOOLS: ClaudeTool[] = [{
  name: "propose_handoff",
  description: "Propose handing this conversation to a specialist. Call this only when the task clearly requires a specialist's governed data or capability. Explain the reason in your ordinary text response; this tool call carries which specialist and a self-contained task_summary.",
  input_schema: {
    type: "object",
    properties: {
      specialist_id: {
        type: "string",
        enum: ["dawnwatch", "oracle", "herald", "steve", "marcus", "gecko"],
      },
      task_summary: {
        type: "string",
        description: "A self-contained restatement of what the specialist needs to do, written as if the specialist has seen none of this conversation. Never a bare acknowledgement like 'yes' or 'go ahead': if this is a follow-up hand-off, restate the actual task from earlier in the conversation, not just the message that triggered this call.",
      },
    },
    required: ["specialist_id", "task_summary"],
  },
}];

const isFetchError = (value: unknown): boolean => {
  if (Array.isArray(value)) return value.some(isFetchError);
  if (typeof value !== "object" || value === null) return false;
  if ("type" in value && value.type === "web_fetch_tool_error") return true;
  return "content" in value && isFetchError(value.content);
};

const fetchedThisTurn = (content: ClaudeContentBlock[]) => {
  const fetchErrored = content.some(isFetchError);
  return content.some((block) =>
    block.type === "web_search_tool_result"
    || (block.type === "web_fetch_tool_result" && !isFetchError(block))
    || (block.type === "server_tool_use"
      && !(fetchErrored && block.name === "web_fetch")),
  );
};

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
    let relaySpecialistReply: RelaySpecialistReply | undefined;
    if (body.relaySpecialistReply !== undefined) {
      const relay = body.relaySpecialistReply;
      if (specialist.id !== "jarvis") {
        return NextResponse.json({ error: "`relaySpecialistReply` is valid only for JARVIS." }, { status: 400 });
      }
      if (!relay || typeof relay !== "object"
        || !("specialistId" in relay) || typeof relay.specialistId !== "string"
        || !("reply" in relay) || typeof relay.reply !== "string" || !relay.reply.trim()
        || !getLighterSpecialist(relay.specialistId.toLowerCase())) {
        return NextResponse.json({ error: "`relaySpecialistReply` must contain a valid specialist id and reply." }, { status: 400 });
      }
      relaySpecialistReply = { specialistId: relay.specialistId.toLowerCase(), reply: relay.reply };
    }

    try {
      const systemPrompt = await buildSpecialistPrompt(specialist, relaySpecialistReply);
      const tools = specialist.id === "oracle"
        ? ORACLE_TOOLS
        : specialist.id === "jarvis" && !relaySpecialistReply
          ? JARVIS_TOOLS
          : undefined;
      const result = tools
        ? await callModel(systemPrompt, body.messages, tools)
        : await callModel(systemPrompt, body.messages);
      const content = typeof result === "string" ? [] : result.content;
      let reply = typeof result === "string" ? result : result.text;

      if (relaySpecialistReply && !reply.includes(relaySpecialistReply.reply)) {
        const source = getLighterSpecialist(relaySpecialistReply.specialistId)!;
        reply = `${source.name} reports:\n\n${relaySpecialistReply.reply}`;
      }

      if (specialist.id === "oracle" && !fetchedThisTurn(content) && /\bSourced\b/i.test(reply)) {
        reply = reply.replace(/\bSourced\b/gi, "Recalled");
      }
      if (specialist.id === "jarvis" && !relaySpecialistReply) {
        const handoff = content.find((block) => block.type === "tool_use" && block.name === "propose_handoff");
        if (handoff && typeof handoff.input === "object" && handoff.input !== null && !Array.isArray(handoff.input)) {
          const specialistId = "specialist_id" in handoff.input ? handoff.input.specialist_id : undefined;
          const target = typeof specialistId === "string" ? getLighterSpecialist(specialistId) : undefined;
          const taskSummary = "task_summary" in handoff.input ? handoff.input.task_summary : undefined;
          const hasTaskSummary = typeof taskSummary === "string" && taskSummary.trim().length > 0;
          if (target && hasTaskSummary) {
            const routedReply = reply.trim() || `I'd recommend handing this to ${target.name}.`;
            return NextResponse.json({
              reply: routedReply,
              specialistId: specialist.id,
              execution: "none",
              routeTo: target.id,
              taskSummary: taskSummary.trim(),
            });
          }
        }
      }
      return NextResponse.json({ reply, specialistId: specialist.id, execution: "none" });
    } catch (error) {
      console.error("[/api/lighter/chat] Specialist invocation failed:", error);
      return NextResponse.json({ error: "Specialist invocation failed.", state: "unknown" }, { status: 502 });
    }
  };
}
