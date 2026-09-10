import { createHash } from "node:crypto";
import type { ChatMessage } from "@/lib/agents/types";
import { MAX_RETAINED_HISTORY_MESSAGES } from "@/lib/lighter-jarvis/runtime";

export const MEASUREMENT_SCHEMA_VERSION = 1;

export type FixtureKind = "plain_text" | "forwarded_chain" | "html_conversion" | "raman_shaped" | "dense_prose";
export type HistoryKind = "empty" | "representative_39" | "maximum_admissible_39";
export type FailureKind = "client_validation" | "provider_rejection" | "provider_context_limit" | "timeout" | "malformed_response" | "fidelity_failure";

export interface MeasurementCell {
  fixtureKind: FixtureKind;
  targetCharacters: number;
  historyKind: HistoryKind;
}

export interface DraftMeasurementReply {
  sender: string;
  subject: string;
  draft: string;
}

export interface DraftFidelitySignals {
  hasThankSignal: boolean;
  hasDeclineSignal: boolean;
  hasForbiddenDetail: boolean;
}

export interface MeasurementOutcome {
  status: "passed" | "failed";
  failureKind?: FailureKind;
  detail?: string;
}

export type ScreeningResult = MeasurementCell & MeasurementOutcome & { attempt: number };

export function selectLowestCostFidelityFailure<T extends ScreeningResult & { usage?: { inputTokens?: number } }>(rows: T[]): MeasurementCell {
  const failures = rows
    .filter(row => row.failureKind === "fidelity_failure")
    .sort((a, b) => (a.usage?.inputTokens ?? Number.MAX_SAFE_INTEGER) - (b.usage?.inputTokens ?? Number.MAX_SAFE_INTEGER));
  const selected = failures[0];
  if (!selected) throw new Error("diagnostic source report contains no fidelity failures");
  return { fixtureKind: selected.fixtureKind, targetCharacters: selected.targetCharacters, historyKind: selected.historyKind };
}

export interface ResponseDiagnostics {
  responseCharacters: number;
  contentBlockTypes: string[];
  textBlockCount: number;
}

export interface MeasurementReportProgress {
  status: "running" | "completed" | "interrupted";
  completed: number;
  remaining: number;
  interrupted: boolean;
}

const FIXTURE_SIZES: Record<FixtureKind, number[]> = {
  plain_text: [8_000, 16_000, 32_000, 48_000, 64_000],
  forwarded_chain: [14_000, 24_000, 40_000, 60_000],
  html_conversion: [16_000, 32_000, 48_000, 64_000],
  raman_shaped: [14_000, 24_000, 40_000],
  dense_prose: [8_000, 16_000, 24_000, 32_000],
};

const BOUNDARY_ATTEMPTS_PER_CELL = 5;
const BOUNDARY_CELL_COUNT = 16;

export const HISTORY_KINDS: HistoryKind[] = ["empty", "representative_39", "maximum_admissible_39"];

export function buildScreeningPlan(): MeasurementCell[] {
  return Object.entries(FIXTURE_SIZES).flatMap(([fixtureKind, sizes]) =>
    sizes.flatMap(targetCharacters => HISTORY_KINDS.map(historyKind => ({
      fixtureKind: fixtureKind as FixtureKind,
      targetCharacters,
      historyKind,
    }))));
}

export function measurementCellKey(cell: MeasurementCell): string {
  return `${cell.fixtureKind}:${cell.targetCharacters}:${cell.historyKind}`;
}

export function buildFailureResumePlan<T extends ScreeningResult>(rows: T[], failureKind: "provider_rejection" | "fidelity_failure"): {
  retained: T[];
  retry: MeasurementCell[];
} {
  const expected = buildScreeningPlan();
  const expectedKeys = new Set(expected.map(measurementCellKey));
  if (rows.length !== expected.length) throw new Error(`resume report must contain exactly ${expected.length} screening results`);
  const actualKeys = rows.map(measurementCellKey);
  if (new Set(actualKeys).size !== actualKeys.length || actualKeys.some(key => !expectedKeys.has(key))) {
    throw new Error("resume report does not contain the exact screening matrix");
  }
  const retryKeys = new Set(rows.filter(row => row.failureKind === failureKind).map(measurementCellKey));
  if (retryKeys.size === 0) throw new Error(`resume report contains no ${failureKind} results to retry`);
  return {
    retained: rows.filter(row => !retryKeys.has(measurementCellKey(row))),
    retry: expected.filter(cell => retryKeys.has(measurementCellKey(cell))),
  };
}

export function buildProviderRejectionResumePlan<T extends ScreeningResult>(rows: T[]) {
  return buildFailureResumePlan(rows, "provider_rejection");
}

export function measurementAttemptKey(row: MeasurementCell & { attempt: number }): string {
  return `${measurementCellKey(row)}:${row.attempt}`;
}

function validateBoundaryMatrix<T extends ScreeningResult>(rows: T[]): Map<string, T[]> {
  if (rows.length !== BOUNDARY_CELL_COUNT * BOUNDARY_ATTEMPTS_PER_CELL) {
    throw new Error(`boundary report must contain exactly ${BOUNDARY_CELL_COUNT * BOUNDARY_ATTEMPTS_PER_CELL} results`);
  }
  const screeningKeys = new Set(buildScreeningPlan().map(measurementCellKey));
  const attemptKeys = rows.map(measurementAttemptKey);
  if (new Set(attemptKeys).size !== attemptKeys.length || rows.some(row => !screeningKeys.has(measurementCellKey(row)))) {
    throw new Error("boundary report contains duplicate or invalid attempts");
  }
  const groups = new Map<string, T[]>();
  for (const row of rows) groups.set(measurementCellKey(row), [...(groups.get(measurementCellKey(row)) ?? []), row]);
  if (groups.size !== BOUNDARY_CELL_COUNT || [...groups.values()].some(group => {
    const attempts = group.map(row => row.attempt).sort((a, b) => a - b);
    return attempts.join(",") !== "1,2,3,4,5";
  })) {
    throw new Error("boundary report must contain attempts 1 through 5 for exactly 16 cells");
  }
  return groups;
}

export function buildStepDownProbePlan<T extends ScreeningResult>(rows: T[]): MeasurementCell[] {
  const groups = validateBoundaryMatrix(rows);
  if (rows.some(row => row.failureKind === "provider_rejection")) {
    throw new Error("step-down probe requires boundary evidence with no provider rejections");
  }
  const selected = new Map<string, MeasurementCell>();
  for (const group of groups.values()) {
    if (group.every(row => row.status === "passed")) continue;
    const current = group[0];
    const sizes = FIXTURE_SIZES[current.fixtureKind];
    const lower = [...sizes].filter(size => size < current.targetCharacters).at(-1);
    if (!lower) throw new Error(`no lower configured size exists for ${measurementCellKey(current)}`);
    const candidate = { fixtureKind: current.fixtureKind, targetCharacters: lower, historyKind: current.historyKind };
    selected.set(measurementCellKey(candidate), candidate);
  }
  if (selected.size === 0) throw new Error("boundary report contains no inconsistent cells to step down");
  return [...selected.values()];
}

export function buildStepDownConfirmationPlan<T extends ScreeningResult>(rows: T[]): Array<{ cell: MeasurementCell; attempt: number }> {
  if (rows.length === 0) throw new Error("step-down confirmation requires probe results");
  const keys = rows.map(measurementAttemptKey);
  const screeningKeys = new Set(buildScreeningPlan().map(measurementCellKey));
  if (new Set(keys).size !== keys.length || rows.some(row => row.attempt !== 1 || !screeningKeys.has(measurementCellKey(row)))) {
    throw new Error("step-down probe report must contain one unique attempt 1 per cell");
  }
  return rows.filter(row => row.status === "passed").flatMap(row =>
    [2, 3, 4, 5].map(attempt => ({
      cell: { fixtureKind: row.fixtureKind, targetCharacters: row.targetCharacters, historyKind: row.historyKind },
      attempt,
    })));
}

export function buildBoundaryProviderRejectionResumePlan<T extends ScreeningResult>(rows: T[]): {
  retained: T[];
  retry: T[];
} {
  validateBoundaryMatrix(rows);
  const retry = rows.filter(row => row.failureKind === "provider_rejection");
  if (retry.length === 0) throw new Error("boundary resume report contains no provider_rejection results to retry");
  return {
    retained: rows.filter(row => row.failureKind !== "provider_rejection"),
    retry,
  };
}

function repeatToLength(seed: string, targetCharacters: number): string {
  if (!Number.isInteger(targetCharacters) || targetCharacters < seed.length) {
    throw new Error("targetCharacters must be an integer at least as large as the fixture seed");
  }
  return seed.repeat(Math.ceil(targetCharacters / seed.length)).slice(0, targetCharacters);
}

const FIXTURE_SEEDS: Record<FixtureKind, string> = {
  plain_text: "Synthetic private email evidence. Raman Bhola sent a LinkedIn connection invitation. The requested reply should thank Raman and politely decline the invitation. ",
  forwarded_chain: "----- Forwarded message -----\nFrom: Synthetic Colleague <fixture@example.invalid>\nDate: Monday\nSubject: Prior context\nQuoted history remains synthetic and repeats realistic forwarding structure.\n\n",
  html_conversion: "Synthetic HTML-to-text email\nNavigation | View online | Privacy\nRaman Bhola invited Sam to connect on LinkedIn. &amp; formatting artifacts and signature text follow.\n---\n",
  raman_shaped: "From: Raman Bhola <raman@example.invalid>\nSubject: LinkedIn connection invitation\nSynthetic evidence: Raman invited Sam to connect professionally. Draft instruction: thank Raman for the invitation and politely decline. No lunch or Thursday meeting exists.\n\n",
  dense_prose: "This synthetic dense-prose evidence contains continuous professional correspondence, contextual qualifications, recommendations, and deliberately varied language while preserving one ground truth: Raman Bhola sent a LinkedIn connection invitation that should be thanked and politely declined. ",
};

export function buildFixture(kind: FixtureKind, targetCharacters: number): string {
  return repeatToLength(FIXTURE_SEEDS[kind], targetCharacters);
}

function historyMessage(index: number, length: number): ChatMessage {
  const prefix = `Synthetic retained history message ${index + 1}. `;
  return {
    role: index % 2 === 0 ? "user" : "assistant",
    content: repeatToLength(prefix + "No private data. Deterministic measurement padding. ", length),
  };
}

export function buildHistory(kind: HistoryKind): ChatMessage[] {
  if (kind === "empty") return [];
  const length = kind === "representative_39" ? 750 : 7_999;
  return Array.from({ length: MAX_RETAINED_HISTORY_MESSAGES }, (_, index) => historyMessage(index, length));
}

export function fixtureDigest(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

export function buildMeasurementInstruction(fixture: string): string {
  return `CURRENT-TURN GOVERNED GMAIL EVIDENCE (SYNTHETIC CAPACITY MEASUREMENT ONLY)\n${fixture}\nEND GOVERNED EVIDENCE\n\nReturn JSON only with exactly these string fields: sender, subject, draft. The sender must be Raman Bhola. The subject must be LinkedIn connection invitation. The draft must thank Raman for the invitation and politely decline. Never invent a lunch, Thursday meeting, or other invitation.`;
}

export function validateDraftReply(value: unknown): { ok: true; value: DraftMeasurementReply } | { ok: false; detail: string } {
  if (!value || typeof value !== "object") return { ok: false, detail: "response is not an object" };
  const candidate = value as Record<string, unknown>;
  if (Object.keys(candidate).sort().join(",") !== "draft,sender,subject") return { ok: false, detail: "response does not contain exactly the required fields" };
  if (candidate.sender !== "Raman Bhola") return { ok: false, detail: "sender fidelity failed" };
  if (candidate.subject !== "LinkedIn connection invitation") return { ok: false, detail: "subject fidelity failed" };
  if (typeof candidate.draft !== "string") return { ok: false, detail: "draft is not a string" };
  const signals = assessDraftFidelity(candidate.draft);
  if (!signals.hasThankSignal && !signals.hasDeclineSignal) return { ok: false, detail: "draft contained neither a thank signal nor a decline signal" };
  if (!signals.hasThankSignal) return { ok: false, detail: "draft did not contain a thank signal" };
  if (!signals.hasDeclineSignal) return { ok: false, detail: "draft did not contain a decline signal" };
  if (signals.hasForbiddenDetail) return { ok: false, detail: "draft introduced forbidden fabricated details" };
  return { ok: true, value: candidate as unknown as DraftMeasurementReply };
}

export function assessDraftFidelity(draft: string): DraftFidelitySignals {
  const normalized = draft.toLowerCase().replace(/[’]/g, "'");
  return {
    hasThankSignal: /\bthank|\bappreciat|\bgrateful/.test(normalized),
    hasDeclineSignal: /\bdeclin|\bunable\b|\b(?:cannot|can't|not able to)\s+(?:accept|take you up|participate|join|connect)|\b(?:won't|will not)\s+(?:be able to\s+)?(?:accept|take you up|participate|join|connect)|\b(?:have|need|must) to pass\b|\bpass on\b/.test(normalized),
    hasForbiddenDetail: /\blunch\b|\bthursday\b|board approved/.test(normalized),
  };
}

/** Accepts raw JSON or one complete JSON code fence, never JSON embedded in prose. */
export function parseMeasurementReply(text: string): { ok: true; value: unknown; format: "raw_json" | "json_fence" } | { ok: false; detail: string } {
  const trimmed = text.trim();
  let candidate = trimmed;
  let format: "raw_json" | "json_fence" = "raw_json";
  if (trimmed.startsWith("```")) {
    const match = trimmed.match(/^```json\s*\n([\s\S]*?)\n```$/i);
    if (!match) return { ok: false, detail: "response was not raw JSON or one complete JSON code fence" };
    candidate = match[1].trim();
    format = "json_fence";
  }
  try {
    return { ok: true, value: JSON.parse(candidate), format };
  } catch {
    return { ok: false, detail: "response was not valid JSON" };
  }
}

export function buildReportProgress(completed: number, total: number, interrupted: boolean): MeasurementReportProgress {
  if (!Number.isInteger(completed) || !Number.isInteger(total) || completed < 0 || total < 0 || completed > total) {
    throw new Error("invalid report progress");
  }
  return {
    status: interrupted ? "interrupted" : completed === total ? "completed" : "running",
    completed,
    remaining: total - completed,
    interrupted,
  };
}

export function selectBoundaryCandidates(rows: Array<MeasurementCell & MeasurementOutcome>): MeasurementCell[] {
  const groups = new Map<string, Array<MeasurementCell & MeasurementOutcome>>();
  for (const row of rows) {
    const key = `${row.fixtureKind}:${row.historyKind}`;
    groups.set(key, [...(groups.get(key) ?? []), row]);
  }
  const selected: MeasurementCell[] = [];
  for (const group of groups.values()) {
    const ordered = [...group].sort((a, b) => a.targetCharacters - b.targetCharacters);
    const passes = ordered.filter(row => row.status === "passed");
    const failures = ordered.filter(row => row.status === "failed");
    const candidates = [passes.at(-1), failures[0]].filter((row): row is MeasurementCell & MeasurementOutcome => Boolean(row));
    for (const row of candidates) {
      if (!selected.some(candidate => candidate.fixtureKind === row.fixtureKind && candidate.historyKind === row.historyKind && candidate.targetCharacters === row.targetCharacters)) {
        selected.push({ fixtureKind: row.fixtureKind, targetCharacters: row.targetCharacters, historyKind: row.historyKind });
      }
    }
  }
  return selected;
}
