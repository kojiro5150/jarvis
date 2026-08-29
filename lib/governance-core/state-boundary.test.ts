import { describe, expect, it } from "vitest";
import {
  createConversationReference,
  createConversationState,
} from "./state-boundary";

describe("Governance Core state boundary", () => {
  it("keeps semantic continuity as frozen low-trust references", () => {
    const recentMail = createConversationReference("result_set", "opaque-mail-list");
    const selected = createConversationReference("resource_selection", "opaque-selection");

    expect(recentMail).not.toBeNull();
    expect(selected).not.toBeNull();

    const state = createConversationState([recentMail!, selected!]);

    expect(state).toEqual({
      references: [
        { kind: "result_set", referenceId: "opaque-mail-list" },
        { kind: "resource_selection", referenceId: "opaque-selection" },
      ],
    });
    expect(Object.isFrozen(state)).toBe(true);
    expect(Object.isFrozen(state.references)).toBe(true);
    expect("authority" in state).toBe(false);
    expect("evidence" in state).toBe(false);
    expect("provenance" in state).toBe(false);
  });

  it("accepts opaque identifiers without treating them as proof of server state", () => {
    const fabricated = createConversationReference("pending_operation", "made-up-id");

    expect(fabricated).toEqual({
      kind: "pending_operation",
      referenceId: "made-up-id",
    });
    expect(fabricated && "authority" in fabricated).toBe(false);
    expect(fabricated && "operation" in fabricated).toBe(false);
  });

  it("rejects empty or unbounded reference identifiers", () => {
    expect(createConversationReference("other", "   ")).toBeNull();
    expect(createConversationReference("other", "x".repeat(257))).toBeNull();
  });
});
