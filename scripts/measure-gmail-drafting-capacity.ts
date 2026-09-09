import Anthropic from "@anthropic-ai/sdk";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { CLAUDE_MAX_TOKENS, CLAUDE_MODEL, CLAUDE_TIMEOUT_MS } from "../lib/anthropic-client";
import { buildSpecialistPrompt } from "../lib/lighter-jarvis/runtime";
import { writeMeasurementCheckpoint } from "../lib/measurement/measurement-checkpoint";
import {
  MEASUREMENT_SCHEMA_VERSION,
  buildReportProgress,
  buildFixture,
  buildHistory,
  buildMeasurementInstruction,
  buildProviderRejectionResumePlan,
  buildScreeningPlan,
  fixtureDigest,
  measurementCellKey,
  parseMeasurementReply,
  selectBoundaryCandidates,
  validateDraftReply,
  type FailureKind,
  type MeasurementCell,
} from "../lib/measurement/gmail-drafting-capacity";

type Phase = "screening" | "boundary";
interface UsageRecord { inputTokens: number; outputTokens: number; cacheCreationInputTokens?: number; cacheReadInputTokens?: number }
interface ResultRow extends MeasurementCell {
  attempt: number;
  status: "passed" | "failed";
  failureKind?: FailureKind;
  detail?: string;
  fixtureDigest: string;
  historyMessages: number;
  historyCharacters: number;
  elapsedMs: number;
  httpStatus?: number;
  stopReason?: string | null;
  responseFormat?: "raw_json" | "json_fence";
  responseDiagnostics?: {
    responseCharacters: number;
    contentBlockTypes: string[];
    textBlockCount: number;
  };
  usage?: UsageRecord;
}

function argument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function classifyError(error: unknown): { failureKind: FailureKind; detail: string; httpStatus?: number } {
  if (error instanceof Anthropic.APIConnectionTimeoutError) return { failureKind: "timeout", detail: error.message };
  if (error instanceof Anthropic.APIError) {
    const detail = error.message;
    const contextLimit = /context|token|too long|maximum.*length/i.test(detail);
    return { failureKind: contextLimit ? "provider_context_limit" : "provider_rejection", detail, httpStatus: error.status };
  }
  return { failureKind: "provider_rejection", detail: error instanceof Error ? error.message : "unknown provider error" };
}

async function loadBoundaryPlan(path: string): Promise<MeasurementCell[]> {
  const parsed = JSON.parse(await readFile(path, "utf8")) as { phase?: string; results?: ResultRow[] };
  if (parsed.phase !== "screening" || !Array.isArray(parsed.results)) throw new Error("boundary phase requires a valid screening report");
  return selectBoundaryCandidates(parsed.results);
}

interface ScreeningReport {
  schemaVersion?: number;
  phase?: string;
  model?: string;
  maxOutputTokens?: number;
  timeoutMs?: number;
  results?: ResultRow[];
}

async function loadResume(path: string): Promise<{
  retained: ResultRow[];
  retry: MeasurementCell[];
  sourceReportDigest: string;
  replacedProviderRejections: number;
}> {
  const content = await readFile(path, "utf8");
  const parsed = JSON.parse(content) as ScreeningReport;
  if (parsed.schemaVersion !== MEASUREMENT_SCHEMA_VERSION || parsed.phase !== "screening") {
    throw new Error("resume requires a compatible screening report");
  }
  if (parsed.model !== CLAUDE_MODEL || parsed.maxOutputTokens !== CLAUDE_MAX_TOKENS || parsed.timeoutMs !== CLAUDE_TIMEOUT_MS) {
    throw new Error("resume report model configuration does not match the current measurement contract");
  }
  if (!Array.isArray(parsed.results)) throw new Error("resume report results are missing");
  const resume = buildProviderRejectionResumePlan(parsed.results);
  return {
    ...resume,
    sourceReportDigest: createHash("sha256").update(content).digest("hex"),
    replacedProviderRejections: resume.retry.length,
  };
}

function validateCell(cell: MeasurementCell): string | undefined {
  if (!Number.isInteger(cell.targetCharacters) || cell.targetCharacters <= 0) return "fixture size must be a positive integer";
  const history = buildHistory(cell.historyKind);
  if (history.length !== 0 && history.length !== 39) return "history must contain zero or 39 messages";
  if (history.some(message => message.content.length >= 8_000)) return "history contains an ordinary message at or above 8,000 characters";
}

async function measure(client: Anthropic, systemPrompt: string, cell: MeasurementCell, attempt: number): Promise<ResultRow> {
  const started = Date.now();
  const validationError = validateCell(cell);
  if (validationError) {
    return {
      ...cell,
      attempt,
      status: "failed",
      failureKind: "client_validation",
      detail: validationError,
      fixtureDigest: "unavailable",
      historyMessages: 0,
      historyCharacters: 0,
      elapsedMs: Date.now() - started,
    };
  }
  const fixture = buildFixture(cell.fixtureKind, cell.targetCharacters);
  const history = buildHistory(cell.historyKind);
  const base = {
    ...cell,
    attempt,
    fixtureDigest: fixtureDigest(fixture),
    historyMessages: history.length,
    historyCharacters: history.reduce((sum, message) => sum + message.content.length, 0),
  };
  try {
    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: CLAUDE_MAX_TOKENS,
      system: systemPrompt,
      messages: [...history, { role: "user", content: buildMeasurementInstruction(fixture) }],
    });
    const elapsedMs = Date.now() - started;
    const text = response.content.filter(block => block.type === "text").map(block => block.text).join("");
    const responseDiagnostics = {
      responseCharacters: text.length,
      contentBlockTypes: response.content.map(block => block.type),
      textBlockCount: response.content.filter(block => block.type === "text").length,
    };
    const parsed = parseMeasurementReply(text);
    if (!parsed.ok) {
      return { ...base, elapsedMs, status: "failed", failureKind: "malformed_response", detail: parsed.detail, stopReason: response.stop_reason, usage: usage(response.usage), responseDiagnostics };
    }
    const fidelity = validateDraftReply(parsed.value);
    if (!fidelity.ok) return { ...base, elapsedMs, status: "failed", failureKind: "fidelity_failure", detail: fidelity.detail, stopReason: response.stop_reason, usage: usage(response.usage), responseFormat: parsed.format, responseDiagnostics };
    return { ...base, elapsedMs, status: "passed", stopReason: response.stop_reason, usage: usage(response.usage), responseFormat: parsed.format, responseDiagnostics };
  } catch (error) {
    return { ...base, elapsedMs: Date.now() - started, status: "failed", ...classifyError(error) };
  }
}

interface ReportMetadata {
  generatedAt: string;
  phase: Phase;
  projectedCalls: number;
  resume?: {
    sourceReportDigest: string;
    replacedProviderRejections: number;
  };
}

function buildReport(metadata: ReportMetadata, results: ResultRow[], interrupted: boolean) {
  return {
    schemaVersion: MEASUREMENT_SCHEMA_VERSION,
    generatedAt: metadata.generatedAt,
    updatedAt: new Date().toISOString(),
    phase: metadata.phase,
    model: CLAUDE_MODEL,
    maxOutputTokens: CLAUDE_MAX_TOKENS,
    timeoutMs: CLAUDE_TIMEOUT_MS,
    privacy: "Synthetic fixtures only; prompt and response content are not retained.",
    ...(metadata.resume ? { resume: metadata.resume } : {}),
    progress: buildReportProgress(results.length, metadata.projectedCalls, interrupted),
    results,
  };
}

function usage(value: Anthropic.Messages.Usage): UsageRecord {
  const extended = value as Anthropic.Messages.Usage & { cache_creation_input_tokens?: number; cache_read_input_tokens?: number };
  return {
    inputTokens: value.input_tokens,
    outputTokens: value.output_tokens,
    ...(typeof extended.cache_creation_input_tokens === "number" ? { cacheCreationInputTokens: extended.cache_creation_input_tokens } : {}),
    ...(typeof extended.cache_read_input_tokens === "number" ? { cacheReadInputTokens: extended.cache_read_input_tokens } : {}),
  };
}

async function main(): Promise<void> {
  const phase = (argument("--phase") ?? "screening") as Phase;
  if (phase !== "screening" && phase !== "boundary") throw new Error("--phase must be screening or boundary");
  const resumePathArgument = argument("--resume-report");
  if (resumePathArgument && phase !== "screening") throw new Error("--resume-report is available only for screening phase");
  const resumePath = resumePathArgument ? resolve(resumePathArgument) : undefined;
  const resume = resumePath ? await loadResume(resumePath) : undefined;
  const plan = resume
    ? resume.retry
    : phase === "screening"
      ? buildScreeningPlan()
      : await loadBoundaryPlan(resolve(argument("--screening-report") ?? (() => { throw new Error("--screening-report is required for boundary phase"); })()));
  const attempts = phase === "boundary" ? 5 : 1;

  if (!process.argv.includes("--run")) {
    console.log(JSON.stringify({ mode: "plan-only", phase, resume: Boolean(resume), retainedResults: resume?.retained.length ?? 0, cells: plan.length, attemptsPerCell: attempts, projectedCalls: plan.length * attempts, plan }, null, 2));
    return;
  }
  if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is required with --run");
  const output = resolve(argument("--output") ?? `data/capacity-measurements/gmail-drafting-${phase}-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  if (resumePath && output === resumePath) throw new Error("resume output must not overwrite the source report");
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: CLAUDE_TIMEOUT_MS, maxRetries: 0 });
  const systemPrompt = await buildSpecialistPrompt();
  const resultByCell = new Map((resume?.retained ?? []).map(row => [measurementCellKey(row), row]));
  const results: ResultRow[] = [];
  const orderedPlan = phase === "screening" ? buildScreeningPlan() : plan;
  const reportResults = () => resume
    ? orderedPlan.map(cell => resultByCell.get(measurementCellKey(cell))).filter((row): row is ResultRow => Boolean(row))
    : results;
  const metadata = {
    generatedAt: new Date().toISOString(),
    phase,
    projectedCalls: orderedPlan.length * attempts,
    ...(resume ? { resume: { sourceReportDigest: resume.sourceReportDigest, replacedProviderRejections: resume.replacedProviderRejections } } : {}),
  };
  let interrupted = false;
  process.once("SIGINT", () => {
    interrupted = true;
    console.log("\nInterrupt requested; preserving the latest completed checkpoint.");
  });
  await writeMeasurementCheckpoint(output, buildReport(metadata, reportResults(), false), true);
  for (const cell of plan) {
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      if (interrupted) break;
      const priorAttempt = resume ? 1 : 0;
      const row = await measure(client, systemPrompt, cell, attempt + priorAttempt);
      if (resume) resultByCell.set(measurementCellKey(cell), row);
      else results.push(row);
      console.log(`${row.status.toUpperCase()} ${cell.fixtureKind} ${cell.targetCharacters} ${cell.historyKind} attempt ${attempt}${row.failureKind ? ` (${row.failureKind})` : ""}`);
      await writeMeasurementCheckpoint(output, buildReport(metadata, reportResults(), interrupted));
    }
    if (interrupted) break;
  }
  await writeMeasurementCheckpoint(output, buildReport(metadata, reportResults(), interrupted));
  console.log(`${interrupted ? "Preserved partial" : "Wrote complete"} report at ${output}`);
  if (interrupted) process.exitCode = 130;
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
