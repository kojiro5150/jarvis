import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { OperationalValidationReportBrowser } from "./browser";
import type { OperationalValidationInput } from "./types";

function report(runId: string, generatedAt: string): OperationalValidationInput {
  return {
    runId,
    provenance: { executionSource: "authenticated_deployment", connectorSource: "live_google_calendar", validationLevel: "operational", oauthSession: "present", generatedBy: "test-runner", generatedAt, runnerVersion: "runner-v1" },
    operatorConfirmation: "pending",
    deterministicValidationCompleted: true,
    legacyComparisonStatus: "NOT_ENABLED",
    scenarios: [{ scenarioId: `${runId}-scenario`, scenarioCategory: "CURRENT_WORKING_DAY", validationDate: generatedAt.slice(0, 10), connectorEvidence: {}, canonicalProjection: {}, situationalAwareness: {}, availabilityComputation: {}, executiveRepresentation: {}, comparisonClassification: "Action Required", outcomeReason: "REQUIRES_INVESTIGATION", matchedClaims: 0, comparedClaims: 1 }],
  };
}

async function fixture(): Promise<{ root: string; firstContents: string }> {
  const root = await mkdtemp(path.join(tmpdir(), "report-browser-"));
  const directory = path.join(root, "data/validation-reports");
  await mkdir(directory, { recursive: true });
  const firstContents = `${JSON.stringify(report("run-alpha", "2026-01-02T03:04:05.000Z"), null, 2)}\n`;
  await writeFile(path.join(directory, "untrusted-filename.json"), firstContents);
  await writeFile(path.join(directory, "second.json"), `${JSON.stringify(report("run-beta", "2026-01-03T03:04:05.000Z"), null, 2)}\n`);
  await writeFile(path.join(directory, "ignored.txt"), "not a report");
  return { root, firstContents };
}

describe("OperationalValidationReportBrowser", () => {
  it("discovers and lists JSON reports using report-owned metadata", async () => {
    const { root } = await fixture();
    await expect(new OperationalValidationReportBrowser({ repositoryRoot: root }).list()).resolves.toEqual([
      { runId: "run-alpha", generatedAt: "2026-01-02T03:04:05.000Z" },
      { runId: "run-beta", generatedAt: "2026-01-03T03:04:05.000Z" },
    ]);
  });

  it("opens the newest report and preserves the complete stored bytes", async () => {
    const { root, firstContents } = await fixture();
    const browser = new OperationalValidationReportBrowser({ repositoryRoot: root });
    expect((await browser.show("run-alpha")).contents).toBe(firstContents);
    expect((await browser.latest()).report.runId).toBe("run-beta");
  });

  it("derives only the required summary fields from the selected report", async () => {
    const { root } = await fixture();
    const summary = await new OperationalValidationReportBrowser({ repositoryRoot: root }).summary("run-alpha");
    expect(summary).toEqual({ runId: "run-alpha", generatedTimestamp: "2026-01-02T03:04:05.000Z", executionSource: "authenticated_deployment", operatorConfirmation: "pending", validationStatus: true, migrationRecommendation: "NOT_ASSESSED", recommendationBasis: "AUTHENTICATED_VALIDATION_INCOMPLETE", legacyComparisonStatus: "NOT_ENABLED", scenarioCount: 1, scenarioIdentifiers: ["run-alpha-scenario"], implementationDefects: 1, authenticatedExecutionStatus: true });
    expect(Object.keys(summary)).toHaveLength(12);
  });

  it("returns an empty listing for an absent report directory", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "report-browser-empty-"));
    await expect(new OperationalValidationReportBrowser({ repositoryRoot: root }).list()).resolves.toEqual([]);
  });
});
