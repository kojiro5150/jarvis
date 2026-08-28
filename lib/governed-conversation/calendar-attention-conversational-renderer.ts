import {
  CALENDAR_ATTENTION_BRIEF_KIND,
  CALENDAR_ATTENTION_BRIEF_SEMANTICS,
  type CalendarAttentionBrief,
  type CalendarAttentionBriefItem,
} from "./calendar-attention-brief-publisher";

const START_TIME_POLICY_ID = "attention.commitment.start-time-changed";
const REMOVAL_POLICY_ID = "attention.commitment.removed";
const SUPPORTED_POLICY_VERSION = "1.0.0";
const START_TIME_REASON_CODE = "commitment.start-time.changed";
const REMOVAL_REASON_CODE = "commitment.absent-from-current-snapshot";

const requiredText = (value: unknown, path: string): string => {
  if (typeof value !== "string" || value.trim() === "") throw new Error(`${path} must be a non-empty string`);
  return value;
};

const evidenceValue = (item: CalendarAttentionBriefItem, field: string): string => {
  const matches = item.reason.evidence.filter(entry => entry.field === field);
  if (matches.length !== 1) throw new Error(`Calendar attention brief item requires exactly one ${field} evidence value`);
  return requiredText(matches[0].value, `evidence.${field}`);
};

const validateIdentity = (item: CalendarAttentionBriefItem): void => {
  const entityId = evidenceValue(item, "commitment.id");
  if (entityId !== item.entityId) throw new Error("Calendar attention brief commitment identity mismatch");
};

const renderStartTimeItem = (item: CalendarAttentionBriefItem): string => {
  if (item.changeType !== "modified") throw new Error("unsupported Calendar attention brief change type");
  if (item.policy.id !== START_TIME_POLICY_ID || item.policy.version !== SUPPORTED_POLICY_VERSION) {
    throw new Error("unsupported Calendar attention brief policy");
  }
  if (item.reason.code !== START_TIME_REASON_CODE) throw new Error("unsupported Calendar attention brief reason");

  validateIdentity(item);

  const previousStartsAt = evidenceValue(item, "previous.startsAt");
  const currentStartsAt = evidenceValue(item, "current.startsAt");

  if (!Number.isFinite(Date.parse(previousStartsAt)) || !Number.isFinite(Date.parse(currentStartsAt))) {
    throw new Error("Calendar attention brief start timestamps must be valid");
  }
  if (previousStartsAt === currentStartsAt) throw new Error("Calendar attention brief start-time change must contain different timestamps");

  return `A Calendar commitment changed start time from ${previousStartsAt} to ${currentStartsAt}.`;
};

const renderRemovalItem = (item: CalendarAttentionBriefItem): string => {
  if (item.changeType !== "removed") throw new Error("unsupported Calendar attention brief change type");
  if (item.policy.id !== REMOVAL_POLICY_ID || item.policy.version !== SUPPORTED_POLICY_VERSION) {
    throw new Error("unsupported Calendar attention brief policy");
  }
  if (item.reason.code !== REMOVAL_REASON_CODE) throw new Error("unsupported Calendar attention brief reason");

  validateIdentity(item);

  const previousStartsAt = evidenceValue(item, "previous.startsAt");
  if (!Number.isFinite(Date.parse(previousStartsAt))) {
    throw new Error("Calendar attention brief previous start timestamp must be valid");
  }

  return `A Calendar commitment previously scheduled for ${previousStartsAt} is no longer present in this bounded Calendar window.`;
};

const renderItem = (item: CalendarAttentionBriefItem): string => {
  if (item.policy.version !== SUPPORTED_POLICY_VERSION) {
    throw new Error("unsupported Calendar attention brief policy");
  }
  if (item.policy.id === START_TIME_POLICY_ID) return renderStartTimeItem(item);
  if (item.policy.id === REMOVAL_POLICY_ID) return renderRemovalItem(item);
  throw new Error("unsupported Calendar attention brief policy");
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
    return "No supported Calendar attention changes matched this bounded check.";
  }

  const rendered = brief.items.map(renderItem);

  if (rendered.length === 1) return rendered[0];

  return [
    `${rendered.length} Calendar attention changes matched this bounded check:`,
    ...rendered.map(line => `- ${line.replace(/^A Calendar commitment /, "")}`),
  ].join("\n");
}
