import { describe, expect, it } from "vitest";

import {
  buildUserContinuityCaptureCandidate,
  parseExplicitUserContinuityCaptureRequest,
  USER_CONTINUITY_CAPTURE_CLASSES,
  validateUserContinuityCaptureClassification,
  type UserContinuityCaptureClass,
} from "./user-continuity-capture-contract";

type FactMustNotBeCapturable =
  "fact" extends UserContinuityCaptureClass ? never : true;
const FACT_IS_NOT_CAPTURABLE: FactMustNotBeCapturable = true;

describe("explicit user-authored continuity capture contract", () => {
  it.each([
    ["Remember that I prefer short status updates.", "I prefer short status updates."],
    ["Please remember that we decided to freeze the design.", "we decided to freeze the design."],
    ["Remember this: I'm planning to finish the paper on Friday.", "I'm planning to finish the paper on Friday."],
    ["Please remember this: Keep the exact punctuation — including this.", "Keep the exact punctuation — including this."],
    ["Retain that I prefer concise summaries.", "I prefer concise summaries."],
    ["Please retain this: We decided not to widen the scope.", "We decided not to widen the scope."],
  ])("matches the bounded explicit command %s and preserves its user-supplied statement", (utterance, statement) => {
    expect(parseExplicitUserContinuityCaptureRequest(utterance)).toEqual({
      status: "matched",
      request: {
        intent: "explicit_user_continuity_capture",
        statement,
      },
    });
  });

  it.each([
    "I remember that I prefer short status updates.",
    "Do you remember that I prefer short status updates?",
    "What do you remember about status updates?",
    "Don't forget that I prefer short updates.",
    "Keep in mind that I prefer short updates.",
    "I prefer short status updates.",
    "Remember this",
    "Please remember",
    "Retain this",
  ])("does not widen capture intent to ordinary or unsupported language: %s", (utterance) => {
    expect(parseExplicitUserContinuityCaptureRequest(utterance)).toEqual({
      status: "unsupported",
    });
  });

  it("keeps the first capture semantic vocabulary closed and excludes fact", () => {
    expect(USER_CONTINUITY_CAPTURE_CLASSES).toEqual([
      "user_assertion",
      "preference",
      "plan",
      "commitment",
      "decision",
    ]);
    expect(USER_CONTINUITY_CAPTURE_CLASSES).not.toContain("fact");
    expect(FACT_IS_NOT_CAPTURABLE).toBe(true);
  });

  it.each([
    "user_assertion",
    "preference",
    "plan",
    "commitment",
    "decision",
  ] as const)("accepts exactly one admissible classified semantic class: %s", (semanticClass) => {
    expect(validateUserContinuityCaptureClassification({
      responseType: "user_continuity_capture_classification",
      status: "classified",
      semanticClass,
    })).toEqual({
      status: "valid",
      classification: {
        responseType: "user_continuity_capture_classification",
        status: "classified",
        semanticClass,
      },
    });
  });

  it("represents genuine ambiguity explicitly instead of choosing a nearest class", () => {
    expect(validateUserContinuityCaptureClassification({
      responseType: "user_continuity_capture_classification",
      status: "ambiguous",
      semanticClass: null,
    })).toEqual({
      status: "valid",
      classification: {
        responseType: "user_continuity_capture_classification",
        status: "ambiguous",
        semanticClass: null,
      },
    });
  });

  it.each([
    ["fact", {
      responseType: "user_continuity_capture_classification",
      status: "classified",
      semanticClass: "fact",
    }],
    ["model-only class", {
      responseType: "user_continuity_capture_classification",
      status: "classified",
      semanticClass: "inference",
    }],
    ["ambiguous with a guessed class", {
      responseType: "user_continuity_capture_classification",
      status: "ambiguous",
      semanticClass: "plan",
    }],
    ["classified without a class", {
      responseType: "user_continuity_capture_classification",
      status: "classified",
      semanticClass: null,
    }],
    ["extra field", {
      responseType: "user_continuity_capture_classification",
      status: "classified",
      semanticClass: "preference",
      rationale: "sounds like a preference",
    }],
    ["unknown status", {
      responseType: "user_continuity_capture_classification",
      status: "probably",
      semanticClass: "preference",
    }],
  ])("rejects %s without repair or coercion", (_label, raw) => {
    expect(validateUserContinuityCaptureClassification(raw)).toEqual({
      status: "invalid",
    });
  });

  it("builds a low-trust append-only user-authored candidate without rewriting the statement", () => {
    const request = parseExplicitUserContinuityCaptureRequest(
      "Remember that I prefer short status updates.",
    );
    expect(request.status).toBe("matched");
    if (request.status !== "matched") throw new Error("expected matched capture");

    const classification = validateUserContinuityCaptureClassification({
      responseType: "user_continuity_capture_classification",
      status: "classified",
      semanticClass: "preference",
    });

    expect(buildUserContinuityCaptureCandidate(
      request.request,
      classification,
      "2026-09-01T04:15:00.000Z",
    )).toEqual({
      status: "ready",
      candidate: {
        captureIntent: "explicit_user_instruction",
        semanticClass: "preference",
        value: {
          statement: "I prefer short status updates.",
        },
        authorship: {
          source: "user",
          statedAt: "2026-09-01T04:15:00.000Z",
        },
        visibilityPurposes: ["conversation"],
        revisionSemantics: "append_only",
      },
    });
  });

  it("requires clarification before any candidate exists when classification is ambiguous", () => {
    const request = parseExplicitUserContinuityCaptureRequest(
      "Remember that we should probably do X.",
    );
    expect(request.status).toBe("matched");
    if (request.status !== "matched") throw new Error("expected matched capture");

    const classification = validateUserContinuityCaptureClassification({
      responseType: "user_continuity_capture_classification",
      status: "ambiguous",
      semanticClass: null,
    });

    expect(buildUserContinuityCaptureCandidate(
      request.request,
      classification,
      "2026-09-01T04:15:00.000Z",
    )).toEqual({
      status: "clarification_required",
      statement: "we should probably do X.",
    });
  });

  it("rejects invalid classification and invalid time before a candidate is created", () => {
    const request = parseExplicitUserContinuityCaptureRequest(
      "Remember that I prefer short status updates.",
    );
    expect(request.status).toBe("matched");
    if (request.status !== "matched") throw new Error("expected matched capture");

    expect(buildUserContinuityCaptureCandidate(
      request.request,
      { status: "invalid" },
      "2026-09-01T04:15:00.000Z",
    )).toEqual({
      status: "rejected",
      reason: "classification_invalid",
    });

    const classification = validateUserContinuityCaptureClassification({
      responseType: "user_continuity_capture_classification",
      status: "classified",
      semanticClass: "preference",
    });
    expect(buildUserContinuityCaptureCandidate(
      request.request,
      classification,
      "not-a-time",
    )).toEqual({
      status: "rejected",
      reason: "invalid_timestamp",
    });
  });

  it("contains no model invocation, persistence, record construction, connector, or trust-promotion machinery", async () => {
    const source = await import("node:fs").then(({ readFileSync }) =>
      readFileSync("lib/operating-picture/user-continuity-capture-contract.ts", "utf8"));

    for (const forbidden of [
      "Anthropic",
      "messages.create",
      "callModel",
      "Supabase",
      "appendVersion",
      "append_operating_picture_version",
      "createInitialOperatingPictureRecordVersion",
      "createPreferenceRecord",
      "createPlanRecord",
      "createCommitmentRecord",
      "createDecisionRecord",
      "createUserAssertionRecord",
      "GovernedEvidence",
      "AuthorityEvidence",
      "PolicyProof",
      "VerificationProof",
      "CompletionProof",
      "GoogleCalendar",
      "Gmail",
      "Drive",
    ]) {
      expect(source).not.toContain(forbidden);
    }
  });
});
