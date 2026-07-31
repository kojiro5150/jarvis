import { describe, expect, it } from "vitest";
import {
  DASHBOARD_EVALUATION_CONFIGURATION, DASHBOARD_EVALUATION_SCENARIOS,
  dashboardEvaluationFixture, evaluateDashboardScenario,
} from "./dashboard-parallel-evaluation";

describe("Sprint 3.60 Dashboard parallel evaluation", () => {
  it("replays every synthetic scenario deterministically from one recorded OperationalState", () => {
    for (const scenario of DASHBOARD_EVALUATION_SCENARIOS) {
      const first = evaluateDashboardScenario(scenario);
      expect(first).toEqual(evaluateDashboardScenario(scenario));
      expect(first.identicalInputEvidence.operationalState).toEqual(dashboardEvaluationFixture(scenario));
      expect(first.fixtureNotice).toContain("NOT_AUTHENTICATED_OPERATIONAL_EVIDENCE");
      expect(first.comparison.every(row => !!row.classification)).toBe(true);
      expect(first.recommendation).toBe("Ready for Promotion");
    }
  });

  it("orders commitments and excludes cancelled commitments from next-event selection", () => {
    const ordered = evaluateDashboardScenario("multiple-commitments");
    expect([ordered.governed.nextCommitment, ...ordered.governed.followingCommitments].map(item => item?.id)).toEqual(["a", "b", "later"]);
    expect(ordered.legacy.nextCommitment?.id).toBe("later");

    const cancelled = evaluateDashboardScenario("cancelled-commitment");
    expect(cancelled.legacy.nextCommitment?.id).toBe("cancelled");
    expect(cancelled.governed.nextCommitment?.id).toBe("active");
    expect(cancelled.governed.calendar.find(item => item.id === "cancelled")?.status).toBe("cancelled");
  });

  it("uses the configured calendar reference and deterministic temporal formatting", () => {
    const allDay = evaluateDashboardScenario("bare-date-commitment").governed.nextCommitment;
    expect(allDay).toMatchObject({ day: "MON", time: "All day" });
    const timed = evaluateDashboardScenario("timed-commitment").governed.nextCommitment;
    expect(timed).toMatchObject({ day: "SAT", time: "10:30" });
    expect(evaluateDashboardScenario("timed-commitment").governed.configuration).toEqual(DASHBOARD_EVALUATION_CONFIGURATION);
    expect(evaluateDashboardScenario("relative-duration").governed.communications[0]?.relativeObservedAt).toBe("2 hours ago");
  });

  it("summarises mixed connector availability and does not expand canonical publication", () => {
    expect(evaluateDashboardScenario("mixed-connectors").governed.connectorSummary).toEqual({ live: 2, total: 3, allLive: false });
    for (const scenario of DASHBOARD_EVALUATION_SCENARIOS) {
      const governed = JSON.stringify(evaluateDashboardScenario(scenario).governed);
      expect(governed).not.toMatch(/updatedAt|snippet|recurringEventId|selfAttendeeResponse|progress|calendarName|sourceLabel|unread|important|driveFiles/);
    }
  });

  it("preserves governed operational labels and provenance while separating view state", () => {
    const evaluation = evaluateDashboardScenario("operational-content");
    expect(evaluation.governed.priorities).toEqual([{ id: "priority-0", title: "Ship evidence" }]);
    expect(evaluation.governed.projects).toEqual([{ id: "project-0", name: "Dashboard" }]);
    expect(evaluation.governed.communications[0]).toMatchObject({ subject: "Review", sender: "Reviewer", source: "google" });
    expect(evaluation.governed.needsReply).toEqual([]);
    expect(evaluation.governed.specialistBadges).toEqual(expect.objectContaining({ jarvis: 0, dawnwatch: 0 }));
    expect(evaluation.comparison.find(row => row.capability === "Dashboard View State separation")?.classification).toBe("Intentional Improvement");
  });

  it("covers historical reference scenarios without evaluating the chat path", () => {
    const calendar = evaluateDashboardScenario("timed-commitment").governed;
    expect(calendar.configuration.referenceTime).toBe("2026-07-31T12:00:00Z");
    expect(calendar.calendar).toHaveLength(1); // deterministic availability for a future consumer
    const consistent = evaluateDashboardScenario("multiple-commitments").governed;
    expect([consistent.nextCommitment, ...consistent.followingCommitments].filter(Boolean)).toEqual(consistent.calendar);
  });
});
