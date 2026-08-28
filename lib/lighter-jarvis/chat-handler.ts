import { NextResponse } from "next/server";
import { callClaude } from "@/lib/claude";
import type { ClaudeContentBlock, ClaudeResult, ClaudeTool } from "@/lib/claude";
import type { ChatMessage } from "@/lib/agents/types";
import { areValidMessages, areValidMessageTranscript, buildSpecialistPrompt, type RelaySpecialistReply } from "@/lib/lighter-jarvis/runtime";
import { getLighterSpecialist } from "@/lib/lighter-jarvis/specialists";
import { resolveProductionCalendarRead, type ProductionCalendarDependencies } from "@/lib/lighter-jarvis/production-calendar-read";
import { CALENDAR_TIME_ZONE } from "@/lib/lighter-jarvis/calendar-read-window";
import { resolveProductionGmailRead, type ProductionGmailDependencies } from "@/lib/lighter-jarvis/production-gmail-read";
import { resolveProductionGmailSearch, type ProductionGmailSearchDependencies } from "@/lib/lighter-jarvis/production-gmail-search";
import { hasGovernedDriveHistory, sanitizeModelHistory } from "@/lib/lighter-jarvis/model-history-boundary";
import { isAmbiguousPrivateReadFollowUp, isPrivateAcquisitionHandoffRequest } from "@/lib/lighter-jarvis/private-capability-handoff-guard";
import { guardOrdinaryModelReply } from "@/lib/lighter-jarvis/ordinary-model-reply-guard";
import { resolveProductionDriveSearch, type ProductionDriveSearchDependencies } from "@/lib/lighter-jarvis/production-drive-search";
import { resolveProductionDriveRead, type ProductionDriveReadDependencies } from "@/lib/lighter-jarvis/production-drive-read";
import { bindUserCalendarDetails, projectCalendarContext, type CalendarBindingState } from "@/lib/lighter-jarvis/calendar-governed-context";
import { createGovernedContext, type GovernedContext } from "@/lib/lighter-jarvis/governed-context";
import { calendarRecallDiagnostics, displayCalendarClock, normalizedCalendarClock } from "@/lib/lighter-jarvis/calendar-provenance-truthfulness";
import { resolveLiveCalendarAttention } from "@/lib/lighter-jarvis/live-calendar-attention";

interface LighterChatBody {
  specialistId?: unknown;
  messages?: unknown;
  relaySpecialistReply?: RelaySpecialistReply;
  marketScopes?: unknown;
  pendingAuthorizationReference?: unknown;
  calendarAttentionObservationReference?: unknown;
}
type ModelCall = (
  systemPrompt: string,
  messages: ChatMessage[],
  tools?: ClaudeTool[],
  governedContext?: GovernedContext,
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

const PRIVATE_CAPABILITY_HANDOFF_BLOCKED_REPLY = "That request cannot be handled through a specialist handoff.";

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

export function formatCalendarReadResponse(calendar: NonNullable<Awaited<ReturnType<typeof resolveProductionCalendarRead>>["evidence"]>,
  window?: NonNullable<Awaited<ReturnType<typeof resolveProductionCalendarRead>>["window"]>,
  bindingState?: CalendarBindingState): string {
  if (calendar.status !== "available") return "I couldn't access your Calendar right now.";
  if (calendar.evidence.length === 0 && window) return clearCalendarPeriod(window.period);
  if (calendar.evidence.length > 0 && window) {
    const includeDate = window.period === "this_week" || window.period === "default";
    const bindingByStart = new Map((bindingState?.bindings ?? []).map(binding => [binding.commitmentStart, binding.label]));
    const commitments = calendar.evidence.map(({ start, end }) => {
      const label = bindingByStart.get(start);
      return `- ${includeDate ? `${formatMelbourneDate(start)}, ` : ""}${formatMelbourneTime(start)} – ${formatMelbourneTime(end)}${label ? ` — ${label} (as you mentioned)` : ""}`;
    }).join("\n");
    const count = calendar.evidence.length;
    const unbound = (bindingState?.unbound ?? []).map(detail =>
      `You previously mentioned ${detail.label} at ${displayCalendarClock(detail.clock)}, but that time does not match a commitment in this Calendar result, so I cannot associate it with one.`
    ).join("\n");
    return `${calendarPeriodHeading(window.period)} you have ${count} commitment${count === 1 ? "" : "s"}:\n${commitments}${unbound ? `\n${unbound}` : ""}`;
  }
  const coverage = calendar.evidence[0]?.coverageLimit.match(/^window=([^/]+)\/([^;]+);/) ?? null;
  const bounds = window ? [window.start, window.end] : coverage?.slice(1);
  const range = bounds ? `${formatMelbourne(bounds[0])} to ${formatMelbourne(bounds[1])}` : "the requested period";
  if (calendar.evidence.length === 0) return `Your Calendar has no commitments in ${range} (up to five events checked).`;
  const commitments = calendar.evidence.map(({ start, end }) => `- ${formatMelbourne(start)} – ${formatMelbourne(end)}`).join("\n");
  return `Your Calendar has ${calendar.evidence.length} commitment${calendar.evidence.length === 1 ? "" : "s"} in ${range} (up to five events):\n${commitments}`;
}

function calendarPeriodHeading(period: NonNullable<Awaited<ReturnType<typeof resolveProductionCalendarRead>>["window"]>["period"]): string {
  const copy = {
    today: "Today",
    tomorrow: "Tomorrow",
    this_morning: "This morning",
    this_afternoon: "This afternoon",
    this_evening: "This evening",
    this_week: "This week",
    default: "Next seven days",
  } as const;
  return copy[period];
}

function clearCalendarPeriod(period: NonNullable<Awaited<ReturnType<typeof resolveProductionCalendarRead>>["window"]>["period"]): string {
  const copy = {
    today: "Today is clear.",
    tomorrow: "Tomorrow is clear.",
    this_morning: "This morning is clear.",
    this_afternoon: "This afternoon is clear.",
    this_evening: "This evening is clear.",
    this_week: "This week is clear.",
    default: "Your Calendar is clear for the next seven days.",
  } as const;
  return copy[period];
}

const melbournePresentation = new Intl.DateTimeFormat("en-AU", { timeZone: CALENDAR_TIME_ZONE,
  weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
const melbourneTimePresentation = new Intl.DateTimeFormat("en-AU", { timeZone: CALENDAR_TIME_ZONE,
  hour: "numeric", minute: "2-digit", hour12: true });
const melbourneDatePresentation = new Intl.DateTimeFormat("en-AU", { timeZone: CALENDAR_TIME_ZONE,
  weekday: "short", day: "numeric", month: "short" });
const upperCaseMeridiem = (value: string): string => value
  .replace(/\s(am|pm)$/i, " $1")
  .replace(/\b(am|pm)\b/gi, match => match.toUpperCase());
function formatMelbourne(value: string): string {
  return upperCaseMeridiem(melbournePresentation.format(new Date(value)));
}
function formatMelbourneTime(value: string): string { return upperCaseMeridiem(melbourneTimePresentation.format(new Date(value))); }
function formatMelbourneDate(value: string): string { return melbourneDatePresentation.format(new Date(value)); }

const CALENDAR_REPLY_INTERVAL = /(\d{1,2})(?::(\d{2}))?\s*(AM|PM)\s*[–-]\s*(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/gi;

function calendarIntervalKey(start: string, end: string): string {
  const parts = (value: string) => {
    const formatted = formatMelbourneTime(value);
    const match = formatted.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
    if (!match) throw new Error("Unable to normalize Calendar commitment time.");
    return normalizedCalendarClock(match[1], match[2], match[3]);
  };
  return `${parts(start)}->${parts(end)}`;
}

/**
 * Current governed Calendar presentation may add prose, but it may not alter
 * the projected commitment set. Any missing, substituted or extra interval
 * fails closed to the deterministic server formatter.
 */
export function calendarReplyPreservesProjection(content: string,
  commitments: readonly Readonly<{ start: string; end: string }>[]): boolean {
  const observed = [...content.matchAll(CALENDAR_REPLY_INTERVAL)].map(match =>
    `${normalizedCalendarClock(match[1], match[2], match[3])}->${normalizedCalendarClock(match[4], match[5], match[6])}`
  ).sort();
  CALENDAR_REPLY_INTERVAL.lastIndex = 0;
  const expected = commitments.map(commitment => calendarIntervalKey(commitment.start, commitment.end)).sort();
  const hasExplicitClock = /\b\d{1,2}(?::\d{2})?\s*(?:AM|PM)\b/i.test(content);
  if (observed.length === 0) return !hasExplicitClock;
  return observed.length === expected.length && observed.every((value, index) => value === expected[index]);
}

export function createLighterChatHandler(callModel: ModelCall = callClaude, calendarDependencies?: ProductionCalendarDependencies,
  gmailDependencies?: ProductionGmailDependencies, gmailSearchDependencies?: ProductionGmailSearchDependencies,
  driveSearchDependencies?: ProductionDriveSearchDependencies, driveReadDependencies?: ProductionDriveReadDependencies) {
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
    // Deterministic authority resolution needs only a valid current utterance.
    // Do not reject a long client transcript before an opaque pending reference
    // has had the opportunity to reach its server-owned resolver.
    if (!areValidMessageTranscript(body.messages)) {
      return NextResponse.json({ error: "`messages` must contain valid conversation messages." }, { status: 400 });
    }
    const currentUserUtterance = [...body.messages].reverse().find(({ role }) => role === "user")?.content;
    const driveRead = specialist.id === "jarvis" && !body.relaySpecialistReply && currentUserUtterance !== undefined
      ? await resolveProductionDriveRead({ currentUserUtterance }, driveReadDependencies) : null;
    if (driveRead?.handled) return NextResponse.json({ reply: driveRead.reply, specialistId: specialist.id, execution: "none",
      driveReadAuthority: { ...(driveRead.decision ? { decision: driveRead.decision } : {}), reason: driveRead.reason } });
    const driveSearch = specialist.id === "jarvis" && !body.relaySpecialistReply && currentUserUtterance !== undefined
      ? await resolveProductionDriveSearch({ currentUserUtterance,
          ...(Object.hasOwn(body, "pendingAuthorizationReference")
            ? { pendingAuthorizationReference: body.pendingAuthorizationReference }
            : {}),
        }, driveSearchDependencies) : null;
    if (driveSearch?.handled) {
      return NextResponse.json({ reply: driveSearch.reply, specialistId: specialist.id, execution: "none",
        driveSearchAuthority: { ...(driveSearch.decision ? { decision: driveSearch.decision } : {}), reason: driveSearch.reason },
        ...(driveSearch.files ? { driveFiles: driveSearch.files } : {}),
        ...(driveSearch.pendingAuthorizationReference !== undefined
          ? { pendingAuthorizationReference: driveSearch.pendingAuthorizationReference }
          : {}) });
    }
    const gmailSearch = specialist.id === "jarvis" && !body.relaySpecialistReply && currentUserUtterance !== undefined
      ? await resolveProductionGmailSearch({ currentUserUtterance,
          ...(Object.hasOwn(body, "pendingAuthorizationReference")
            ? { pendingAuthorizationReference: body.pendingAuthorizationReference }
            : {}),
        }, gmailSearchDependencies) : null;
    if (gmailSearch?.handled) {
      return NextResponse.json({ reply: gmailSearch.reply, specialistId: specialist.id, execution: "none",
        gmailSearchAuthority: { ...(gmailSearch.decision ? { decision: gmailSearch.decision } : {}), reason: gmailSearch.reason },
        ...(gmailSearch.messageIds ? { messageIds: gmailSearch.messageIds } : {}),
        ...(gmailSearch.pendingAuthorizationReference !== undefined
          ? { pendingAuthorizationReference: gmailSearch.pendingAuthorizationReference }
          : {}) });
    }
    const gmail = specialist.id === "jarvis" && !body.relaySpecialistReply && currentUserUtterance !== undefined
      ? await resolveProductionGmailRead({ currentUserUtterance,
          ...(Object.hasOwn(body, "pendingAuthorizationReference")
            ? { pendingAuthorizationReference: body.pendingAuthorizationReference }
            : {}),
        }, gmailDependencies)
      : null;
    if (gmail?.handled) {
      return NextResponse.json({ reply: gmail.reply, specialistId: specialist.id, execution: "none",
        gmailAuthority: { ...(gmail.decision ? { decision: gmail.decision } : {}), reason: gmail.reason },
        ...(gmail.pendingAuthorizationReference !== undefined
          ? { pendingAuthorizationReference: gmail.pendingAuthorizationReference }
          : {}) });
    }
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
      const fallback = formatCalendarReadResponse(calendar.evidence!, calendar.window ?? undefined);

      if (calendar.purpose === "calendar_attention") {
        if (calendar.evidence!.status !== "available" || !calendar.window) {
          return NextResponse.json({ reply: fallback, specialistId: specialist.id, execution: "none",
            calendarAuthority: { decision: "ALLOW", reason: calendar.reason } });
        }
        try {
          const attention = resolveLiveCalendarAttention({
            evidence: calendar.evidence!,
            window: calendar.window,
            ...(Object.hasOwn(body, "calendarAttentionObservationReference")
              ? { previousObservationReference: body.calendarAttentionObservationReference }
              : {}),
          });
          return NextResponse.json({
            reply: attention.reply,
            specialistId: specialist.id,
            execution: "none",
            calendarAuthority: { decision: "ALLOW", reason: calendar.reason },
            calendarAttentionObservationReference: attention.calendarAttentionObservationReference,
          });
        } catch (error) {
          console.error("[/api/lighter/chat] Calendar attention comparison failed:", error);
          return NextResponse.json({
            reply: "I couldn't safely compare this Calendar observation with the previous bounded baseline.",
            specialistId: specialist.id,
            execution: "none",
            calendarAuthority: { decision: "ALLOW", reason: calendar.reason },
          });
        }
      }
      if (calendar.evidence!.status !== "available" || !calendar.window) {
        return NextResponse.json({ reply: fallback, specialistId: specialist.id, execution: "none",
          calendarAuthority: { decision: "ALLOW", reason: calendar.reason } });
      }
      if (!areValidMessages(body.messages)) {
        return NextResponse.json({ reply: fallback, specialistId: specialist.id, execution: "none",
          calendarAuthority: { decision: "ALLOW", reason: calendar.reason } });
      }
      const projected = projectCalendarContext(calendar.evidence!.evidence, calendar.window);
      const bindingState = bindUserCalendarDetails(body.messages, projected.commitments);
      const deterministicReply = formatCalendarReadResponse(calendar.evidence!, calendar.window, bindingState);
      const governedContext = createGovernedContext(projectCalendarContext(calendar.evidence!.evidence, calendar.window,
        bindingState.bindings, bindingState.unbound));
      try {
        const systemPrompt = await buildSpecialistPrompt(specialist);
        const modelMessages = sanitizeModelHistory(body.messages);
        const result = await callModel(systemPrompt, modelMessages, JARVIS_TOOLS, governedContext);
        const modelReply = typeof result === "string" ? result : result.text;
        const guardedReply = guardOrdinaryModelReply(modelReply, currentUserUtterance, false, {
          hasCurrentCalendarGovernedContext: governedContext.sources.some(source => source.source === "calendar"),
          isCalendarRecollection: false,
          unboundUserDetails: bindingState.unbound,
          currentCommitmentClocks: governedContext.sources[0].commitments.map(commitment => formatMelbourneTime(commitment.start)),
          currentCalendarFallback: fallback,
        });
        const reply = calendarReplyPreservesProjection(guardedReply, projected.commitments)
          ? guardedReply
          : deterministicReply;
        return NextResponse.json({ reply, specialistId: specialist.id, execution: "none",
          calendarAuthority: { decision: "ALLOW", reason: calendar.reason } });
      } catch (error) {
        console.error("[/api/lighter/chat] Governed Calendar model invocation failed:", error);
      }
      return NextResponse.json({
        reply: deterministicReply,
        specialistId: specialist.id,
        execution: "none",
        calendarAuthority: { decision: "ALLOW", reason: calendar.reason },
      });
    }
    if (!areValidMessages(body.messages)) {
      return NextResponse.json({ error: "`messages` must contain 1-40 valid conversation messages." }, { status: 400 });
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
      // Authority above is resolved from the untouched current utterance first.
      // Only the later, ordinary model call receives the private-release boundary.
      const governedDriveHistoryExcluded = hasGovernedDriveHistory(body.messages);
      const modelMessages = sanitizeModelHistory(body.messages);
      const result = tools
        ? await callModel(systemPrompt, modelMessages, tools)
        : await callModel(systemPrompt, modelMessages);
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
          // The model may suggest expertise, but it cannot manufacture a
          // substitute route around JARVIS's private-source authority paths.
          const privateAcquisition = (currentUserUtterance !== undefined
            && isPrivateAcquisitionHandoffRequest(currentUserUtterance))
            || (typeof taskSummary === "string" && isPrivateAcquisitionHandoffRequest(taskSummary))
            || (governedDriveHistoryExcluded && currentUserUtterance !== undefined
              && isAmbiguousPrivateReadFollowUp(currentUserUtterance));
          if (privateAcquisition) {
            return NextResponse.json({
              reply: PRIVATE_CAPABILITY_HANDOFF_BLOCKED_REPLY,
              specialistId: specialist.id,
              execution: "none",
            });
          }
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
      const calendarRecall = calendarRecallDiagnostics(body.messages);
      reply = guardOrdinaryModelReply(reply, currentUserUtterance, governedDriveHistoryExcluded, {
        hasCurrentCalendarGovernedContext: calendarRecall.hasCurrentCalendarGovernedContext,
        isCalendarRecollection: calendarRecall.isCalendarRecollection,
        priorVisibleReportIsScheduleOnly: calendarRecall.priorVisibleReportIsScheduleOnly,
        isDetailFollowUp: calendarRecall.isDetailFollowUp,
        boundUserDetails: calendarRecall.boundUserDetails,
        unknownCommitmentClocks: calendarRecall.unknownCommitmentClocks,
      });
      return NextResponse.json({ reply, specialistId: specialist.id, execution: "none" });
    } catch (error) {
      console.error("[/api/lighter/chat] Specialist invocation failed:", error);
      return NextResponse.json({ error: "Specialist invocation failed.", state: "unknown" }, { status: 502 });
    }
  };
}
