import { NextResponse } from "next/server";
import { callClaude } from "@/lib/claude";
import type { ClaudeContentBlock, ClaudeResult, ClaudeTool } from "@/lib/claude";
import type { ChatMessage } from "@/lib/agents/types";
import { areValidMessages, buildSpecialistPrompt } from "@/lib/lighter-jarvis/runtime";
import { getLighterSpecialist } from "@/lib/lighter-jarvis/specialists";

interface LighterChatBody { specialistId?: unknown; messages?: unknown }
type ModelCall = (
  systemPrompt: string,
  messages: ChatMessage[],
  tools?: ClaudeTool[],
) => Promise<string | ClaudeResult>;

const ORACLE_WEB_SEARCH: ClaudeTool[] = [{ type: "web_search_20250305", name: "web_search" }];
const fetchedThisTurn = (content: ClaudeContentBlock[]) => content.some(
  (block) => block.type === "server_tool_use" || block.type === "web_search_tool_result",
);

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
      const result = specialist.id === "oracle"
        ? await callModel(systemPrompt, body.messages, ORACLE_WEB_SEARCH)
        : await callModel(systemPrompt, body.messages);
      const content = typeof result === "string" ? [] : result.content;
      let reply = typeof result === "string" ? result : result.text;

      if (specialist.id === "oracle" && !fetchedThisTurn(content) && /\bSourced\b/i.test(reply)) {
        reply = reply.replace(/\bSourced\b/gi, "Recalled");
      }
      if (specialist.id === "jarvis") {
        const routeMatch = reply.match(/(?:^|\n)ROUTE_TO:\s*(\S+)\s*$/);
        if (routeMatch) {
          const routedReply = reply.slice(0, routeMatch.index).trimEnd();
          const target = getLighterSpecialist(routeMatch[1]);
          return NextResponse.json({
            reply: routedReply,
            specialistId: specialist.id,
            execution: "none",
            ...(target ? { routeTo: target.id } : {}),
          });
        }
      }
      return NextResponse.json({ reply, specialistId: specialist.id, execution: "none" });
    } catch (error) {
      console.error("[/api/lighter/chat] Specialist invocation failed:", error);
      return NextResponse.json({ error: "Specialist invocation failed.", state: "unknown" }, { status: 502 });
    }
  };
}
