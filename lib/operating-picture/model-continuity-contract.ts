import type { OperatingPictureJsonValue } from "./persistence-record";
import type { DurablePurposeProjectionResult } from "./purpose-projection-retrieval";

export const MODEL_CONTINUITY_PURPOSE = "conversation" as const;

export type ModelContinuityId = `continuity:${number}`;

export type ModelContinuityContextItem = Readonly<{
  continuityId: ModelContinuityId;
  semanticClass:
    | "user_assertion"
    | "preference"
    | "plan"
    | "commitment"
    | "decision"
    | "inference"
    | "recommendation"
    | "open_question";
  recoveryDisposition:
    | "recoverable_user_continuity"
    | "recoverable_model_continuity";
  value: OperatingPictureJsonValue;
}>;

export type ModelContinuityContext = Readonly<{
  purpose: typeof MODEL_CONTINUITY_PURPOSE;
  items: readonly ModelContinuityContextItem[];
}>;

export type ModelContinuityBinding = Readonly<{
  continuityId: ModelContinuityId;
  recordId: string;
  versionId: string;
}>;

export type ModelContinuityContextBuildResult =
  | Readonly<{
      status: "ready";
      context: ModelContinuityContext;
      bindings: readonly ModelContinuityBinding[];
    }>
  | Readonly<{
      status: "empty";
      purpose: typeof MODEL_CONTINUITY_PURPOSE;
    }>
  | Readonly<{
      status: "rejected";
      reason:
        | "projection_not_available"
        | "wrong_purpose"
        | "projection_integrity_failure"
        | "context_scope_exceeded";
    }>;

export type ModelContinuityAssessment = Readonly<{
  responseType: "continuity_relevance";
  relevance: "relevant" | "not_relevant";
  relevantItemIds: readonly ModelContinuityId[];
}>;

export type ModelContinuityAssessmentValidationResult =
  | Readonly<{
      status: "valid";
      assessment: ModelContinuityAssessment;
    }>
  | Readonly<{
      status: "invalid";
    }>;

const MAX_MODEL_CONTINUITY_ITEMS = 12;
const MAX_MODEL_CONTINUITY_CONTEXT_BYTES = 16_384;

const USER_CONTINUITY_CLASSES = new Set([
  "user_assertion",
  "preference",
  "plan",
  "commitment",
  "decision",
]);

const MODEL_CONTINUITY_CLASSES = new Set([
  "inference",
  "recommendation",
  "open_question",
]);

function isValidProjectionItem(
  item: Extract<DurablePurposeProjectionResult, { status: "projected" }>["items"][number],
): boolean {
  if (
    item.purpose !== MODEL_CONTINUITY_PURPOSE
    || item.lifecycle !== "current"
    || !item.visibilityPurposes.includes(MODEL_CONTINUITY_PURPOSE)
  ) {
    return false;
  }

  if (item.recoveryDisposition === "recoverable_user_continuity") {
    return item.authorshipSource === "user"
      && USER_CONTINUITY_CLASSES.has(item.semanticClass);
  }

  if (item.recoveryDisposition === "recoverable_model_continuity") {
    return item.authorshipSource === "model"
      && MODEL_CONTINUITY_CLASSES.has(item.semanticClass);
  }

  return false;
}

function serializedBytes(value: unknown): number {
  return Buffer.byteLength(JSON.stringify(value), "utf8");
}

export function buildModelContinuityContext(
  projection: DurablePurposeProjectionResult,
): ModelContinuityContextBuildResult {
  if (projection.status === "rejected") {
    return Object.freeze({
      status: "rejected",
      reason: "projection_not_available",
    });
  }

  if (projection.purpose !== MODEL_CONTINUITY_PURPOSE) {
    return Object.freeze({
      status: "rejected",
      reason: "wrong_purpose",
    });
  }

  if (projection.status === "empty") {
    return Object.freeze({
      status: "empty",
      purpose: MODEL_CONTINUITY_PURPOSE,
    });
  }

  if (projection.items.length > MAX_MODEL_CONTINUITY_ITEMS) {
    return Object.freeze({
      status: "rejected",
      reason: "context_scope_exceeded",
    });
  }

  const contextItems: ModelContinuityContextItem[] = [];
  const bindings: ModelContinuityBinding[] = [];

  for (const [index, item] of projection.items.entries()) {
    if (!isValidProjectionItem(item)) {
      return Object.freeze({
        status: "rejected",
        reason: "projection_integrity_failure",
      });
    }

    const continuityId = `continuity:${index + 1}` as ModelContinuityId;

    contextItems.push(Object.freeze({
      continuityId,
      semanticClass: item.semanticClass as ModelContinuityContextItem["semanticClass"],
      recoveryDisposition: item.recoveryDisposition,
      value: item.payload,
    }));

    bindings.push(Object.freeze({
      continuityId,
      recordId: item.recordId,
      versionId: item.versionId,
    }));
  }

  const context = Object.freeze({
    purpose: MODEL_CONTINUITY_PURPOSE,
    items: Object.freeze(contextItems),
  });

  if (serializedBytes(context) > MAX_MODEL_CONTINUITY_CONTEXT_BYTES) {
    return Object.freeze({
      status: "rejected",
      reason: "context_scope_exceeded",
    });
  }

  return Object.freeze({
    status: "ready",
    context,
    bindings: Object.freeze(bindings),
  });
}

function parseStrictJson(text: string): unknown {
  const trimmed = text.trim();
  if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) return null;

  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
}

function isModelContinuityId(value: unknown): value is ModelContinuityId {
  return typeof value === "string" && /^continuity:[1-9][0-9]*$/.test(value);
}

export function validateModelContinuityAssessment(
  raw: unknown,
  allowedContinuityIds: readonly ModelContinuityId[],
): ModelContinuityAssessmentValidationResult {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return Object.freeze({ status: "invalid" });
  }

  const record = raw as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  if (
    keys.length !== 3
    || keys[0] !== "relevance"
    || keys[1] !== "relevantItemIds"
    || keys[2] !== "responseType"
  ) {
    return Object.freeze({ status: "invalid" });
  }

  if (
    record.responseType !== "continuity_relevance"
    || (record.relevance !== "relevant" && record.relevance !== "not_relevant")
    || !Array.isArray(record.relevantItemIds)
  ) {
    return Object.freeze({ status: "invalid" });
  }

  const allowed = new Set(allowedContinuityIds);
  const seen = new Set<string>();
  const relevantItemIds: ModelContinuityId[] = [];

  for (const candidate of record.relevantItemIds) {
    if (
      !isModelContinuityId(candidate)
      || !allowed.has(candidate)
      || seen.has(candidate)
    ) {
      return Object.freeze({ status: "invalid" });
    }
    seen.add(candidate);
    relevantItemIds.push(candidate);
  }

  if (
    (record.relevance === "relevant" && relevantItemIds.length === 0)
    || (record.relevance === "not_relevant" && relevantItemIds.length !== 0)
  ) {
    return Object.freeze({ status: "invalid" });
  }

  return Object.freeze({
    status: "valid",
    assessment: Object.freeze({
      responseType: "continuity_relevance",
      relevance: record.relevance,
      relevantItemIds: Object.freeze(relevantItemIds),
    }),
  });
}

export function parseAndValidateModelContinuityAssessment(
  text: string,
  allowedContinuityIds: readonly ModelContinuityId[],
): ModelContinuityAssessmentValidationResult {
  return validateModelContinuityAssessment(
    parseStrictJson(text),
    allowedContinuityIds,
  );
}
