import { randomUUID } from "node:crypto";

import type { ProductGapResolutionCandidate } from "./product-gap-resolution-reference";

export type ProductGapSupersessionReference = string & Readonly<{
  readonly __productGapSupersessionReference: unique symbol;
}>;

export type ProductGapSupersessionTarget = Readonly<{ recordId: string; versionId: string }>;
export type ProductGapSupersessionPair = Readonly<{
  target: ProductGapSupersessionTarget;
  successor: ProductGapSupersessionTarget;
}>;

type Entry =
  | Readonly<{ stage: "target"; candidates: readonly ProductGapResolutionCandidate[]; offset: number; expiresAt: number }>
  | Readonly<{ stage: "successor"; target: ProductGapSupersessionTarget; candidates: readonly ProductGapResolutionCandidate[]; offset: number; expiresAt: number }>
  | Readonly<{ stage: "ready"; pair: ProductGapSupersessionPair; expiresAt: number }>;

const TTL_MS = 15 * 60 * 1000;
const references = new Map<string, Entry>();
const ORDINALS = Object.freeze({ first: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6, seventh: 7, eighth: 8, ninth: 9, tenth: 10 } as const);

function validNow(now: Date): boolean { return Number.isFinite(now.getTime()); }
function normalized(value: string): string { return value.normalize("NFKC").replace(/\s+/g, " ").trim(); }
function page(candidates: readonly ProductGapResolutionCandidate[], offset: number) { return Object.freeze(candidates.slice(offset, offset + 10)); }
function create(entry: Entry): ProductGapSupersessionReference {
  const reference = randomUUID();
  references.set(reference, entry);
  return reference as ProductGapSupersessionReference;
}
function live(reference: unknown, now: Date): [string, Entry] | null {
  if (typeof reference !== "string" || !validNow(now)) return null;
  const entry = references.get(reference);
  if (!entry) return null;
  if (now.getTime() > entry.expiresAt) { references.delete(reference); return null; }
  return [reference, entry];
}

export function createProductGapSupersessionReference(input: Readonly<{
  candidates: readonly ProductGapResolutionCandidate[];
  now: Date;
}>): Readonly<{ reference: ProductGapSupersessionReference; page: readonly ProductGapResolutionCandidate[]; hasMore: boolean }> | null {
  if (!validNow(input.now) || input.candidates.length === 0) return null;
  const candidates = Object.freeze(input.candidates.map(candidate => Object.freeze({ ...candidate })));
  const reference = create(Object.freeze({ stage: "target", candidates, offset: 0, expiresAt: input.now.getTime() + TTL_MS }));
  return Object.freeze({ reference, page: page(candidates, 0), hasMore: candidates.length > 10 });
}

export function advanceProductGapSupersessionReference(input: Readonly<{ reference: unknown; now: Date }>): Readonly<{
  reference: ProductGapSupersessionReference;
  stage: "target" | "successor";
  page: readonly ProductGapResolutionCandidate[];
  hasMore: boolean;
}> | null {
  const found = live(input.reference, input.now);
  if (!found) return null;
  const [reference, entry] = found;
  if (entry.stage === "ready") return null;
  const offset = entry.offset + 10;
  if (offset >= entry.candidates.length) return null;
  references.delete(reference);
  const next = Object.freeze({ ...entry, offset });
  const nextReference = create(next);
  return Object.freeze({ reference: nextReference, stage: entry.stage, page: page(entry.candidates, offset), hasMore: offset + 10 < entry.candidates.length });
}

export function selectProductGapSupersessionTarget(input: Readonly<{
  reference: unknown;
  ordinal: number;
  successors: readonly ProductGapResolutionCandidate[];
  now: Date;
}>): Readonly<{ reference: ProductGapSupersessionReference; target: ProductGapResolutionCandidate; page: readonly ProductGapResolutionCandidate[]; hasMore: boolean }> | null {
  const found = live(input.reference, input.now);
  if (!found) return null;
  const [reference, entry] = found;
  if (entry.stage !== "target" || !Number.isInteger(input.ordinal)) return null;
  const target = entry.candidates[entry.offset + input.ordinal - 1];
  const successors = input.successors.filter(candidate => candidate.recordId !== target?.recordId);
  if (!target || successors.length === 0) return null;
  references.delete(reference);
  const frozen = Object.freeze(successors.map(candidate => Object.freeze({ ...candidate })));
  const nextReference = create(Object.freeze({
    stage: "successor", target: Object.freeze({ recordId: target.recordId, versionId: target.versionId }),
    candidates: frozen, offset: 0, expiresAt: input.now.getTime() + TTL_MS,
  }));
  return Object.freeze({ reference: nextReference, target, page: page(frozen, 0), hasMore: frozen.length > 10 });
}

export function selectProductGapSupersessionSuccessor(input: Readonly<{ reference: unknown; ordinal: number; now: Date }>): Readonly<{
  reference: ProductGapSupersessionReference;
  successor: ProductGapResolutionCandidate;
}> | null {
  const found = live(input.reference, input.now);
  if (!found) return null;
  const [reference, entry] = found;
  if (entry.stage !== "successor" || !Number.isInteger(input.ordinal)) return null;
  const successor = entry.candidates[entry.offset + input.ordinal - 1];
  if (!successor) return null;
  references.delete(reference);
  const pair = Object.freeze({ target: entry.target, successor: Object.freeze({ recordId: successor.recordId, versionId: successor.versionId }) });
  const nextReference = create(Object.freeze({ stage: "ready", pair, expiresAt: input.now.getTime() + TTL_MS }));
  return Object.freeze({ reference: nextReference, successor });
}

export function consumeProductGapSupersessionPair(input: Readonly<{ reference: unknown; now: Date }>): ProductGapSupersessionPair | null {
  const found = live(input.reference, input.now);
  if (!found) return null;
  const [reference, entry] = found;
  if (entry.stage !== "ready") return null;
  references.delete(reference);
  return entry.pair;
}

export function parseProductGapSupersessionTargetSelection(value: string): number | null {
  const text = normalized(value);
  const numeric = text.match(/^select product gap (10|[1-9]) for supersession[.!?]*$/i);
  if (numeric) return Number(numeric[1]);
  const word = text.match(/^select the (first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth) product gap for supersession[.!?]*$/i);
  return word ? ORDINALS[word[1].toLowerCase() as keyof typeof ORDINALS] : null;
}

export function parseProductGapSupersessionSuccessorSelection(value: string): number | null {
  const text = normalized(value);
  const numeric = text.match(/^select product gap (10|[1-9]) as successor[.!?]*$/i);
  if (numeric) return Number(numeric[1]);
  const word = text.match(/^select the (first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth) product gap as successor[.!?]*$/i);
  return word ? ORDINALS[word[1].toLowerCase() as keyof typeof ORDINALS] : null;
}

export function parseProductGapSupersessionWriteIntent(value: string): boolean {
  return /^mark this product gap as superseded[.!?]*$/i.test(normalized(value));
}

export const PRODUCT_GAP_SUPERSESSION_REFERENCE_TTL_MS = TTL_MS;
