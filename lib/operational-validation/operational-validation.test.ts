import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createAnonymisedValidationSummary, recordOperationalValidation } from ".";
import type { OperationalScenarioRecord } from ".";

function scenario(overrides: Partial<OperationalScenarioRecord> = {}): OperationalScenarioRecord {
  return {
    scenarioId: "OV-TEST-001",
    scenarioCategory: "CURRENT_WORKING_DAY",
    validationDate: "2026-07-29",
    executiveContextOutput: { sensitiveTitle: "Local evidence only" },
    availabilityEngineOutput: { activeCommitments: 1 },
    calendarObservations: { attendees: ["local@example.invalid"] },
    legacyConversationalResponse: "Local response",
    extractedLegacyClaim: { type: "availability", value: "busy" },
    eosClaim: { type: "availability", value: "busy" },
    comparisonClassification: "Equivalent",
    outcomeReason: "EXPECTED_MATCH",
    engineeringObservations: "Retained only in the complete report.",
    migrationRecommendation: "Proceed",
    matchedClaims: 1,
    comparedClaims: 1,
    ...overrides,
  };
}

describe("operational validation evidence", () => {
  it("creates only the allow-listed anonymised summary fields", () => {
    const summary = createAnonymisedValidationSummary({ runId: "run-1", scenarios: [scenario()] });
    expect(summary).toEqual({
      version: "operational-validation-v1", validationDate: "2026-07-29", scenarioCount: 1,
      scenarios: [{
        scenarioId: "OV-TEST-001", scenarioCategory: "CURRENT_WORKING_DAY",
        comparisonClassification: "Equivalent", outcomeReason: "EXPECTED_MATCH",
        matchStatistics: { matched: 1, compared: 1 }, migrationRecommendation: "Proceed",
      }],
      matchStatistics: { matched: 1, compared: 1 }, migrationRecommendation: "Proceed",
    });
    const encoded = JSON.stringify(summary);
    expect(encoded).not.toContain("sensitiveTitle");
    expect(encoded).not.toContain("engineeringObservations");
    expect(encoded).not.toContain("example.invalid");
  });

  it("enforces controlled classifications, reasons, statistics, and conservative recommendations", () => {
    expect(() => createAnonymisedValidationSummary({ runId: "run", scenarios: [
      scenario({ comparisonClassification: "Equivalent", outcomeReason: "REQUIRES_INVESTIGATION" }),
    ] })).toThrow("outcome reason does not match classification");
    expect(() => createAnonymisedValidationSummary({ runId: "run", scenarios: [
      scenario({ matchedClaims: 2, comparedClaims: 1 }),
    ] })).toThrow("invalid match statistics");
    const summary = createAnonymisedValidationSummary({ runId: "run", scenarios: [
      scenario(),
      scenario({ scenarioId: "OV-TEST-002", scenarioCategory: "OVERLAPPING_COMMITMENTS",
        comparisonClassification: "Action Required", outcomeReason: "REQUIRES_INVESTIGATION",
        migrationRecommendation: "Defer", matchedClaims: 0 }),
    ] });
    expect(summary.migrationRecommendation).toBe("Defer");
    expect(summary.matchStatistics).toEqual({ matched: 1, compared: 2 });
  });

  it("retains complete local observations, refuses overwrite, and keeps runs independent", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "jarvis-validation-"));
    const first = await recordOperationalValidation({ runId: "run-a", scenarios: [scenario()] }, { repositoryRoot: root });
    const second = await recordOperationalValidation({ runId: "run-b", scenarios: [scenario()] }, { repositoryRoot: root });
    expect(first.reportPath).not.toBe(second.reportPath);
    expect(await readFile(first.reportPath, "utf8")).toContain("Retained only in the complete report.");
    await expect(recordOperationalValidation({ runId: "run-a", scenarios: [scenario()] }, { repositoryRoot: root }))
      .rejects.toThrow();
    await expect(recordOperationalValidation({ runId: "escape", scenarios: [scenario()] }, {
      repositoryRoot: root, reportDirectory: "elsewhere",
    })).rejects.toThrow("must remain under data/validation-reports");
  });

  it("remains isolated from the production conversation route", async () => {
    const route = await readFile("app/api/chat/route.ts", "utf8");
    expect(route).not.toContain("operational-validation");
    expect(route).not.toContain("recordOperationalValidation");
  });

  it("keeps the checked-in execution index inside the closed summary schema", async () => {
    const raw = await readFile("docs/validation/sprint-3.52a-summary.json", "utf8");
    const summary = JSON.parse(raw) as Record<string, unknown>;
    expect(Object.keys(summary).sort()).toEqual([
      "matchStatistics", "migrationRecommendation", "scenarioCount", "scenarios", "validationDate", "version",
    ]);
    const scenarios = summary.scenarios as Array<Record<string, unknown>>;
    expect(scenarios).toHaveLength(summary.scenarioCount as number);
    for (const item of scenarios) {
      expect(Object.keys(item).sort()).toEqual([
        "comparisonClassification", "matchStatistics", "migrationRecommendation", "outcomeReason", "scenarioCategory", "scenarioId",
      ]);
      expect(["EXPECTED_MATCH", "INTENTIONAL_IMPROVEMENT", "KNOWN_LIMITATION",
        "EXTRACTION_NOT_COMPARABLE", "REQUIRES_INVESTIGATION"]).toContain(item.outcomeReason);
    }
    expect(raw).not.toMatch(/title|attendee|email|location|observation|commentary|description/i);
  });
});
