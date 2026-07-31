import { describe, expect, it } from "vitest";
import { dawnwatchEvaluationFixture } from "./dawnwatch-parallel-evaluation";
import { getOpeningBrief } from "./briefing";
import {
  buildDawnwatchOpeningPresentation,
  buildProductionDawnwatchInput,
  selectDawnwatchPresentationMode,
} from "./dawnwatch-presentation-selection";

describe("production DAWNWATCH presentation selection", () => {
  it.each([
    [undefined, "LEGACY"],
    ["", "LEGACY"],
    ["   ", "LEGACY"],
    ["LEGACY", "LEGACY"],
    ["GOVERNED", "GOVERNED"],
  ] as const)("resolves %s to %s", (value, expected) => {
    expect(selectDawnwatchPresentationMode(value)).toBe(expected);
  });

  it.each(["legacy", "governed", "UNKNOWN", " LEGACY "])("rejects invalid value %s explicitly", value => {
    expect(() => selectDawnwatchPresentationMode(value)).toThrow(
      "DAWNWATCH_PRESENTATION_MODE must be LEGACY or GOVERNED",
    );
  });

  it("does not depend on DASHBOARD_PRESENTATION_MODE", () => {
    const original = process.env.DASHBOARD_PRESENTATION_MODE;
    process.env.DASHBOARD_PRESENTATION_MODE = "INVALID";
    try {
      expect(selectDawnwatchPresentationMode(undefined)).toBe("LEGACY");
      expect(selectDawnwatchPresentationMode("GOVERNED")).toBe("GOVERNED");
    } finally {
      if (original === undefined) delete process.env.DASHBOARD_PRESENTATION_MODE;
      else process.env.DASHBOARD_PRESENTATION_MODE = original;
    }
  });
});

describe("production DAWNWATCH opening-brief integration", () => {
  it("defaults and explicitly selects the unchanged legacy prose", () => {
    const state = dawnwatchEvaluationFixture("shared-priority-observation");
    const expected = getOpeningBrief("dawnwatch", state);

    expect(buildDawnwatchOpeningPresentation(selectDawnwatchPresentationMode(undefined), "dawnwatch", state))
      .toEqual({ mode: "LEGACY", prose: expected });
    expect(buildDawnwatchOpeningPresentation("LEGACY", "dawnwatch", state))
      .toEqual({ mode: "LEGACY", prose: expected });
  });

  it("explicitly selects the governed voice and preserves unavailable governance statuses", () => {
    const state = dawnwatchEvaluationFixture("shared-priority-observation");
    const result = buildDawnwatchOpeningPresentation("GOVERNED", "dawnwatch", state);

    expect(result?.mode).toBe("GOVERNED");
    if (result?.mode !== "GOVERNED") throw new Error("expected governed presentation");
    expect(result.presentation.voice).toContain("Urgency summary: unsupported pending governance.");
    expect(result.presentation.capabilities).toContainEqual({
      capability: "temporal_window",
      status: "unsupported",
      availability: "pending_governance",
    });
    expect(result.presentation.capabilities).toContainEqual({
      capability: "communication_attention_selection",
      status: "unsupported",
      availability: "rejected_by_governance",
    });
  });

  it("leaves non-DAWNWATCH opening briefs on their existing path", () => {
    const state = dawnwatchEvaluationFixture("shared-priority-observation");
    expect(buildDawnwatchOpeningPresentation("GOVERNED", "oracle", state)).toBeUndefined();
    expect(getOpeningBrief("oracle", state)).toContain("No open research threads");
  });

  it("does not mutate OperationalState or reconstruct excluded legacy fields", () => {
    const state = dawnwatchEvaluationFixture("shared-priority-observation");
    const before = structuredClone(state);
    const input = buildProductionDawnwatchInput(state);
    buildDawnwatchOpeningPresentation("GOVERNED", "dawnwatch", state);

    expect(state).toEqual(before);
    expect(input.priorities[0]).not.toHaveProperty("rank");
    expect(input.priorities[0]).not.toHaveProperty("due");
    expect(input.communications.every(item => !("unread" in item) && !("important" in item))).toBe(true);
    expect(input.commitments.every(item => !("calendarName" in item))).toBe(true);
  });
});
