export const USER_CONTINUITY_CAPTURE_PURPOSE = "conversation" as const;

export const USER_CONTINUITY_CAPTURE_CLASSES = [
  "user_assertion",
  "preference",
  "plan",
  "commitment",
  "decision",
] as const;

export type UserContinuityCaptureClass =
  (typeof USER_CONTINUITY_CAPTURE_CLASSES)[number];

export type ExplicitUserContinuityCaptureRequest = Readonly<{
  intent: "explicit_user_continuity_capture";
  statement: string;
}>;

export type ExplicitUserContinuityCaptureRequestResult =
  | Readonly<{
      status: "matched";
      request: ExplicitUserContinuityCaptureRequest;
    }>
  | Readonly<{
      status: "unsupported";
    }>;

export type UserContinuityCaptureClassification =
  | Readonly<{
      responseType: "user_continuity_capture_classification";
      status: "classified";
      semanticClass: UserContinuityCaptureClass;
    }>
  | Readonly<{
      responseType: "user_continuity_capture_classification";
      status: "ambiguous";
      semanticClass: null;
    }>;

export type UserContinuityCaptureClassificationValidationResult =
  | Readonly<{
      status: "valid";
      classification: UserContinuityCaptureClassification;
    }>
  | Readonly<{
      status: "invalid";
    }>;

export type UserContinuityCaptureCandidate = Readonly<{
  captureIntent: "explicit_user_instruction";
  semanticClass: UserContinuityCaptureClass;
  value: Readonly<{
    statement: string;
  }>;
  authorship: Readonly<{
    source: "user";
    statedAt: string;
  }>;
  visibilityPurposes: readonly [typeof USER_CONTINUITY_CAPTURE_PURPOSE];
  revisionSemantics: "append_only";
}>;

export type UserContinuityCaptureCandidateResult =
  | Readonly<{
      status: "ready";
      candidate: UserContinuityCaptureCandidate;
    }>
  | Readonly<{
      status: "clarification_required";
      statement: string;
    }>
  | Readonly<{
      status: "rejected";
      reason: "invalid_timestamp" | "classification_invalid";
    }>;

const CAPTURE_PATTERNS = [
  /^\s*remember\s+that\s+(.+?)\s*$/i,
  /^\s*please\s+remember\s+that\s+(.+?)\s*$/i,
  /^\s*remember\s+this\s*:\s*(.+?)\s*$/i,
  /^\s*please\s+remember\s+this\s*:\s*(.+?)\s*$/i,
  /^\s*retain\s+that\s+(.+?)\s*$/i,
  /^\s*please\s+retain\s+that\s+(.+?)\s*$/i,
  /^\s*retain\s+this\s*:\s*(.+?)\s*$/i,
  /^\s*please\s+retain\s+this\s*:\s*(.+?)\s*$/i,
] as const;

const USER_CONTINUITY_CAPTURE_CLASS_SET =
  new Set<string>(USER_CONTINUITY_CAPTURE_CLASSES);

function validInstant(value: string): boolean {
  return Number.isFinite(Date.parse(value));
}

function matchedStatement(utterance: string): string | null {
  for (const pattern of CAPTURE_PATTERNS) {
    const match = utterance.match(pattern);
    if (!match) continue;
    const statement = match[1];
    if (!statement || statement.trim().length === 0) return null;
    return statement;
  }
  return null;
}

export function parseExplicitUserContinuityCaptureRequest(
  utterance: string,
): ExplicitUserContinuityCaptureRequestResult {
  const statement = matchedStatement(utterance);
  if (statement === null) {
    return Object.freeze({ status: "unsupported" });
  }

  return Object.freeze({
    status: "matched",
    request: Object.freeze({
      intent: "explicit_user_continuity_capture",
      statement,
    }),
  });
}

export function validateUserContinuityCaptureClassification(
  raw: unknown,
): UserContinuityCaptureClassificationValidationResult {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return Object.freeze({ status: "invalid" });
  }

  const record = raw as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  if (
    keys.length !== 3
    || keys[0] !== "responseType"
    || keys[1] !== "semanticClass"
    || keys[2] !== "status"
    || record.responseType !== "user_continuity_capture_classification"
  ) {
    return Object.freeze({ status: "invalid" });
  }

  if (record.status === "ambiguous") {
    if (record.semanticClass !== null) {
      return Object.freeze({ status: "invalid" });
    }
    return Object.freeze({
      status: "valid",
      classification: Object.freeze({
        responseType: "user_continuity_capture_classification",
        status: "ambiguous",
        semanticClass: null,
      }),
    });
  }

  if (
    record.status !== "classified"
    || typeof record.semanticClass !== "string"
    || !USER_CONTINUITY_CAPTURE_CLASS_SET.has(record.semanticClass)
  ) {
    return Object.freeze({ status: "invalid" });
  }

  return Object.freeze({
    status: "valid",
    classification: Object.freeze({
      responseType: "user_continuity_capture_classification",
      status: "classified",
      semanticClass: record.semanticClass as UserContinuityCaptureClass,
    }),
  });
}

export function buildUserContinuityCaptureCandidate(
  request: ExplicitUserContinuityCaptureRequest,
  classificationResult: UserContinuityCaptureClassificationValidationResult,
  statedAt: string,
): UserContinuityCaptureCandidateResult {
  if (!validInstant(statedAt)) {
    return Object.freeze({
      status: "rejected",
      reason: "invalid_timestamp",
    });
  }

  if (classificationResult.status !== "valid") {
    return Object.freeze({
      status: "rejected",
      reason: "classification_invalid",
    });
  }

  if (classificationResult.classification.status === "ambiguous") {
    return Object.freeze({
      status: "clarification_required",
      statement: request.statement,
    });
  }

  return Object.freeze({
    status: "ready",
    candidate: Object.freeze({
      captureIntent: "explicit_user_instruction",
      semanticClass: classificationResult.classification.semanticClass,
      value: Object.freeze({
        statement: request.statement,
      }),
      authorship: Object.freeze({
        source: "user",
        statedAt,
      }),
      visibilityPurposes: Object.freeze([
        USER_CONTINUITY_CAPTURE_PURPOSE,
      ]) as readonly [typeof USER_CONTINUITY_CAPTURE_PURPOSE],
      revisionSemantics: "append_only",
    }),
  });
}
