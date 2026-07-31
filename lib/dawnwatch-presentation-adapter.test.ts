import { describe, expect, it } from "vitest";
import {
  buildDawnwatchPresentation,
  DEFAULT_DAWNWATCH_PRESENTATION_CONFIGURATION,
} from "./dawnwatch-presentation";
import { adaptDawnwatchPresentation } from "./dawnwatch-presentation-adapter";

describe("DAWNWATCH production presentation adapter", () => {
  const governed = buildDawnwatchPresentation({
    priorities: [], commitments: [], communications: [],
    sources: [{
      id: "calendar",
      kind: "calendar",
      availability: "unavailable",
      observedAt: "2026-07-31T00:00:00.000Z",
      snapshotId: "snapshot-1",
      provenance: { sourceId: "calendar", assertionId: "source-assertion-1" },
    }],
  }, {
    ...DEFAULT_DAWNWATCH_PRESENTATION_CONFIGURATION,
    referenceTime: "2026-07-31T01:00:00.000Z",
    sourceScope: ["calendar"],
    identityTieBreakRule: "canonical_identity_ascending",
  });

  it("preserves voice, semantic statuses, availability, and evidence", () => {
    const adapted = adaptDawnwatchPresentation(governed);
    expect(adapted.voice).toBe(governed.voice);
    expect(adapted.overallStatus).toBe(governed.overallStatus);
    expect(adapted.sections.priorities).toEqual({
      status: governed.priorities.status,
      availability: governed.priorities.availability,
      evidence: governed.priorities.evidence,
    });
    expect(adapted.sections.urgency).toEqual({
      status: "unsupported",
      availability: "pending_governance",
      evidence: governed.urgency.evidence,
    });
  });

  it("keeps pending and rejected capabilities explicit without legacy-only fields", () => {
    const adapted = adaptDawnwatchPresentation(governed);
    expect(adapted.capabilities.some(item => item.availability === "pending_governance")).toBe(true);
    expect(adapted.capabilities.some(item => item.availability === "rejected_by_governance")).toBe(true);
    expect(adapted).not.toHaveProperty("urgencyCount");
    expect(adapted).not.toHaveProperty("priorityRank");
    expect(adapted).not.toHaveProperty("dueText");
    expect(adapted).not.toHaveProperty("calendarName");
  });
});
