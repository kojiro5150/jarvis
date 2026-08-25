import { NextResponse } from "next/server";
import { callClaude } from "@/lib/claude";
import type { ClaudeContentBlock, ClaudeResult, ClaudeTool } from "@/lib/claude";
import type { ChatMessage } from "@/lib/agents/types";
import { areValidMessages, buildSpecialistPrompt, type RelaySpecialistReply } from "@/lib/lighter-jarvis/runtime";
import { getLighterSpecialist } from "@/lib/lighter-jarvis/specialists";
import { resolveProductionCalendarRead, type ProductionCalendarDependencies } from "@/lib/lighter-jarvis/production-calendar-read";

interface LighterChatBody {
  specialistId?: unknown;
  messages?: unknown;
  relaySpecialistReply?: RelaySpecialistReply;
  marketScopes?: unknown;
  pendingAuthorizationReference?: unknown;
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

export type MarketScope = "australia" | "us_equities" | "fx" | "global_macro";

export const MARKET_SCOPE_DOMAINS: Readonly<Record<MarketScope, readonly string[]>> = {
  australia: ["asx.com.au", "asic.gov.au", "rba.gov.au", "abs.gov.au", "apra.gov.au", "treasury.gov.au"],
  us_equities: ["nasdaq.com", "sec.gov", "federalreserve.gov"],
  fx: ["federalreserve.gov", "ecb.europa.eu", "bankofengland.co.uk", "rba.gov.au"],
  global_macro: ["imf.org", "worldbank.org", "bis.org", "federalreserve.gov", "ecb.europa.eu", "bankofengland.co.uk", "rba.gov.au"],
};

const DOMAIN_PATTERN = /^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/;

export function resolveMarketScopeDomains(value: unknown): string[] | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined;
  const domains = new Set<string>();
  for (const scope of value) {
    if (typeof scope !== "string" || !Object.hasOwn(MARKET_SCOPE_DOMAINS, scope)) return undefined;
    for (const domain of MARKET_SCOPE_DOMAINS[scope as MarketScope]) {
      if (!DOMAIN_PATTERN.test(domain) || !/^[\x00-\x7F]+$/.test(domain)) return undefined;
      domains.add(domain);
    }
  }
  return [...domains];
}

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
      market_scopes: {
        type: "array",
        items: { type: "string", enum: ["australia", "us_equities", "fx", "global_macro"] },
        description: "Required for GECKO only: one or more of australia, us_equities, fx, global_macro.",
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

const citationUrls = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.flatMap(citationUrls);
  if (typeof value !== "object" || value === null) return [];
  const record = value as Record<string, unknown>;
  return [typeof record.url === "string" ? record.url : [], ...Object.values(record).map(citationUrls)].flat();
};

export function hasVerifiableExternalEvidence(content: ClaudeContentBlock[], allowedDomains?: readonly string[]): boolean {
  if (!fetchedThisTurn(content)) return false;
  const allowed = allowedDomains && new Set(allowedDomains);
  const isAdmissibleUrl = (rawUrl: string): boolean => {
    try {
      const url = new URL(rawUrl);
      if (url.protocol !== "https:" && url.protocol !== "http:") return false;
      return !allowed || [...allowed].some((domain) => url.hostname === domain || url.hostname.endsWith(`.${domain}`));
    } catch { return false; }
  };
  const evidenceUrls = content
    .filter((block) => block.type === "web_search_tool_result" || block.type === "web_fetch_tool_result")
    .flatMap(citationUrls);
  if (evidenceUrls.length === 0 || evidenceUrls.some((url) => !isAdmissibleUrl(url))) return false;
  const evidence = new Set(evidenceUrls);
  return content.some((block) => {
    if (block.type !== "text" || !Array.isArray(block.citations)) return false;
    return citationUrls(block.citations).some((url) => isAdmissibleUrl(url) && evidence.has(url));
  });
}

export function formatCalendarReadResponse(calendar: NonNullable<Awaited<ReturnType<typeof resolveProductionCalendarRead>>["evidence"]>): string {
  if (calendar.status !== "available") return "I couldn't access your Calendar right now.";
  if (calendar.evidence.length === 0) return "Your Calendar has no commitments in the next seven days (up to five events checked).";
  const commitments = calendar.evidence.map(({ start, end }) => `- ${start} – ${end}`).join("\n");
  return `Your Calendar has ${calendar.evidence.length} upcoming commitment${calendar.evidence.length === 1 ? "" : "s"} in the next seven days (up to five events):\n${commitments}`;
}

export function createLighterChatHandler(callModel: ModelCall = callClaude, calendarDependencies?: ProductionCalendarDependencies) {
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
    const currentUserUtterance = [...body.messages].reverse().find(({ role }) => role === "user")?.content;
    const calendar = specialist.id === "jarvis" && !body.relaySpecialistReply && currentUserUtterance !== undefined
      ? await resolveProductionCalendarRead({
          currentUserUtterance,
          ...(Object.hasOwn(body, "pendingAuthorizationReference")
            ? { pendingAuthorizationReference: body.pendingAuthorizationReference }
            : {}),
        }, calendarDependencies)
      : null;
    if (calendar?.handled && calendar.decision !== "ALLOW") {
      const reply = calendar.decision === "DENY"
        ? "Understood. I won't read your Calendar."
        : "Please explicitly confirm that I may read your Calendar.";
      return NextResponse.json({ reply, specialistId: specialist.id, execution: "none",
        calendarAuthority: { decision: calendar.decision, reason: calendar.reason },
        pendingAuthorizationReference: calendar.pendingAuthorizationReference });
    }
    if (calendar?.decision === "ALLOW") {
      return NextResponse.json({
        reply: formatCalendarReadResponse(calendar.evidence!),
        specialistId: specialist.id,
        execution: "none",
        calendarAuthority: { decision: "ALLOW", reason: calendar.reason },
      });
    }
    const marketDomains = specialist.id === "gecko"
      ? resolveMarketScopeDomains(body.marketScopes)
      : undefined;
    if (specialist.id === "gecko" && !marketDomains) {
      return NextResponse.json({ error: "`marketScopes` must contain one or more valid GECKO market scopes.", state: "not_authorised" }, { status: 400 });
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
        : specialist.id === "gecko"
          ? [{ type: "web_search_20250305", name: "web_search", allowed_domains: marketDomains }] as ClaudeTool[]
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

      const evidenceCapable = specialist.id === "oracle" || specialist.id === "gecko";
      if (evidenceCapable && !hasVerifiableExternalEvidence(content, specialist.id === "gecko" ? marketDomains : undefined) && /\bSourced\b/i.test(reply)) {
        reply = reply.replace(/\bSourced\b/gi, "Recalled");
      }
      if (specialist.id === "jarvis" && !relaySpecialistReply) {
        const handoff = content.find((block) => block.type === "tool_use" && block.name === "propose_handoff");
        if (handoff && typeof handoff.input === "object" && handoff.input !== null && !Array.isArray(handoff.input)) {
          const specialistId = "specialist_id" in handoff.input ? handoff.input.specialist_id : undefined;
          const target = typeof specialistId === "string" ? getLighterSpecialist(specialistId) : undefined;
          const taskSummary = "task_summary" in handoff.input ? handoff.input.task_summary : undefined;
          const hasTaskSummary = typeof taskSummary === "string" && taskSummary.trim().length > 0;
          const marketScopes = "market_scopes" in handoff.input ? handoff.input.market_scopes : undefined;
          const resolvedMarketDomains = target?.id === "gecko" ? resolveMarketScopeDomains(marketScopes) : undefined;
          const hasValidMarketScopes = target?.id !== "gecko" || Boolean(resolvedMarketDomains);
          if (target && hasTaskSummary && hasValidMarketScopes) {
            const routedReply = reply.trim() || `I'd recommend handing this to ${target.name}.`;
            return NextResponse.json({
              reply: routedReply,
              specialistId: specialist.id,
              execution: "none",
              routeTo: target.id,
              taskSummary: taskSummary.trim(),
              ...(target.id === "gecko" ? { marketScopes } : {}),
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
