import { describe, expect, it } from "vitest";
import { DISCRETIONARY_AVAILABILITY_STATEMENT, resolveDiscretionaryAvailabilityPreference } from "./discretionary-availability-preference";
import type { DurablePurposeProjectionResult } from "./purpose-projection-retrieval";

function item(statement: string, overrides: Record<string, unknown> = {}) {
  return Object.freeze({ recordId: crypto.randomUUID(), versionId: crypto.randomUUID(), purpose: "conversation", semanticClass: "preference", lifecycle: "current", recoveryDisposition: "recoverable_user_continuity", subject: Object.freeze({ namespace: "user_continuity", entity: "user", attribute: "statement", revision: "append_only" }), payload: Object.freeze({ statement }), visibilityPurposes: Object.freeze(["conversation"]), validFrom: null, validUntil: null, staleAfter: null, authorshipSource: "user", authorshipAt: "2026-09-02T00:00:00.000Z", ...overrides });
}

function projection(items: readonly ReturnType<typeof item>[]): DurablePurposeProjectionResult {
  return Object.freeze({ status: "projected", purpose: "conversation", items, decisions: Object.freeze([]) }) as DurablePurposeProjectionResult;
}

describe("discretionary availability preference admission", () => {
  it("parses only the exact normalized user-authored preference into typed values", () => {
    expect(resolveDiscretionaryAvailabilityPreference(projection([item(DISCRETIONARY_AVAILABILITY_STATEMENT)]))).toEqual({
      status: "resolved", preference: { timeZone: "Australia/Melbourne", weekdays: [1, 2, 3, 4, 5], startHour: 18, endHour: 21, weekendPolicy: "explicit_only" },
    });
  });

  it("does not admit model-authored or unrelated preferences", () => {
    expect(resolveDiscretionaryAvailabilityPreference(projection([item(DISCRETIONARY_AVAILABILITY_STATEMENT, { authorshipSource: "model" })]))).toEqual({ status: "missing" });
    expect(resolveDiscretionaryAvailabilityPreference(projection([item("I prefer concise answers.")]))).toEqual({ status: "missing" });
  });

  it("fails closed when a second current user-authored envelope differs", () => {
    expect(resolveDiscretionaryAvailabilityPreference(projection([
      item(DISCRETIONARY_AVAILABILITY_STATEMENT),
      item("my discretionary work-availability window is Monday to Friday, 5:00 PM to 8:00 PM."),
    ]))).toEqual({ status: "conflicting" });
  });
});
