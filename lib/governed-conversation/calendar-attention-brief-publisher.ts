import type { CalendarAttentionPolicyMatch } from "./calendar-attention-policy-adapter";

export const CALENDAR_ATTENTION_BRIEF_KIND = "calendar_attention_brief" as const;
export const CALENDAR_ATTENTION_BRIEF_SEMANTICS = "deterministic_policy_match_not_priority" as const;

export interface CalendarAttentionBriefItem {
  readonly matchId: string;
  readonly entityId: string;
  readonly changeType: "modified";
  readonly policy: Readonly<{ readonly id: string; readonly version: string }>;
  readonly reason: Readonly<{
    readonly code: string;
    readonly message: string;
    readonly evidence: readonly Readonly<{ readonly field: string; readonly value: string | number | boolean | null }>[];
  }>;
}

export interface CalendarAttentionBrief {
  readonly kind: typeof CALENDAR_ATTENTION_BRIEF_KIND;
  readonly semantics: typeof CALENDAR_ATTENTION_BRIEF_SEMANTICS;
  readonly previousObservedAt: string;
  readonly currentObservedAt: string;
  readonly items: readonly CalendarAttentionBriefItem[];
}

export interface CalendarAttentionBriefPublicationInput {
  readonly previousObservedAt: string;
  readonly currentObservedAt: string;
  readonly matches: readonly CalendarAttentionPolicyMatch[];
}

const timestamp = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0 && Number.isFinite(Date.parse(value));

const cloneItem = (match: CalendarAttentionPolicyMatch): CalendarAttentionBriefItem => Object.freeze({
  matchId: match.matchId,
  entityId: match.entityId,
  changeType: match.changeType,
  policy: Object.freeze({
    id: match.policy.id,
    version: match.policy.version,
  }),
  reason: Object.freeze({
    code: match.reason.code,
    message: match.reason.message,
    evidence: Object.freeze(match.reason.evidence.map(item => Object.freeze({
      field: item.field,
      value: item.value,
    }))),
  }),
});

/**
 * Publishes deterministic Calendar attention-policy matches into a bounded
 * conversational artefact.
 *
 * The publication preserves policy-match facts only. It adds no priority,
 * urgency, severity, cause, recommendation, action, ranking or prose.
 */
export function publishCalendarAttentionBrief(
  input: CalendarAttentionBriefPublicationInput,
): CalendarAttentionBrief {
  if (!input || typeof input !== "object") throw new Error("Calendar attention brief input is required");
  if (!timestamp(input.previousObservedAt) || !timestamp(input.currentObservedAt)) {
    throw new Error("Calendar attention brief observation timestamps must be valid");
  }
  if (Date.parse(input.currentObservedAt) < Date.parse(input.previousObservedAt)) {
    throw new Error("Calendar attention brief current observation must not precede previous observation");
  }
  if (!Array.isArray(input.matches)) throw new Error("Calendar attention brief matches must be an array");

  const seen = new Set<string>();
  const items = input.matches.map((match, index) => {
    if (!match || typeof match !== "object") throw new Error(`matches[${index}] must be an object`);
    if (match.previousObservedAt !== input.previousObservedAt || match.currentObservedAt !== input.currentObservedAt) {
      throw new Error(`matches[${index}] observation window does not match publication input`);
    }
    if (typeof match.matchId !== "string" || match.matchId.trim() === "") {
      throw new Error(`matches[${index}].matchId must be a non-empty string`);
    }
    if (seen.has(match.matchId)) throw new Error(`duplicate Calendar attention match id: ${match.matchId}`);
    seen.add(match.matchId);
    return cloneItem(match);
  });

  items.sort((left, right) => left.matchId < right.matchId ? -1 : left.matchId > right.matchId ? 1 : 0);

  return Object.freeze({
    kind: CALENDAR_ATTENTION_BRIEF_KIND,
    semantics: CALENDAR_ATTENTION_BRIEF_SEMANTICS,
    previousObservedAt: input.previousObservedAt,
    currentObservedAt: input.currentObservedAt,
    items: Object.freeze(items),
  });
}
