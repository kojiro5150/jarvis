import Anthropic from "@anthropic-ai/sdk";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { CLAUDE_MAX_TOKENS, CLAUDE_MODEL, CLAUDE_TIMEOUT_MS } from "../lib/anthropic-client";
import { buildSpecialistPrompt } from "../lib/lighter-jarvis/runtime";
import { writeMeasurementCheckpoint } from "../lib/measurement/measurement-checkpoint";
import {
  MEASUREMENT_SCHEMA_VERSION,
  assessDraftFidelity,
  buildBoundaryProviderRejectionResumePlan,
  buildFailureResumePlan,
  buildReportProgress,
  buildFixture,
  buildHistory,
  buildMeasurementInstruction,
  buildProviderRejectionResumePlan,
  buildScreeningPlan,
  buildStepDownConfirmationPlan,
  buildStepDownProbePlan,
  fixtureDigest,
  measurementAttemptKey,
  measurementCellKey,
  parseMeasurementReply,
  selectBoundaryCandidates,
  validateDraftReply,
  type FailureKind,
  type MeasurementCell,
} from "../lib/measurement/gmail-drafting-capacity";

type Phase = "screening" | "boundary" | "step_down_probe" | "step_down_confirmation";
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
  fidelitySignals?: {
    hasThankSignal: boolean;
    hasDeclineSignal: boolean;
    hasForbiddenDetail: boolean;
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

async function loadStepDownProbe(path: string): Promise<{ plan: MeasurementCell[]; sourceReportDigest: string }> {
  const content = await readFile(path, "utf8");
  const parsed = JSON.parse(content) as { phase?: string; results?: ResultRow[] };
  if (parsed.phase !== "boundary" || !Array.isArray(parsed.results)) throw new Error("step-down probe requires a valid boundary report");
  return { plan: buildStepDownProbePlan(parsed.results), sourceReportDigest: createHash("sha256").update(content).digest("hex") };
}

async function loadStepDownConfirmation(path: string): Promise<{
  retained: ResultRow[];
  tasks: Array<{ cell: MeasurementCell; attempt: number }>;
  sourceReportDigest: string;
}> {
  const content = await readFile(path, "utf8");
  const parsed = JSON.parse(content) as ScreeningReport;
  if (parsed.schemaVersion !== MEASUREMENT_SCHEMA_VERSION || parsed.phase !== "step_down_probe" || !Array.isArray(parsed.results)
    || parsed.source?.purpose !== "step_down_probe" || parsed.progress?.status !== "completed" || parsed.progress.remaining !== 0) {
    throw new Error("step-down confirmation requires a compatible probe report");
  }
  if (parsed.model !== CLAUDE_MODEL || parsed.maxOutputTokens !== CLAUDE_MAX_TOKENS || parsed.timeoutMs !== CLAUDE_TIMEOUT_MS) {
    throw new Error("probe report model configuration does not match the current measurement contract");
  }
  return {
    retained: parsed.results,
    tasks: buildStepDownConfirmationPlan(parsed.results),
    sourceReportDigest: createHash("sha256").update(content).digest("hex"),
  };
}

interface ScreeningReport {
  schemaVersion?: number;
  phase?: string;
  model?: string;
  maxOutputTokens?: number;
  timeoutMs?: number;
  results?: ResultRow[];
  source?: { sourceReportDigest?: string; purpose?: string };
  progress?: { status?: string; completed?: number; remaining?: number };
}

interface ResumeState {
  retained: ResultRow[];
  retryTasks: Array<{ cell: MeasurementCell; attempt: number }>;
  orderedKeys: string[];
  sourceReportDigest: string;
  retryFailureKind: "provider_rejection" | "fidelity_failure";
  replacedFailures: number;
  totalResults: number;
  keyFor: (row: MeasurementCell & { attempt: number }) => string;
}

async function loadResume(path: string, phase: Phase): Promise<ResumeState> {
  const content = await readFile(path, "utf8");
  const parsed = JSON.parse(content) as ScreeningReport;
  if (parsed.schemaVersion !== MEASUREMENT_SCHEMA_VERSION || parsed.phase !== phase) {
    throw new Error(`resume requires a compatible ${phase} report`);
  }
  if (parsed.model !== CLAUDE_MODEL || parsed.maxOutputTokens !== CLAUDE_MAX_TOKENS || parsed.timeoutMs !== CLAUDE_TIMEOUT_MS) {
    throw new Error("resume report model configuration does not match the current measurement contract");
  }
  if (!Array.isArray(parsed.results)) throw new Error("resume report results are missing");
  const retryFailureKind = (argument("--retry-failure") ?? "provider_rejection") as "provider_rejection" | "fidelity_failure";
  if (retryFailureKind !== "provider_rejection" && retryFailureKind !== "fidelity_failure") {
    throw new Error("--retry-failure must be provider_rejection or fidelity_failure");
  }
  if (phase === "boundary" && retryFailureKind !== "provider_rejection") {
    throw new Error("boundary resume currently retries only provider_rejection attempts");
  }
  const keyFor = phase === "boundary" ? measurementAttemptKey : measurementCellKey;
  let retained: ResultRow[];
  let retryTasks: Array<{ cell: MeasurementCell; attempt: number }>;
  if (phase === "boundary") {
    const boundaryResume = buildBoundaryProviderRejectionResumePlan(parsed.results);
    retained = boundaryResume.retained;
    retryTasks = boundaryResume.retry.map(row => ({
      cell: { fixtureKind: row.fixtureKind, targetCharacters: row.targetCharacters, historyKind: row.historyKind },
      attempt: row.attempt,
    }));
  } else {
    const screeningResume = retryFailureKind === "provider_rejection"
      ? buildProviderRejectionResumePlan(parsed.results)
      : buildFailureResumePlan(parsed.results, retryFailureKind);
    retained = screeningResume.retained;
    retryTasks = screeningResume.retry.map(cell => {
        const prior = parsed.results?.find(row => measurementCellKey(row) === measurementCellKey(cell));
        if (!prior) throw new Error("resume source row is missing");
        return { cell, attempt: prior.attempt + 1 };
      });
  }
  return {
    retained,
    retryTasks,
    orderedKeys: parsed.results.map(keyFor),
    sourceReportDigest: createHash("sha256").update(content).digest("hex"),
    retryFailureKind,
    replacedFailures: retryTasks.length,
    totalResults: parsed.results.length,
    keyFor,
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
    const parsedObject = parsed.value as { draft?: unknown };
    const fidelitySignals = typeof parsedObject?.draft === "string" ? assessDraftFidelity(parsedObject.draft) : undefined;
    if (!fidelity.ok) return { ...base, elapsedMs, status: "failed", failureKind: "fidelity_failure", detail: fidelity.detail, stopReason: response.stop_reason, usage: usage(response.usage), responseFormat: parsed.format, responseDiagnostics, ...(fidelitySignals ? { fidelitySignals } : {}) };
    return { ...base, elapsedMs, status: "passed", stopReason: response.stop_reason, usage: usage(response.usage), responseFormat: parsed.format, responseDiagnostics, ...(fidelitySignals ? { fidelitySignals } : {}) };
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
    retryFailureKind: "provider_rejection" | "fidelity_failure";
    replacedFailures: number;
  };
  source?: {
    sourceReportDigest: string;
    purpose: "step_down_probe" | "step_down_confirmation";
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
    ...(metadata.source ? { source: metadata.source } : {}),
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
  if (!["screening", "boundary", "step_down_probe", "step_down_confirmation"].includes(phase)) {
    throw new Error("--phase must be screening, boundary, step_down_probe, or step_down_confirmation");
  }
  const resumePathArgument = argument("--resume-report");
  const resumePath = resumePathArgument ? resolve(resumePathArgument) : undefined;
  if (resumePath && phase !== "screening" && phase !== "boundary") throw new Error("--resume-report is supported only for screening or boundary");
  const resume = resumePath ? await loadResume(resumePath, phase as "screening" | "boundary") : undefined;
  let plan: MeasurementCell[] = [];
  let tasks: Array<{ cell: MeasurementCell; attempt: number }> = [];
  let initialResults: ResultRow[] = [];
  let source: ReportMetadata["source"];
  let attempts: number | string = 1;
  if (phase === "screening") {
    plan = buildScreeningPlan();
    tasks = resume?.retryTasks ?? plan.map(cell => ({ cell, attempt: 1 }));
  } else if (phase === "boundary") {
    attempts = 5;
    plan = resume ? [] : await loadBoundaryPlan(resolve(argument("--screening-report") ?? (() => { throw new Error("--screening-report is required for boundary phase"); })()));
    tasks = resume?.retryTasks ?? plan.flatMap(cell => Array.from({ length: 5 }, (_, index) => ({ cell, attempt: index + 1 })));
  } else if (phase === "step_down_probe") {
    const loaded = await loadStepDownProbe(resolve(argument("--boundary-report") ?? (() => { throw new Error("--boundary-report is required for step_down_probe"); })()));
    plan = loaded.plan;
    tasks = plan.map(cell => ({ cell, attempt: 1 }));
    source = { sourceReportDigest: loaded.sourceReportDigest, purpose: "step_down_probe" };
  } else {
    const loaded = await loadStepDownConfirmation(resolve(argument("--probe-report") ?? (() => { throw new Error("--probe-report is required for step_down_confirmation"); })()));
    initialResults = loaded.retained;
    tasks = loaded.tasks;
    attempts = "four additional attempts for successful probes only";
    source = { sourceReportDigest: loaded.sourceReportDigest, purpose: "step_down_confirmation" };
  }

  if (!process.argv.includes("--run")) {
    console.log(JSON.stringify({
      mode: "plan-only",
      phase,
      resume: Boolean(resume),
      retainedResults: resume?.retained.length ?? initialResults.length,
      cells: new Set(tasks.map(task => measurementCellKey(task.cell))).size,
      attemptsPerCell: resume ? "selected rejected attempts only" : attempts,
      projectedCalls: tasks.length,
      plan: tasks.map(task => ({ ...task.cell, attempt: task.attempt })),
    }, null, 2));
    return;
  }
  if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is required with --run");
  const output = resolve(argument("--output") ?? `data/capacity-measurements/gmail-drafting-${phase}-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  if (resumePath && output === resumePath) throw new Error("resume output must not overwrite the source report");
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: CLAUDE_TIMEOUT_MS, maxRetries: 0 });
  const systemPrompt = await buildSpecialistPrompt();
  const resultByKey = new Map((resume?.retained ?? []).map(row => [resume?.keyFor(row) ?? measurementCellKey(row), row]));
  const results: ResultRow[] = [...initialResults];
  const reportResults = () => resume
    ? resume.orderedKeys.map(key => resultByKey.get(key)).filter((row): row is ResultRow => Boolean(row))
    : results;
  const metadata = {
    generatedAt: new Date().toISOString(),
    phase,
    projectedCalls: resume?.totalResults ?? initialResults.length + tasks.length,
    ...(resume ? { resume: { sourceReportDigest: resume.sourceReportDigest, retryFailureKind: resume.retryFailureKind, replacedFailures: resume.replacedFailures } } : {}),
    ...(source ? { source } : {}),
  };
  let interrupted = false;
  process.once("SIGINT", () => {
    interrupted = true;
    console.log("\nInterrupt requested; preserving the latest completed checkpoint.");
  });
  await writeMeasurementCheckpoint(output, buildReport(metadata, reportResults(), false), true);
  for (const task of tasks) {
    if (interrupted) break;
    const row = await measure(client, systemPrompt, task.cell, task.attempt);
    if (resume) resultByKey.set(resume.keyFor(row), row);
    else results.push(row);
    console.log(`${row.status.toUpperCase()} ${task.cell.fixtureKind} ${task.cell.targetCharacters} ${task.cell.historyKind} attempt ${row.attempt}${row.failureKind ? ` (${row.failureKind})` : ""}`);
    await writeMeasurementCheckpoint(output, buildReport(metadata, reportResults(), interrupted));
  }
  await writeMeasurementCheckpoint(output, buildReport(metadata, reportResults(), interrupted));
  console.log(`${interrupted ? "Preserved partial" : "Wrote complete"} report at ${output}`);
  if (interrupted) process.exitCode = 130;
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
