import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { createAnonymisedValidationSummary } from "./summary.ts";
import type { OperationalValidationInput } from "./types.ts";

export interface ValidationReportDocument {
  readonly report: OperationalValidationInput;
  readonly contents: string;
}

export interface ValidationReportListing {
  readonly runId: string;
  readonly generatedAt: string;
}

export interface OperationalValidationReportSummary {
  readonly runId: string;
  readonly generatedTimestamp: string;
  readonly executionSource: string;
  readonly operatorConfirmation: string;
  readonly validationStatus: boolean;
  readonly migrationRecommendation: string;
  readonly recommendationBasis: string;
  readonly legacyComparisonStatus: string;
  readonly scenarioCount: number;
  readonly scenarioIdentifiers: readonly string[];
  readonly implementationDefects: number;
  readonly authenticatedExecutionStatus: boolean;
}

export interface BrowseValidationReportsOptions {
  readonly repositoryRoot?: string;
  readonly reportDirectory?: string;
}

function requireReport(value: unknown, source: string): OperationalValidationInput {
  if (typeof value !== "object" || value === null) throw new Error(`invalid validation report: ${source}`);
  const report = value as Partial<OperationalValidationInput>;
  if (
    typeof report.runId !== "string" ||
    typeof report.provenance?.generatedAt !== "string" ||
    typeof report.provenance.executionSource !== "string" ||
    typeof report.operatorConfirmation !== "string" ||
    typeof report.deterministicValidationCompleted !== "boolean" ||
    !Array.isArray(report.scenarios) ||
    typeof report.legacyComparisonStatus !== "string" ||
    report.scenarios.some((scenario) => typeof scenario?.scenarioId !== "string")
  ) {
    throw new Error(`invalid validation report: ${source}`);
  }
  return report as OperationalValidationInput;
}

export class OperationalValidationReportBrowser {
  private readonly reportDirectory: string;

  constructor(options: BrowseValidationReportsOptions = {}) {
    const root = path.resolve(options.repositoryRoot ?? process.cwd());
    this.reportDirectory = path.resolve(root, options.reportDirectory ?? "data/validation-reports");
  }

  async discover(): Promise<readonly ValidationReportDocument[]> {
    let entries;
    try {
      entries = await readdir(this.reportDirectory, { withFileTypes: true });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw error;
    }
    const filenames = entries
      .filter((entry) => entry.isFile() && path.extname(entry.name) === ".json")
      .map((entry) => entry.name)
      .sort();
    return Promise.all(filenames.map(async (filename) => {
      const contents = await readFile(path.join(this.reportDirectory, filename), "utf8");
      return { contents, report: requireReport(JSON.parse(contents) as unknown, filename) };
    }));
  }

  async list(): Promise<readonly ValidationReportListing[]> {
    const reports = await this.discover();
    return reports
      .map(({ report }) => ({ runId: report.runId, generatedAt: report.provenance.generatedAt }))
      .sort((left, right) => left.generatedAt.localeCompare(right.generatedAt) || left.runId.localeCompare(right.runId));
  }

  async latest(): Promise<ValidationReportDocument> {
    const reports = await this.discover();
    const latest = [...reports].sort((left, right) =>
      right.report.provenance.generatedAt.localeCompare(left.report.provenance.generatedAt) ||
      right.report.runId.localeCompare(left.report.runId),
    )[0];
    if (!latest) throw new Error("no operational validation reports found");
    return latest;
  }

  async show(runId: string): Promise<ValidationReportDocument> {
    const matches = (await this.discover()).filter(({ report }) => report.runId === runId);
    if (matches.length === 0) throw new Error(`operational validation report not found: ${runId}`);
    if (matches.length > 1) throw new Error(`duplicate operational validation run ID: ${runId}`);
    return matches[0];
  }

  async summary(runId: string): Promise<OperationalValidationReportSummary> {
    const { report } = await this.show(runId);
    const recommendation = createAnonymisedValidationSummary(report).migrationRecommendation;
    return {
      runId: report.runId,
      generatedTimestamp: report.provenance.generatedAt,
      executionSource: report.provenance.executionSource,
      operatorConfirmation: report.operatorConfirmation,
      validationStatus: report.deterministicValidationCompleted === true,
      migrationRecommendation: recommendation.value,
      recommendationBasis: recommendation.basis,
      legacyComparisonStatus: recommendation.evidence.legacyComparisonStatus,
      scenarioCount: report.scenarios.length,
      scenarioIdentifiers: report.scenarios.map(({ scenarioId }) => scenarioId),
      implementationDefects: recommendation.evidence.implementationDefectsDetected,
      authenticatedExecutionStatus: recommendation.evidence.authenticatedExecution,
    };
  }
}
