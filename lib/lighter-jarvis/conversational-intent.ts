export const CONVERSATIONAL_INTENT_CAPABILITIES = Object.freeze([
  "calendar",
  "gmail",
  "drive",
  "public_information",
] as const);

export type ConversationalIntentCapability =
  typeof CONVERSATIONAL_INTENT_CAPABILITIES[number];

export const CONVERSATIONAL_INTENT_OPERATIONS = Object.freeze([
  "read",
  "search",
  "lookup",
] as const);

export type ConversationalIntentOperation =
  typeof CONVERSATIONAL_INTENT_OPERATIONS[number];

export const CONVERSATIONAL_INTENT_TEMPORAL_CONSTRAINTS = Object.freeze([
  "today",
  "tomorrow",
  "this_week",
  "next_week",
  "next_seven_days",
] as const);

export type ConversationalIntentTemporalConstraint =
  typeof CONVERSATIONAL_INTENT_TEMPORAL_CONSTRAINTS[number];

export const CONVERSATIONAL_INTENT_OUTPUTS = Object.freeze([
  "fact",
  "list",
  "summary",
] as const);

export type ConversationalIntentOutput =
  typeof CONVERSATIONAL_INTENT_OUTPUTS[number];

export const CONVERSATIONAL_INTENT_UNSUPPORTED_REASONS = Object.freeze([
  "unresolved_intent",
  "private_semantic_resolution_required",
  "unsupported_operation",
] as const);

export type ConversationalIntentUnsupportedReason =
  typeof CONVERSATIONAL_INTENT_UNSUPPORTED_REASONS[number];

export type CapabilityRequestIntent = Readonly<{
  kind: "capability_request";
  capability: ConversationalIntentCapability;
  operation: ConversationalIntentOperation;
  subjectTerms?: readonly string[];
  temporalConstraint?: ConversationalIntentTemporalConstraint;
  requestedOutput?: ConversationalIntentOutput;
}>;

export type OrdinaryConversationIntent = Readonly<{
  kind: "ordinary_conversation";
}>;

export type UnsupportedConversationalIntent = Readonly<{
  kind: "unsupported";
  reasonClass?: ConversationalIntentUnsupportedReason;
}>;

export type ConversationalIntentCandidate =
  | CapabilityRequestIntent
  | OrdinaryConversationIntent
  | UnsupportedConversationalIntent;

const CAPABILITY_OPERATION_PAIRS = Object.freeze(new Set([
  "calendar:read",
  "gmail:search",
  "gmail:read",
  "drive:search",
  "drive:read",
  "public_information:lookup",
] as const));

const TOKEN = /^[a-z0-9][a-z0-9_-]*$/i;

function isExactObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function onlyKeys(record: Record<string, unknown>, allowed: readonly string[]): boolean {
  return Object.keys(record).every(key => allowed.includes(key));
}

function isOneOf<const T extends readonly string[]>(value: unknown, allowed: T): value is T[number] {
  return typeof value === "string" && allowed.includes(value as T[number]);
}

function validateSubjectTerms(value: unknown): readonly string[] | undefined | null {
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.length === 0 || value.length > 8) return null;

  const terms: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") return null;
    const token = item.normalize("NFKC").trim();
    if (!TOKEN.test(token)) return null;
    const normalized = token.toLowerCase();
    if (!terms.includes(normalized)) terms.push(normalized);
  }
  return terms.length > 0 ? Object.freeze(terms) : null;
}

/**
 * Validates an untrusted conversational-intent proposal against the closed
 * Sprint 3.180a schema. Validation creates no authority, capability proposal,
 * acquisition instruction, provider identifier, or factual result.
 */
export function validateConversationalIntentCandidate(raw: unknown): ConversationalIntentCandidate | null {
  if (!isExactObject(raw) || typeof raw.kind !== "string") return null;

  if (raw.kind === "ordinary_conversation") {
    if (!onlyKeys(raw, ["kind"])) return null;
    return Object.freeze({ kind: "ordinary_conversation" });
  }

  if (raw.kind === "unsupported") {
    if (!onlyKeys(raw, ["kind", "reasonClass"])) return null;
    if (raw.reasonClass !== undefined
      && !isOneOf(raw.reasonClass, CONVERSATIONAL_INTENT_UNSUPPORTED_REASONS)) return null;
    return Object.freeze({
      kind: "unsupported",
      ...(raw.reasonClass === undefined ? {} : { reasonClass: raw.reasonClass }),
    });
  }

  if (raw.kind !== "capability_request") return null;
  if (!onlyKeys(raw, [
    "kind",
    "capability",
    "operation",
    "subjectTerms",
    "temporalConstraint",
    "requestedOutput",
  ])) return null;

  if (!isOneOf(raw.capability, CONVERSATIONAL_INTENT_CAPABILITIES)
    || !isOneOf(raw.operation, CONVERSATIONAL_INTENT_OPERATIONS)) return null;

  if (!CAPABILITY_OPERATION_PAIRS.has(`${raw.capability}:${raw.operation}` as never)) return null;

  const subjectTerms = validateSubjectTerms(raw.subjectTerms);
  if (subjectTerms === null) return null;

  if (raw.temporalConstraint !== undefined
    && !isOneOf(raw.temporalConstraint, CONVERSATIONAL_INTENT_TEMPORAL_CONSTRAINTS)) return null;

  if (raw.requestedOutput !== undefined
    && !isOneOf(raw.requestedOutput, CONVERSATIONAL_INTENT_OUTPUTS)) return null;

  return Object.freeze({
    kind: "capability_request",
    capability: raw.capability,
    operation: raw.operation,
    ...(subjectTerms === undefined ? {} : { subjectTerms }),
    ...(raw.temporalConstraint === undefined ? {} : { temporalConstraint: raw.temporalConstraint }),
    ...(raw.requestedOutput === undefined ? {} : { requestedOutput: raw.requestedOutput }),
  });
}
