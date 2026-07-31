import { describe, expect, it } from "vitest";
import { dashboardEvaluationFixture } from "./dashboard-parallel-evaluation";
import {
  buildProductionDashboardPresentation,
  selectDashboardPresentationMode,
} from "./dashboard-presentation-selection";

describe("production Dashboard presentation selection", () => {
  it("defaults deterministically to LEGACY and rejects ambiguous configuration", () => {
    expect(selectDashboardPresentationMode(undefined)).toBe("LEGACY");
    expect(selectDashboardPresentationMode("LEGACY")).toBe("LEGACY");
    expect(selectDashboardPresentationMode("GOVERNED")).toBe("GOVERNED");
    expect(() => selectDashboardPresentationMode("governed")).toThrow(/LEGACY or GOVERNED/);
  });

  it("supplies both production consumer paths from the same operational input", () => {
    const operationalState = dashboardEvaluationFixture("operational-content");
    const governed = buildProductionDashboardPresentation(operationalState);

    expect(operationalState.projects[0]?.name).toBe("Dashboard");
    expect(operationalState.gmailThreads[0]?.needsReply).toBe(true);
    expect(governed.projects[0]?.name).toBe("Dashboard");
    expect(governed.communications[0]?.sender).toBe("Reviewer");
    expect(governed.contractVersion).toBe("dashboard-presentation-v1");
  });

  it("uses the operational publication timestamp as the explicit governed reference", () => {
    const operationalState = dashboardEvaluationFixture("relative-duration");
    const governed = buildProductionDashboardPresentation(operationalState);

    expect(governed.configuration.referenceTime).toBe(operationalState.updatedAt);
    expect(governed.communications[0]?.relativeObservedAt).toBe("2 hours ago");
  });
});
