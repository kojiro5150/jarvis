import { NextResponse } from "next/server";
import { callClaude } from "@/lib/claude";
import type { ClaudeResult, ClaudeTool } from "@/lib/claude";
import type { ChatMessage } from "@/lib/agents/types";
import { areValidMessages, areValidMessageTranscript, buildSpecialistPrompt } from "@/lib/lighter-jarvis/runtime";
import { getLighterSpecialist } from "@/lib/lighter-jarvis/specialists";
import { resolveProductionCalendarRead, type ProductionCalendarDependencies } from "@/lib/lighter-jarvis/production-calendar-read";
import { CALENDAR_TIME_ZONE } from "@/lib/lighter-jarvis/calendar-read-window";
import { resolveProductionGmailRead, type ProductionGmailDependencies } from "@/lib/lighter-jarvis/production-gmail-read";
import { resolveProductionGmailSearch, type ProductionGmailSearchDependencies } from "@/lib/lighter-jarvis/production-gmail-search";
import { resolveGmailOrdinalReadProposal } from "@/lib/lighter-jarvis/gmail-ordinal-read";
import { hasGovernedDriveHistory, hasGovernedGmailHistory, sanitizeModelHistory } from "@/lib/lighter-jarvis/model-history-boundary";
import {
  GMAIL_NO_PENDING_READ_AUTHORITY_REPLY,
  GMAIL_SELECTED_MESSAGE_READ_CONTAINMENT_REPLY,
  isAmbiguousGmailEvidenceFollowUp,
  isUnsupportedGmailReadAuthorityContinuation,
} from "@/lib/lighter-jarvis/private-capability-handoff-guard";
import { guardOrdinaryModelReply } from "@/lib/lighter-jarvis/ordinary-model-reply-guard";
import { resolveProductionDriveSearch, type ProductionDriveSearchDependencies } from "@/lib/lighter-jarvis/production-drive-search";
import { resolveProductionDriveRead, type ProductionDriveReadDependencies } from "@/lib/lighter-jarvis/production-drive-read";
import { bindUserCalendarDetails, projectCalendarContext, type CalendarBindingState } from "@/lib/lighter-jarvis/calendar-governed-context";
import { createGovernedContext, type GovernedContext } from "@/lib/lighter-jarvis/governed-context";
import { calendarRecallDiagnostics, displayCalendarClock, normalizedCalendarClock } from "@/lib/lighter-jarvis/calendar-provenance-truthfulness";
import { resolveLiveCalendarAttention } from "@/lib/lighter-jarvis/live-calendar-attention";
import { renderGovernedWeeklyCalendarAllocation } from "@/lib/lighter-jarvis/calendar-weekly-allocation-renderer";
import {
  isUnsupportedCalendarFactualWording,
  renderCalendarFactualSelection,
  selectCalendarFactualQuery,
} from "@/lib/lighter-jarvis/calendar-factual-query";
import { interpretCalendarConversationalIntent, isCalendarConversationalIntentCandidate } from "@/lib/lighter-jarvis/calendar-conversational-intent";
import { deterministicCapabilityConstraint, isConversationalCapabilitySelectionCandidate, selectConversationalCapability } from "@/lib/lighter-jarvis/conversational-capability-selector";
import { materializeConversationalPrivateOperation } from "@/lib/lighter-jarvis/conversational-private-operation";
import { createPendingAuthorization } from "@/lib/lighter-jarvis/pending-authorization";
import { proposeCalendarRead } from "@/lib/lighter-jarvis/calendar-read-proposal";
import {
  GMAIL_STANDING_AUTHORITY_REPLY,
  isGmailStandingAuthorityRequest,
} from "@/lib/lighter-jarvis/gmail-standing-authority";
import { isUnboundOrdinalReferenceUtterance, UNBOUND_ORDINAL_REFERENCE_REPLY } from "@/lib/governance-core/unbound-reference";
import {
  isCalendarConflictUnderstandIntent,
  resolveCalendarConflictUnderstand,
} from "@/lib/lighter-jarvis/calendar-conflict-understand";
import {
  advanceCalendarConflictReasoningReferenceUserTurn,
  resolveCalendarConflictReasoningReference,
} from "@/lib/lighter-jarvis/calendar-conflict-reasoning-reference";
import {
  createCalendarAdvicePreferenceReference,
  isSupportedCalendarAdvicePreferenceUtterance,
} from "@/lib/lighter-jarvis/calendar-advice-preference-reference";
import {
  isCalendarConflictAdviseQuestion,
  resolveCalendarConflictAdvise,
} from "@/lib/lighter-jarvis/calendar-conflict-advise";
import { resolveCalendarReadWindow } from "@/lib/lighter-jarvis/calendar-read-window";
import {
  advanceCalendarAdviceReferenceUserTurn,
  resolveCalendarAdviceReference,
} from "@/lib/lighter-jarvis/calendar-advice-reference";
import {
  isCalendarActInstruction,
  validateCalendarAdviceForAct,
} from "@/lib/lighter-jarvis/calendar-conflict-act";
import { executeConfirmedCalendarMove } from "@/lib/lighter-jarvis/calendar-move-execution";
import { GoogleCalendarEventWriteConnector, type CalendarEventWritePort } from "@/lib/connectors/google/calendar-write";
import { GoogleCalendarConnector } from "@/lib/connectors/google/calendar";
import { hasGoogleCalendarWriteScope } from "@/lib/connectors/google/calendar-write-scope";
import type { ScopedCalendarAcquisitionPort } from "@/lib/governed-conversation/scoped-calendar-evidence-acquisition-adapter";

interface LighterChatBody {
  specialistId?: unknown;
  messages?: unknown;
  pendingAuthorizationReference?: unknown;
  gmailSenderDisambiguationReference?: unknown;
  gmailMessageListReference?: unknown;
  calendarAttentionObservationReference?: unknown;
  calendarConflictReasoningReference?: unknown;
  calendarAdvicePreferenceReference?: unknown;
  calendarAdviceReference?: unknown;
  calendarMoveProposalReference?: unknown;
  calendarMoveAuthorizationReference?: unknown;
}
type ModelCall = (
  systemPrompt: string,
  messages: ChatMessage[],
  tools?: ClaudeTool[],
  governedContext?: GovernedContext,
) => Promise<string | ClaudeResult>;


const PUBLIC_WEB_TOOLS: ClaudeTool[] = [
  { type: "web_search_20250305", name: "web_search" },
];

const PUBLIC_WEB_GUIDANCE = [
  "You have access to web search for public information.",
  "Use it when the answer depends on current, recent, externally changing, or specifically requested public information.",
  "If the user asks about a public person, organisation, brand, website, publication, product, place, event, or topic and you do not have enough specific information to answer well, search the web immediately.",
  "Do not ask the user whether they want you to search the public web. Public web search does not require a permission ceremony.",
  "For stable explanatory questions, answer normally without searching unless search would materially help.",
  "When the current user utterance explicitly supplies a personal plan, location, or other contextual fact for a public-information question, you may use it as user-provided context without requiring a private connector lookup. Attribute it to the user when material; do not claim it came from Calendar, Gmail, Drive, or any other governed source unless governed context for this turn establishes that.",
  "For every factual claim derived from public web results, verify that the retrieved result supports the same entity, date or time period, location, and requested attribute before presenting it.",
  "When the user asks for current, latest, newest, most recent, stable, active, incumbent, or otherwise freshness-sensitive public information, establish freshness from a current authoritative or canonical source when available, and verify that no newer authoritative result supersedes the candidate before calling it current or latest.",
  "Do not treat an old release page, dated article, stale snippet, cached result, or a source that merely mentions a candidate as proof that it is still current or latest.",
  "Prefer primary/canonical sources for version, office-holder, schedule, price, policy, product, release, and status claims when those sources are available.",
  "If authoritative results establish multiple candidates for the same freshness-sensitive attribute, compare them before answering. Once a newer or otherwise superseding candidate is established, do not label an older candidate current, latest, newest, most recent, stable, active, incumbent, or equivalent.",
  "When the user's freshness term is ambiguous within the source's own taxonomy, preserve that taxonomy instead of collapsing it. For example, if a project distinguishes Current from LTS, report both relevant categories rather than silently treating one as the meaning of stable.",
  "Do not combine nearby rows, adjacent dates, similarly named entities, snippets, or separate sources into a stronger claim than any retrieved result supports.",
  "Answer the user's exact question first and keep freshness-sensitive factual replies minimal by default. Do not volunteer historical background, causal explanations, trend claims, streaks, rankings, or adjacent metrics unless the user asked for them or they are necessary to answer accurately.",
  "Every additional numeric, historical, comparative, or trend claim must be directly supported by retrieved evidence for that exact claim. Do not derive or announce a streak such as consecutive rises or falls unless an authoritative source explicitly states it or a deterministic non-model computation has established it.",
  "For freshness-sensitive public facts, briefly identify the authoritative source and relevant as-of date or release period when that can be done without obscuring the answer.",
  "Never invent, infer, interpolate, or complete a missing public fact merely because it would make the answer more useful or coherent.",
  "If sources conflict, identify the conflict or uncertainty instead of silently choosing or blending them.",
  "If web search fails or does not establish the requested fact, say that plainly rather than guessing from memory.",
].join("\n");

const PUBLIC_WEB_FAILURE_REPLY =
  "I couldn't retrieve the public information needed for that answer right now.";

const PUBLIC_LOCAL_DATE_PARTS = new Intl.DateTimeFormat("en-CA", {
  timeZone: CALENDAR_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const PUBLIC_DATE_PRESENTATION = new Intl.DateTimeFormat("en-AU", {
  timeZone: "UTC",
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});
const PUBLIC_LOCAL_TIME_PRESENTATION = new Intl.DateTimeFormat("en-AU", {
  timeZone: CALENDAR_TIME_ZONE,
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

function publicLocalDate(now: Date, offsetDays = 0): string {
  const parts = Object.fromEntries(
    PUBLIC_LOCAL_DATE_PARTS.formatToParts(now)
      .filter(part => part.type !== "literal")
      .map(part => [part.type, part.value]),
  );
  const shifted = new Date(Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day) + offsetDays,
    12,
  ));
  return PUBLIC_DATE_PRESENTATION.format(shifted);
}

export function buildPublicTemporalGuidance(now: Date): string {
  return [
    "Current user-local temporal anchor for public information:",
    `- Time zone: ${CALENDAR_TIME_ZONE}.`,
    `- Local time now: ${PUBLIC_LOCAL_TIME_PRESENTATION.format(now)}.`,
    `- Yesterday: ${publicLocalDate(now, -1)}.`,
    `- Today: ${publicLocalDate(now)}.`,
    `- Tomorrow: ${publicLocalDate(now, 1)}.`,
    "Resolve relative dates and dayparts against this user-local anchor before searching or answering.",
    "Do not derive today/tomorrow from the server clock, model memory, or dates mentioned in search results.",
    "When reporting a relative date, make sure its weekday and calendar date agree with this anchor.",
    "For weather or other multi-day public results, match each reported condition, probability, temperature, warning, or time window to the exact target local date before using it. Do not attach an adjacent day's forecast details to the requested date.",
  ].join("\n");
}

const PUBLIC_RELATIVE_DAY = /\b(yesterday|today|tomorrow)\b/i;
const PUBLIC_FRESHNESS_SIGNAL = new RegExp(
  [
    "\\b(?:latest|newest|most recent)\\s+(?:stable\\s+)?(?:version|release|update|result|score|ranking|price|rate|policy|status|schedule|forecast|report|article|news|data|figures?|statistics?)\\b",
    "\\bcurrent(?:ly)?\\s+(?:CEO|president|prime minister|leader|chair|chairperson|owner|version|release|price|rate|policy|status|schedule|forecast|ranking|score|LTS|stable version)\\b",
    "\\b(?:active|incumbent)\\s+(?:CEO|president|prime minister|leader|chair|chairperson|office-holder|officeholder)\\b",
    "\\btoday(?:'s)?\\s+(?:price|rate|schedule|forecast|score|result|news|status|ranking)\\b",
    "\b(?:what|who|which|when|where|show|find|give|tell)\\b[^?]{0,80}\\b(?:current|currently|latest|newest|most recent|stable|active|incumbent)\\b",
  ].join("|"),
  "i",
);

export function isFreshnessSensitivePublicInformation(utterance: string): boolean {
  return PUBLIC_FRESHNESS_SIGNAL.test(utterance);
}

export function hasPublicWebSearchEvidence(result: string | ClaudeResult): boolean {
  if (typeof result === "string") return false;
  return result.content.some(block =>
    block.type === "web_search_tool_result"
      || (block.type === "server_tool_use" && block.name === "web_search")
  );
}

export function anchorPublicInformationModelTurn(messages: readonly ChatMessage[], now: Date): ChatMessage[] {
  const copy = messages.map(message => ({ role: message.role, content: message.content }));
  const currentUserIndex = copy.findLastIndex(message => message.role === "user");
  if (currentUserIndex < 0) return copy;
  const utterance = copy[currentUserIndex].content;
  const constraints: string[] = [];
  const relative = utterance.match(PUBLIC_RELATIVE_DAY)?.[1]?.toLowerCase();

  if (relative) {
    const offset = relative === "yesterday" ? -1 : relative === "tomorrow" ? 1 : 0;
    const resolved = publicLocalDate(now, offset);
    constraints.push(`Resolved public-information target date: ${resolved}. For any public search or factual answer, use this exact local date. Do not use adjacent-day or mismatched-period details.`);
  }

  if (isFreshnessSensitivePublicInformation(utterance)) {
    constraints.push(`Freshness-sensitive public-information request as of ${publicLocalDate(now)}. Verify the candidate against a current authoritative or canonical source, and verify that no newer authoritative result supersedes it before describing it as current, latest, newest, most recent, stable, active, or incumbent. An older release page, article, snippet, or mention is not sufficient proof of currentness. If authoritative results establish multiple candidates, compare them and discard superseded candidates from the requested freshness label. If the source taxonomy makes the user's term ambiguous, preserve the source taxonomy explicitly rather than collapsing categories.`);
  }

  if (constraints.length === 0) return copy;

  copy[currentUserIndex] = {
    role: "user",
    content: `${utterance}\n\n[${constraints.join(" ")} Preserve the exact named entity, location, and requested attribute from my question. If retrieved evidence does not support the exact claim, say so rather than inferring or fabricating it.]`,
  };
  return copy;
}

export function formatCalendarReadResponse(calendar: NonNullable<Awaited<ReturnType<typeof resolveProductionCalendarRead>>["evidence"]>,
  window?: NonNullable<Awaited<ReturnType<typeof resolveProductionCalendarRead>>["window"]>,
  bindingState?: CalendarBindingState): string {
  if (calendar.status !== "available") return "I couldn't access your Calendar right now.";
  if (calendar.evidence.length === 0 && window) return clearCalendarPeriod(window.period);
  if (calendar.evidence.length > 0 && window) {
    const includeDate = window.period === "this_week" || window.period === "next_week" || window.period === "default";
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
    next_week: "Next week",
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
    next_week: "Next week is clear.",
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

export type CalendarActDependencies = Readonly<{
  createReadConnector: () => ScopedCalendarAcquisitionPort;
  createWriteConnector: () => CalendarEventWritePort;
  hasWriteScope: () => Promise<boolean>;
  clock: () => Date;
}>;

const REFERENTIAL_CALENDAR_MUTATION = /^\s*(?:move|reschedule|shift|change)\s+(?:it|that|this)\b/i;

function hasPriorGovernedCalendarFactualResult(messages: unknown): boolean {
  return Array.isArray(messages) && messages.some((message) =>
    typeof message === "object"
    && message !== null
    && "role" in message
    && message.role === "assistant"
    && "content" in message
    && typeof message.content === "string"
    && message.content.startsWith("Calendar factual result:")
  );
}

const defaultCalendarActDependencies: CalendarActDependencies = {
  createReadConnector: () => new GoogleCalendarConnector(),
  createWriteConnector: () => new GoogleCalendarEventWriteConnector(),
  hasWriteScope: () => hasGoogleCalendarWriteScope(),
  clock: () => new Date(),
};

export function createLighterChatHandler(callModel: ModelCall = callClaude, calendarDependencies?: ProductionCalendarDependencies,
  gmailDependencies?: ProductionGmailDependencies, gmailSearchDependencies?: ProductionGmailSearchDependencies,
  driveSearchDependencies?: ProductionDriveSearchDependencies, driveReadDependencies?: ProductionDriveReadDependencies,
  calendarActDependencies: CalendarActDependencies = defaultCalendarActDependencies) {
  return async function POST(request: Request) {
    let body: LighterChatBody;
    try { body = await request.json() as LighterChatBody; }
    catch { return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }); }

    if (typeof body.specialistId !== "string") {
      return NextResponse.json({ error: "`specialistId` is required." }, { status: 400 });
    }
    const specialist = getLighterSpecialist(body.specialistId.toLowerCase());
    if (!specialist) {
      return NextResponse.json({ error: "Only JARVIS is available in this runtime." }, { status: 404 });
    }
    // Deterministic authority resolution needs only a valid current utterance.
    // Do not reject a long client transcript before an opaque pending reference
    // has had the opportunity to reach its server-owned resolver.
    if (!areValidMessageTranscript(body.messages)) {
      return NextResponse.json({ error: "`messages` must contain valid conversation messages." }, { status: 400 });
    }
    const currentUserUtterance = [...body.messages].reverse().find(({ role }) => role === "user")?.content;
    const standingGmailAuthorityRequest = currentUserUtterance !== undefined
      && isGmailStandingAuthorityRequest(currentUserUtterance);
    const freshCapabilityRequest = currentUserUtterance !== undefined
      && (deterministicCapabilityConstraint(currentUserUtterance) !== null
        || proposeCalendarRead(currentUserUtterance, calendarDependencies?.clock ?? (() => new Date())) !== null);
    const shouldCarryPendingAuthorization = Object.hasOwn(body, "pendingAuthorizationReference")
      && !freshCapabilityRequest
      && !standingGmailAuthorityRequest;

    if (specialist.id === "jarvis" && standingGmailAuthorityRequest) {
      return NextResponse.json({
        reply: GMAIL_STANDING_AUTHORITY_REPLY,
        specialistId: specialist.id,
        execution: "none",
      });
    }

    if (specialist.id === "jarvis" && currentUserUtterance !== undefined) {
      if (Object.hasOwn(body, "calendarConflictReasoningReference")) {
        advanceCalendarConflictReasoningReferenceUserTurn(body.calendarConflictReasoningReference);
      }
      if (Object.hasOwn(body, "calendarAdviceReference")) {
        advanceCalendarAdviceReferenceUserTurn(body.calendarAdviceReference);
      }

      if (Object.hasOwn(body, "calendarMoveAuthorizationReference")) {
        const execution = await executeConfirmedCalendarMove({
          authorizationReference: body.calendarMoveAuthorizationReference,
          currentUserUtterance,
          readConnector: calendarActDependencies.createReadConnector(),
          writeConnector: calendarActDependencies.createWriteConnector(),
          clock: calendarActDependencies.clock,
        });
        return NextResponse.json({
          reply: execution.reply,
          specialistId: specialist.id,
          execution: execution.status === "resolved" ? "calendar.event.move" : "none",
          calendarConflictAct: { status: execution.status },
          calendarMoveAuthorizationReference: null,
          calendarMoveProposalReference: body.calendarMoveProposalReference ?? null,
          calendarAdviceReference: body.calendarAdviceReference ?? null,
        });
      }

      if (isCalendarActInstruction(currentUserUtterance)) {
        const now = calendarActDependencies.clock();
        const advice = resolveCalendarAdviceReference({
          reference: body.calendarAdviceReference,
          now,
        });
        if (!advice) {
          return NextResponse.json({
            reply: "I don't have an eligible governed Calendar recommendation to execute.",
            specialistId: specialist.id,
            execution: "none",
            calendarConflictAct: { status: "invalid_advice" },
            calendarAdviceReference: null,
          });
        }
        if (!(await calendarActDependencies.hasWriteScope())) {
          return NextResponse.json({
            reply: "Calendar write access is not active in the stored Google grant. Please reconnect Google before I can make this change.",
            specialistId: specialist.id,
            execution: "none",
            calendarConflictAct: { status: "write_scope_missing" },
            calendarAdviceReference: body.calendarAdviceReference,
          });
        }
        const proposedOperation = Object.freeze({
          capability: "calendar.read" as const,
          window: resolveCalendarReadWindow("today", now),
          purpose: "calendar_act_validation" as const,
        });
        return NextResponse.json({
          reply: "Please explicitly confirm that I may re-read your Calendar to validate the exact move before I ask for write approval.",
          specialistId: specialist.id,
          execution: "none",
          calendarConflictAct: { status: "ask_validation_read" },
          calendarAdviceReference: body.calendarAdviceReference,
          pendingAuthorizationReference: createPendingAuthorization(proposedOperation),
        });
      }
      if (isCalendarConflictAdviseQuestion(currentUserUtterance)
        && Object.hasOwn(body, "calendarConflictReasoningReference")) {
        const historical = resolveCalendarConflictReasoningReference({
          reference: body.calendarConflictReasoningReference,
          now: calendarDependencies?.clock() ?? new Date(),
        });
        if (historical.status !== "resolved") {
          return NextResponse.json({
            reply: "I don't have an eligible governed Calendar conflict to advise on.",
            specialistId: specialist.id,
            execution: "none",
            calendarConflictAdvise: { status: historical.status },
            calendarConflictReasoningReference: historical.status === "expired" ? null : body.calendarConflictReasoningReference,
          });
        }
        return NextResponse.json({
          reply: "I can give you a recommendation, but I don't yet have a legitimate basis for choosing which commitment should yield. If your preference is to keep the invitation when the full deep-work block can be preserved later, say so and I can evaluate that option.",
          specialistId: specialist.id,
          execution: "none",
          calendarConflictAdvise: { status: "missing_preference" },
          calendarConflictReasoningReference: body.calendarConflictReasoningReference,
        });
      }

      if (isSupportedCalendarAdvicePreferenceUtterance(currentUserUtterance)
        && Object.hasOwn(body, "calendarConflictReasoningReference")
        && !Object.hasOwn(body, "pendingAuthorizationReference")) {
        const now = calendarDependencies?.clock() ?? new Date();
        const historical = resolveCalendarConflictReasoningReference({
          reference: body.calendarConflictReasoningReference,
          now,
        });
        if (historical.status !== "resolved") {
          return NextResponse.json({
            reply: "I don't have an eligible governed Calendar conflict to evaluate under that preference.",
            specialistId: specialist.id,
            execution: "none",
            calendarConflictAdvise: { status: historical.status },
            calendarConflictReasoningReference: historical.status === "expired" ? null : body.calendarConflictReasoningReference,
          });
        }
        const preferenceReference = createCalendarAdvicePreferenceReference(now);
        if (!preferenceReference) {
          return NextResponse.json({
            reply: "I couldn't safely preserve that advice preference.",
            specialistId: specialist.id,
            execution: "none",
            calendarConflictAdvise: { status: "invalid" },
          });
        }
        const proposedOperation = Object.freeze({
          capability: "calendar.read" as const,
          window: resolveCalendarReadWindow("today", now),
          purpose: "calendar_advise" as const,
        });
        return NextResponse.json({
          reply: "Please explicitly confirm that I may read your Calendar to evaluate that option.",
          specialistId: specialist.id,
          execution: "none",
          calendarConflictAdvise: { status: "ask_calendar_authority" },
          calendarConflictReasoningReference: body.calendarConflictReasoningReference,
          calendarAdvicePreferenceReference: preferenceReference,
          pendingAuthorizationReference: createPendingAuthorization(proposedOperation),
        });
      }

      if (isCalendarConflictUnderstandIntent(currentUserUtterance)) {
        const understand = await resolveCalendarConflictUnderstand({
          utterance: currentUserUtterance,
          reasoningReference: body.calendarConflictReasoningReference,
          callModel,
          now: calendarDependencies?.clock() ?? new Date(),
        });
        if (understand.handled) {
          const retainReference = understand.status === "resolved"
            || understand.status === "model_failed"
            || understand.status === "model_invalid";
          return NextResponse.json({
            reply: understand.reply,
            specialistId: specialist.id,
            execution: "none",
            calendarConflictUnderstand: { status: understand.status },
            calendarConflictReasoningReference: retainReference
              ? body.calendarConflictReasoningReference
              : null,
          });
        }
      }
    }

    if (specialist.id === "jarvis"
      && currentUserUtterance !== undefined
      && REFERENTIAL_CALENDAR_MUTATION.test(currentUserUtterance)
      && hasPriorGovernedCalendarFactualResult(body.messages)) {
      return NextResponse.json({
        reply: "I can't safely bind that referential Calendar change to a governed event yet. No Calendar write was attempted.",
        specialistId: specialist.id,
        execution: "none",
        calendarConflictAct: { status: "unbound_reference" },
      });
    }

    const driveRead = specialist.id === "jarvis" && currentUserUtterance !== undefined
      ? await resolveProductionDriveRead({ currentUserUtterance }, driveReadDependencies) : null;
    if (driveRead?.handled) return NextResponse.json({ reply: driveRead.reply, specialistId: specialist.id, execution: "none",
      driveReadAuthority: { ...(driveRead.decision ? { decision: driveRead.decision } : {}), reason: driveRead.reason } });
    const driveSearch = specialist.id === "jarvis" && currentUserUtterance !== undefined
      ? await resolveProductionDriveSearch({ currentUserUtterance,
          ...(shouldCarryPendingAuthorization
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
    const gmailOrdinalRead = specialist.id === "jarvis" && currentUserUtterance !== undefined
      ? resolveGmailOrdinalReadProposal({
          currentUserUtterance,
          ...(Object.hasOwn(body, "gmailMessageListReference")
            ? { gmailMessageListReference: body.gmailMessageListReference }
            : {}),
        })
      : null;
    if (gmailOrdinalRead?.handled) {
      return NextResponse.json({
        reply: gmailOrdinalRead.reply,
        specialistId: specialist.id,
        execution: "none",
        gmailAuthority: { decision: "ASK", reason: "ordinal_message_selected_requires_read_authority" },
        ...(gmailOrdinalRead.pendingAuthorizationReference !== undefined
          ? { pendingAuthorizationReference: gmailOrdinalRead.pendingAuthorizationReference }
          : {}),
        ...(gmailOrdinalRead.gmailMessageListReference !== undefined
          ? { gmailMessageListReference: gmailOrdinalRead.gmailMessageListReference }
          : {}),
      });
    }

    if (specialist.id === "jarvis"
      && currentUserUtterance !== undefined
      && !Object.hasOwn(body, "gmailMessageListReference")
      && !Object.hasOwn(body, "pendingAuthorizationReference")
      && isUnboundOrdinalReferenceUtterance(currentUserUtterance)) {
      return NextResponse.json({
        reply: UNBOUND_ORDINAL_REFERENCE_REPLY,
        specialistId: specialist.id,
        execution: "none",
      });
    }

    const gmailSearch = specialist.id === "jarvis" && currentUserUtterance !== undefined
      ? await resolveProductionGmailSearch({ currentUserUtterance,
          ...(shouldCarryPendingAuthorization
            ? { pendingAuthorizationReference: body.pendingAuthorizationReference }
            : {}),
          ...(Object.hasOwn(body, "gmailSenderDisambiguationReference")
            ? { gmailSenderDisambiguationReference: body.gmailSenderDisambiguationReference }
            : {}),
        }, gmailSearchDependencies) : null;
    if (gmailSearch?.handled) {
      return NextResponse.json({ reply: gmailSearch.reply, specialistId: specialist.id, execution: "none",
        gmailSearchAuthority: { ...(gmailSearch.decision ? { decision: gmailSearch.decision } : {}), reason: gmailSearch.reason },
        ...(gmailSearch.messageIds && !gmailSearch.gmailMessageListReference ? { messageIds: gmailSearch.messageIds } : {}),
        ...(gmailSearch.pendingAuthorizationReference !== undefined
          ? { pendingAuthorizationReference: gmailSearch.pendingAuthorizationReference }
          : {}),
        ...(gmailSearch.gmailSenderDisambiguationReference !== undefined
          ? { gmailSenderDisambiguationReference: gmailSearch.gmailSenderDisambiguationReference }
          : {}),
        ...(gmailSearch.gmailMessageListReference !== undefined
          ? { gmailMessageListReference: gmailSearch.gmailMessageListReference }
          : {}) });
    }
    const gmail = specialist.id === "jarvis" && currentUserUtterance !== undefined
      ? await resolveProductionGmailRead({ currentUserUtterance,
          ...(shouldCarryPendingAuthorization
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
    let interpretedCalendarFactualQuery: import("@/lib/lighter-jarvis/calendar-factual-query").CalendarFactualQuery | null = null;
    if (specialist.id === "jarvis"
      && currentUserUtterance !== undefined
      && !shouldCarryPendingAuthorization
      && isCalendarConversationalIntentCandidate(currentUserUtterance)) {
      try {
        interpretedCalendarFactualQuery = await interpretCalendarConversationalIntent({
          utterance: currentUserUtterance,
          callModel,
        });
      } catch (error) {
        console.error("[/api/lighter/chat] Calendar conversational intent interpretation failed:", error);
      }
    }
    const calendar = specialist.id === "jarvis" && currentUserUtterance !== undefined
      ? await resolveProductionCalendarRead({
          currentUserUtterance,
          ...(shouldCarryPendingAuthorization
            ? { pendingAuthorizationReference: body.pendingAuthorizationReference }
            : {}),
          ...(interpretedCalendarFactualQuery ? { interpretedFactualQuery: interpretedCalendarFactualQuery } : {}),
        }, calendarDependencies)
      : null;
    if (calendar?.handled && calendar.decision !== "ALLOW") {
      const reply = calendar.decision === "DENY"
        ? "Understood. I won't read your Calendar."
        : calendar.purpose === "calendar_advise"
          ? "Please explicitly confirm that I may read your Calendar to evaluate that option."
          : calendar.purpose === "calendar_act_validation"
            ? "Please explicitly confirm that I may re-read your Calendar to validate the exact move before I ask for write approval."
            : "Please explicitly confirm that I may read your Calendar.";
      return NextResponse.json({ reply, specialistId: specialist.id, execution: "none",
        calendarAuthority: { decision: calendar.decision, reason: calendar.reason },
        pendingAuthorizationReference: calendar.pendingAuthorizationReference,
        ...(calendar.purpose === "calendar_advise" ? {
          calendarConflictReasoningReference: body.calendarConflictReasoningReference,
          calendarAdvicePreferenceReference: body.calendarAdvicePreferenceReference,
        } : {}),
        ...(calendar.purpose === "calendar_act_validation" ? {
          calendarAdviceReference: body.calendarAdviceReference,
        } : {}) });
    }
    if (calendar?.decision === "ALLOW") {
      const fallback = formatCalendarReadResponse(calendar.evidence!, calendar.window ?? undefined);

      if (calendar.purpose === "calendar_act_validation") {
        if (!calendar.window || !calendar.evidence) {
          return NextResponse.json({
            reply: "I couldn't obtain the governed current Calendar state required to validate that move.",
            specialistId: specialist.id,
            execution: "none",
            calendarAuthority: { decision: "ALLOW", reason: calendar.reason },
            calendarConflictAct: { status: "invalid" },
          });
        }
        const validation = validateCalendarAdviceForAct({
          adviceReference: body.calendarAdviceReference,
          evidence: calendar.evidence,
          window: calendar.window,
          now: calendarActDependencies.clock(),
        });
        return NextResponse.json({
          reply: validation.reply,
          specialistId: specialist.id,
          execution: "none",
          calendarAuthority: { decision: "ALLOW", reason: calendar.reason },
          calendarConflictAct: { status: validation.status },
          calendarAdviceReference: body.calendarAdviceReference,
          ...(validation.calendarMoveProposalReference
            ? { calendarMoveProposalReference: validation.calendarMoveProposalReference }
            : {}),
          ...(validation.calendarMoveAuthorizationReference
            ? { calendarMoveAuthorizationReference: validation.calendarMoveAuthorizationReference }
            : {}),
        });
      }

      if (calendar.purpose === "calendar_advise") {
        if (!calendar.window || !calendar.evidence) {
          return NextResponse.json({
            reply: "I couldn't obtain the governed current Calendar state required for advice.",
            specialistId: specialist.id,
            execution: "none",
            calendarAuthority: { decision: "ALLOW", reason: calendar.reason },
            calendarConflictAdvise: { status: "invalid" },
          });
        }
        const advice = await resolveCalendarConflictAdvise({
          reasoningReference: body.calendarConflictReasoningReference,
          preferenceReference: body.calendarAdvicePreferenceReference,
          evidence: calendar.evidence,
          window: calendar.window,
          callModel,
          now: calendarDependencies?.clock() ?? new Date(),
        });
        return NextResponse.json({
          reply: advice.reply,
          specialistId: specialist.id,
          execution: "none",
          calendarAuthority: { decision: "ALLOW", reason: calendar.reason },
          calendarConflictAdvise: { status: advice.status },
          calendarConflictReasoningReference: body.calendarConflictReasoningReference,
          calendarAdvicePreferenceReference: body.calendarAdvicePreferenceReference,
          ...(advice.calendarAdviceReference
            ? { calendarAdviceReference: advice.calendarAdviceReference }
            : {}),
        });
      }

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
            ...(Object.hasOwn(body, "calendarConflictReasoningReference")
              ? { previousReasoningReference: body.calendarConflictReasoningReference }
              : {}),
          });
          return NextResponse.json({
            reply: attention.reply,
            specialistId: specialist.id,
            execution: "none",
            calendarAuthority: { decision: "ALLOW", reason: calendar.reason },
            calendarAttentionObservationReference: attention.calendarAttentionObservationReference,
            ...(attention.calendarConflictReasoningReference
              ? { calendarConflictReasoningReference: attention.calendarConflictReasoningReference }
              : {}),
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

      if (calendar.purpose === "calendar_weekly_allocation") {
        if (calendar.evidence!.status !== "available" || !calendar.window) {
          return NextResponse.json({ reply: fallback, specialistId: specialist.id, execution: "none",
            calendarAuthority: { decision: "ALLOW", reason: calendar.reason } });
        }
        if (!calendar.evidence!.weeklyAllocation) {
          const reply = calendar.evidence!.coverageState === "bounded_partial_request"
            || calendar.evidence!.coverageState === "bounded"
            ? "I can't truthfully report your full weekly allocation because this bounded Calendar read was not complete."
            : "I couldn't safely publish this weekly allocation from the governed Calendar result.";
          return NextResponse.json({ reply, specialistId: specialist.id, execution: "none",
            calendarAuthority: { decision: "ALLOW", reason: calendar.reason } });
        }
        const rendered = renderGovernedWeeklyCalendarAllocation(calendar.evidence!.weeklyAllocation);
        return NextResponse.json({
          reply: rendered ?? "I couldn't safely render this weekly allocation because the governed totals did not reconcile.",
          specialistId: specialist.id,
          execution: "none",
          calendarAuthority: { decision: "ALLOW", reason: calendar.reason },
        });
      }
      if (calendar.purpose === "calendar_factual_query") {
        if (calendar.evidence!.status !== "available" || !calendar.window || !calendar.factualQuery) {
          return NextResponse.json({ reply: fallback, specialistId: specialist.id, execution: "none",
            calendarAuthority: { decision: "ALLOW", reason: calendar.reason } });
        }
        if (calendar.evidence!.coverageState !== "bounded_complete_request") {
          return NextResponse.json({
            reply: "Calendar factual result:\nI can't truthfully answer this factual Calendar query because the bounded read was not complete.",
            specialistId: specialist.id,
            execution: "none",
            calendarAuthority: { decision: "ALLOW", reason: calendar.reason },
          });
        }
        const selection = selectCalendarFactualQuery({
          events: calendar.evidence!.factualEvents ?? Object.freeze([]),
          query: calendar.factualQuery,
          window: calendar.window,
        });
        return NextResponse.json({
          reply: renderCalendarFactualSelection(selection, calendar.factualQuery),
          specialistId: specialist.id,
          execution: "none",
          calendarAuthority: { decision: "ALLOW", reason: calendar.reason },
        });
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
        const systemPrompt = await buildSpecialistPrompt();
        const modelMessages = sanitizeModelHistory(body.messages);
        const result = await callModel(systemPrompt, modelMessages, undefined, governedContext);
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
    if (specialist.id === "jarvis"
      && currentUserUtterance !== undefined
      && isUnsupportedCalendarFactualWording(currentUserUtterance)) {
      return NextResponse.json({
        reply: "I can check your Calendar for that, but I couldn't resolve the factual query safely from that wording.",
        specialistId: specialist.id,
        execution: "none",
      });
    }
    if (specialist.id === "jarvis"
      && currentUserUtterance !== undefined
      && !shouldCarryPendingAuthorization
      && isConversationalCapabilitySelectionCandidate(currentUserUtterance)) {
      try {
        const selectedIntent = await selectConversationalCapability({
          utterance: currentUserUtterance,
          callModel,
        });
        if (selectedIntent?.kind === "capability_request"
          && selectedIntent.capability !== "public_information") {
          const proposedOperation = materializeConversationalPrivateOperation(selectedIntent);
          if (proposedOperation?.capability === "gmail.search") {
            return NextResponse.json({
              reply: proposedOperation.resultMode === "sender_match"
                ? "I can search Gmail for messages from that sender reference. Please explicitly confirm that I may do that."
                : proposedOperation.resultMode === "subject_list"
                  ? `I can retrieve the subjects of up to five recent Gmail messages from the last ${proposedOperation.newerThan === "1d" ? "day" : "7 days"}. Please explicitly confirm that I may do that.`
                  : `I can search Gmail for up to five messages from the last ${proposedOperation.newerThan === "1d" ? "day" : "7 days"}. Please explicitly confirm that I may do that.`,
              specialistId: specialist.id,
              execution: "none",
              gmailSearchAuthority: { decision: "ASK", reason: "explicit_gmail_search_not_established" },
              pendingAuthorizationReference: createPendingAuthorization(proposedOperation),
            });
          }

          const sourceLabel = selectedIntent.capability === "gmail"
            ? "Gmail"
            : selectedIntent.capability === "drive"
              ? "Drive"
              : "Calendar";
          return NextResponse.json({
            reply: `I recognized that as a ${sourceLabel} request, but natural-language handoff to the governed ${sourceLabel} authority path is not yet available.`,
            specialistId: specialist.id,
            execution: "none",
          });
        }
      } catch (error) {
        console.error("[/api/lighter/chat] Conversational capability selection failed:", error);
      }
    }
    if (!areValidMessages(body.messages)) {
      return NextResponse.json({ error: "`messages` must contain 1-40 valid conversation messages." }, { status: 400 });
    }
    if (specialist.id === "jarvis"
      && currentUserUtterance !== undefined
      && hasGovernedGmailHistory(body.messages)
      && isAmbiguousGmailEvidenceFollowUp(currentUserUtterance)) {
      return NextResponse.json({
        reply: GMAIL_SELECTED_MESSAGE_READ_CONTAINMENT_REPLY,
        specialistId: specialist.id,
        execution: "none",
        ...(Object.hasOwn(body, "gmailSenderDisambiguationReference")
          ? { gmailSenderDisambiguationReference: null }
          : {}),
      });
    }
    if (specialist.id === "jarvis"
      && currentUserUtterance !== undefined
      && isUnsupportedGmailReadAuthorityContinuation(body.messages, currentUserUtterance)) {
      return NextResponse.json({
        reply: GMAIL_NO_PENDING_READ_AUTHORITY_REPLY,
        specialistId: specialist.id,
        execution: "none",
      });
    }
    try {
      const systemPrompt = `${await buildSpecialistPrompt()}\n\n${PUBLIC_WEB_GUIDANCE}\n\n${buildPublicTemporalGuidance(calendarActDependencies.clock())}`;
      // Authority above is resolved from the untouched current utterance first.
      // Only the later, ordinary model call receives the private-release boundary.
      const governedDriveHistoryExcluded = hasGovernedDriveHistory(body.messages);
      const modelMessages = anchorPublicInformationModelTurn(
        sanitizeModelHistory(body.messages),
        calendarActDependencies.clock(),
      );
      const result = await callModel(systemPrompt, modelMessages, PUBLIC_WEB_TOOLS);
      if (currentUserUtterance !== undefined
        && isFreshnessSensitivePublicInformation(currentUserUtterance)
        && !hasPublicWebSearchEvidence(result)) {
        return NextResponse.json({
          reply: PUBLIC_WEB_FAILURE_REPLY,
          specialistId: specialist.id,
          execution: "none",
        });
      }
      let reply = typeof result === "string" ? result : result.text;

      const calendarRecall = calendarRecallDiagnostics(body.messages);
      reply = guardOrdinaryModelReply(reply, currentUserUtterance, governedDriveHistoryExcluded, {
        hasCurrentCalendarGovernedContext: calendarRecall.hasCurrentCalendarGovernedContext,
        isCalendarRecollection: calendarRecall.isCalendarRecollection,
        priorVisibleReportIsScheduleOnly: calendarRecall.priorVisibleReportIsScheduleOnly,
        priorNegativeCalendarFactualResult: calendarRecall.priorNegativeCalendarFactualResult,
        previousAssistantWasCalendarContainment: calendarRecall.previousAssistantWasCalendarContainment,
        isDetailFollowUp: calendarRecall.isDetailFollowUp,
        boundUserDetails: calendarRecall.boundUserDetails,
        unknownCommitmentClocks: calendarRecall.unknownCommitmentClocks,
      });
      return NextResponse.json({ reply, specialistId: specialist.id, execution: "none" });
    } catch (error) {
      console.error("[/api/lighter/chat] Specialist invocation failed:", error);
      return NextResponse.json({
        reply: PUBLIC_WEB_FAILURE_REPLY,
        specialistId: specialist.id,
        execution: "none",
      });
    }
  };
}
