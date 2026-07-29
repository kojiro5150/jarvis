import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createAnonymisedValidationSummary } from "./summary";
import type { AnonymisedValidationSummary, OperationalValidationInput } from "./types";

export interface RecordOperationalValidationOptions {
  readonly repositoryRoot?: string;
  readonly reportDirectory?: string;
}

/** Explicitly invoked evidence writer. It has no dependency on, or integration with, /api/chat. */
export async function recordOperationalValidation(
  input: OperationalValidationInput,
  options: RecordOperationalValidationOptions = {},
): Promise<Readonly<{ reportPath: string; summary: AnonymisedValidationSummary }>> {
  const root = path.resolve(options.repositoryRoot ?? process.cwd());
  const reportDirectory = path.resolve(root, options.reportDirectory ?? "data/validation-reports");
  const governedDirectory = path.resolve(root, "data/validation-reports");
  if (reportDirectory !== governedDirectory && !reportDirectory.startsWith(`${governedDirectory}${path.sep}`)) {
    throw new Error("complete validation reports must remain under data/validation-reports");
  }
  if (!/^[A-Za-z0-9._-]+$/.test(input.runId)) throw new Error("runId contains unsafe path characters");
  const summary = createAnonymisedValidationSummary(input);
  await mkdir(reportDirectory, { recursive: true });
  const reportPath = path.join(reportDirectory, `${input.runId}.json`);
  await writeFile(reportPath, `${JSON.stringify(input, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
  return { reportPath, summary };
}
