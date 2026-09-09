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

export interface MeasurementOutcome {
  status: "passed" | "failed";
  failureKind?: FailureKind;
  detail?: string;
}

const FIXTURE_SIZES: Record<FixtureKind, number[]> = {
  plain_text: [8_000, 16_000, 32_000, 48_000, 64_000],
  forwarded_chain: [14_000, 24_000, 40_000, 60_000],
  html_conversion: [16_000, 32_000, 48_000, 64_000],
  raman_shaped: [14_000, 24_000, 40_000],
  dense_prose: [8_000, 16_000, 24_000, 32_000],
};

export const HISTORY_KINDS: HistoryKind[] = ["empty", "representative_39", "maximum_admissible_39"];

export function buildScreeningPlan(): MeasurementCell[] {
  return Object.entries(FIXTURE_SIZES).flatMap(([fixtureKind, sizes]) =>
    sizes.flatMap(targetCharacters => HISTORY_KINDS.map(historyKind => ({
      fixtureKind: fixtureKind as FixtureKind,
      targetCharacters,
      historyKind,
    }))));
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
  const draft = candidate.draft.toLowerCase();
  if (!/(thank|appreciat)/.test(draft) || !/(declin|unable|won't be accepting|will not be accepting)/.test(draft)) {
    return { ok: false, detail: "draft did not both thank and decline" };
  }
  if (/\blunch\b|\bthursday\b|board approved/.test(draft)) return { ok: false, detail: "draft introduced forbidden fabricated details" };
  return { ok: true, value: candidate as unknown as DraftMeasurementReply };
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
