import { describe, expect, it } from "vitest";
import { dawnwatchEvaluationFixture } from "./dawnwatch-parallel-evaluation";
import { getOpeningBrief } from "./briefing";
import {
  buildDawnwatchPresentation,
  DEFAULT_DAWNWATCH_PRESENTATION_CONFIGURATION,
  type DawnwatchPresentationInput,
} from "./dawnwatch-presentation";
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

  it("uses stable entity ids as assertions so complete evidence can become available", () => {
    const state = dawnwatchEvaluationFixture("shared-priority-observation");
    state.calendar = [{
      id: "commitment-1", title: "Operator review", start: "2026-08-01T00:00:00Z",
      end: "2026-08-01T01:00:00Z", day: "SAT", time: "10:00", source: "google",
      calendarId: "primary", calendarName: "Operations", status: "confirmed",
    }];
    state.gmailThreads = [{
      id: "communication-1", subject: "Review evidence", from: "operator@example.com",
      snippet: "Please review", receivedAt: "2026-07-31T11:00:00Z", unread: true,
      needsReply: true, important: false, source: "google", sourceLabel: "Main Gmail",
    }];

    const bridged = buildProductionDawnwatchInput(state);
    expect(bridged.priorities[0]?.provenance.assertionId).toBe("priority-0");
    expect(bridged.commitments[0]?.provenance.assertionId).toBe("commitment-1");
    expect(bridged.communications[0]?.provenance.assertionId).toBe("communication-1");
    expect(bridged.sources.map(source => source.provenance.assertionId)).toEqual(["calendar", "gmail", "drive"]);

    // Satisfy the bridge's other deliberately unavailable evidence inputs independently so this
    // test isolates whether assertion identity still forces insufficient_coverage.
    const provenance = (assertionId: string) => ({ sourceId: "operational", assertionId });
    const evidenceReadyInput = {
      priorities: bridged.priorities.map(item => ({ ...item, provenance: provenance(item.provenance.assertionId) })),
      commitments: bridged.commitments.map(item => ({ ...item, provenance: provenance(item.provenance.assertionId) })),
      communications: bridged.communications.map(item => ({
        ...item, recipients: ["operator@example.com"], provenance: provenance(item.provenance.assertionId),
      })),
      sources: [{
        id: "operational", kind: "operational", availability: "available",
        observedAt: "2026-07-31T11:00:00Z", snapshotId: "snapshot-1",
        provenance: provenance("source-assertion-1"),
      }],
    } satisfies DawnwatchPresentationInput;
    const configuration = {
      ...DEFAULT_DAWNWATCH_PRESENTATION_CONFIGURATION,
      referenceTime: state.updatedAt,
      sourceScope: ["operational"],
      identityTieBreakRule: "canonical_identity_ascending",
    } as const;
    const assertionless = buildDawnwatchPresentation({
      ...evidenceReadyInput,
      priorities: evidenceReadyInput.priorities.map(item => ({ ...item, provenance: provenance("") })),
      commitments: evidenceReadyInput.commitments.map(item => ({ ...item, provenance: provenance("") })),
      communications: evidenceReadyInput.communications.map(item => ({ ...item, provenance: provenance("") })),
    }, configuration);
    const presentation = buildDawnwatchPresentation(evidenceReadyInput, configuration);

    expect([
      assertionless.priorities.status,
      assertionless.commitments.status,
      assertionless.communications.status,
    ]).toEqual(["insufficient_coverage", "insufficient_coverage", "insufficient_coverage"]);
    expect([
      presentation.priorities.status,
      presentation.commitments.status,
      presentation.communications.status,
    ]).toEqual(["available", "available", "available"]);
  });

  it("aligns connector provenance and supplies deterministic source observations end-to-end", () => {
    const state = dawnwatchEvaluationFixture("tomorrow-afternoon");
    state.gmailThreads = [{
      id: "communication-1", subject: "Review evidence", from: "operator@example.com",
      snippet: "Please review", receivedAt: "2026-07-31T11:00:00Z", unread: true,
      needsReply: true, important: false, source: "google", sourceLabel: "Main Gmail",
    }];

    const input = buildProductionDawnwatchInput(state);
    expect(input.commitments[0]?.provenance.sourceId).toBe("calendar");
    expect(input.communications[0]?.provenance.sourceId).toBe("gmail");
    expect(input.sources).toEqual(state.connectorStatuses.map(source => ({
      id: source.name,
      kind: source.name,
      availability: "available",
      observedAt: state.updatedAt,
      snapshotId: `snapshot-${source.name}-${state.updatedAt}`,
      provenance: { sourceId: source.name, assertionId: source.name },
    })));

    const presentation = buildDawnwatchPresentation(input, {
      ...DEFAULT_DAWNWATCH_PRESENTATION_CONFIGURATION,
      referenceTime: state.updatedAt,
      sourceScope: input.sources.map(source => source.id),
      identityTieBreakRule: "canonical_identity_ascending",
    });

    expect(presentation.commitments.status).toBe("available");
    // OperationalState carries no communication recipients, so that independent semantic-field
    // requirement remains honestly insufficient rather than being fabricated by this bridge.
    expect(presentation.communications.status).toBe("insufficient_coverage");
  });
});
