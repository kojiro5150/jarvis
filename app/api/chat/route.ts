import { NextRequest, NextResponse } from "next/server";
import { getAgent } from "@/lib/agents";
import { callClaude } from "@/lib/claude";
import { executeAuditedChat } from "@/lib/agents/chat-execution";
import { createExecutionAuditStore } from "@/lib/agents/execution-audit-store-factory";
import { assembleAgentSystemPrompt } from "@/lib/agents/boa-instructions";
import { getBoaInstruction } from "@/lib/agents/boa-instruction-registry";
import type { ChatMessage } from "@/lib/agents/types";
import { authorizeGmailCapability, parseChatCapabilityRequest, routeChatCapability } from "@/lib/chat-capabilities";
import { GoogleGmailContentConnector } from "@/lib/chat-capabilities/google-gmail-content";
import { loadContentRetrievalPolicy } from "@/lib/content-retrieval-policy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ChatRequestBody {
  agentId?: string;
  messages?: ChatMessage[];
  capability?: unknown;
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

  if (body.capability !== undefined) {
    try {
      const capability = parseChatCapabilityRequest(body.capability);
      if (!capability) return NextResponse.json({ error: "Unknown capability operation." }, { status: 400 });
      if (capability.operation === "governed_gmail_retrieval") {
        if (!isValidMessages(body.messages)) {
          return NextResponse.json({ error: "Gmail authority requires valid chat messages." }, { status: 400 });
        }
        const currentUserUtterance = [...body.messages].reverse().find(({ role }) => role === "user")?.content;
        if (currentUserUtterance === undefined) {
          return NextResponse.json({ error: "Gmail authority requires a current user message." }, { status: 400 });
        }
        const authority = authorizeGmailCapability({ capability, currentUserUtterance });
        if (authority.decision !== "ALLOW" || authority.operation === null) {
          return NextResponse.json({ capability: { operation: capability.operation, decision: authority.decision,
            reason: authority.reason, pendingAuthorizationReference: authority.pendingAuthorizationReference } });
        }
        const response = await routeChatCapability({ ...capability, request: authority.operation.request }, {
          gmailConnector: new GoogleGmailContentConnector(),
          loadPolicy: () => loadContentRetrievalPolicy(process.env.CONTENT_RETRIEVAL_POLICY_PATH),
        });
        return NextResponse.json({ capability: response });
      }
      const response = await routeChatCapability(capability, {
        gmailConnector: new GoogleGmailContentConnector(),
        loadPolicy: () => loadContentRetrievalPolicy(process.env.CONTENT_RETRIEVAL_POLICY_PATH),
      });
      return NextResponse.json({ capability: response });
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "Malformed capability request." }, { status: 400 });
    }
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
    const systemPrompt = assembleAgentSystemPrompt(
      agent,
      getBoaInstruction(agent.id)
    );

    const reply = await executeAuditedChat(
      { agent, messages, systemPrompt },
      {
        callModel: callClaude,
        auditStore: createExecutionAuditStore(),
      }
    );

    return NextResponse.json({ reply, agentId: agent.id });
  } catch (err) {
    console.error("[/api/chat] Audited conversation execution failed:", err);
    const message =
      err instanceof Error && err.message.includes("ANTHROPIC_API_KEY")
        ? "Intelligence link not established. Set ANTHROPIC_API_KEY in .env.local to bring this console online."
        : err instanceof Error && err.message.includes("audit record")
          ? "Execution record could not be secured. Try again."
          : "Intelligence link interrupted. Try again.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
