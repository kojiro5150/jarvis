import {
  CALENDAR_ATTENTION_BRIEF_KIND,
  CALENDAR_ATTENTION_BRIEF_SEMANTICS,
  type CalendarAttentionBrief,
  type CalendarAttentionBriefItem,
} from "./calendar-attention-brief-publisher";

const SUPPORTED_POLICY_ID = "attention.commitment.start-time-changed";
const SUPPORTED_POLICY_VERSION = "1.0.0";
const SUPPORTED_REASON_CODE = "commitment.start-time.changed";

const requiredText = (value: unknown, path: string): string => {
  if (typeof value !== "string" || value.trim() === "") throw new Error(`${path} must be a non-empty string`);
  return value;
};

const evidenceValue = (item: CalendarAttentionBriefItem, field: string): string => {
  const matches = item.reason.evidence.filter(entry => entry.field === field);
  if (matches.length !== 1) throw new Error(`Calendar attention brief item requires exactly one ${field} evidence value`);
  return requiredText(matches[0].value, `evidence.${field}`);
};

const renderStartTimeItem = (item: CalendarAttentionBriefItem): string => {
  if (item.changeType !== "modified") throw new Error("unsupported Calendar attention brief change type");
  if (item.policy.id !== SUPPORTED_POLICY_ID || item.policy.version !== SUPPORTED_POLICY_VERSION) {
    throw new Error("unsupported Calendar attention brief policy");
  }
  if (item.reason.code !== SUPPORTED_REASON_CODE) throw new Error("unsupported Calendar attention brief reason");

  const entityId = evidenceValue(item, "commitment.id");
  if (entityId !== item.entityId) throw new Error("Calendar attention brief commitment identity mismatch");

  const previousStartsAt = evidenceValue(item, "previous.startsAt");
  const currentStartsAt = evidenceValue(item, "current.startsAt");

  if (!Number.isFinite(Date.parse(previousStartsAt)) || !Number.isFinite(Date.parse(currentStartsAt))) {
    throw new Error("Calendar attention brief start timestamps must be valid");
  }
  if (previousStartsAt === currentStartsAt) throw new Error("Calendar attention brief start-time change must contain different timestamps");

  return `A Calendar commitment changed start time from ${previousStartsAt} to ${currentStartsAt}.`;
};

/**
 * Deterministically renders a bounded Calendar attention brief.
 *
 * This renderer uses fixed templates only. It does not invoke a model, rank
 * items, infer priority/urgency/cause, recommend action, or disclose titles.
 */
export function renderCalendarAttentionBrief(brief: CalendarAttentionBrief): string {
  if (!brief || typeof brief !== "object") throw new Error("Calendar attention brief is required");
  if (brief.kind !== CALENDAR_ATTENTION_BRIEF_KIND) throw new Error("unsupported Calendar attention brief kind");
  if (brief.semantics !== CALENDAR_ATTENTION_BRIEF_SEMANTICS) throw new Error("unsupported Calendar attention brief semantics");
  if (!Array.isArray(brief.items)) throw new Error("Calendar attention brief items must be an array");

  if (brief.items.length === 0) {
    return "No Calendar start-time changes matched this bounded check.";
  }

  const rendered = brief.items.map(renderStartTimeItem);

  if (rendered.length === 1) return rendered[0];

  return [
    `${rendered.length} Calendar commitments changed start time:`,
    ...rendered.map(line => `- ${line.replace(/^A Calendar commitment /, "")}`),
  ].join("\n");
}
