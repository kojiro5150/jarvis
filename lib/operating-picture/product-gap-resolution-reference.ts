import { randomUUID } from "node:crypto";

export type ProductGapResolutionCandidate = Readonly<{
  recordId: string;
  versionId: string;
  statement: string;
}>;

export type ProductGapResolutionTarget = Readonly<{
  recordId: string;
  versionId: string;
}>;

export type ProductGapResolutionListReference = string & Readonly<{
  readonly __productGapResolutionListReference: unique symbol;
}>;

export type ProductGapResolutionTargetReference = string & Readonly<{
  readonly __productGapResolutionTargetReference: unique symbol;
}>;

type ListEntry = Readonly<{
  kind: "active" | "history";
  candidates: readonly ProductGapResolutionCandidate[];
  expiresAt: number;
  nextReference: string | null;
}>;

type TargetEntry = Readonly<{
  target: ProductGapResolutionTarget;
  expiresAt: number;
}>;

const TTL_MS = 15 * 60 * 1000;
const listReferences = new Map<string, ListEntry>();
const targetReferences = new Map<string, TargetEntry>();

const ORDINAL_WORDS = Object.freeze({
  first: 1,
  second: 2,
  third: 3,
  fourth: 4,
  fifth: 5,
  sixth: 6,
  seventh: 7,
  eighth: 8,
  ninth: 9,
  tenth: 10,
} as const);

function normalized(value: string): string {
  return value.normalize("NFKC").replace(/\s+/g, " ").trim();
}

function opaqueReference(): string {
  return randomUUID();
}

function validCandidates(candidates: readonly ProductGapResolutionCandidate[]): boolean {
  return candidates.length > 0
    && candidates.length <= 10_000
    && candidates.every(candidate =>
      candidate.recordId.length > 0
      && candidate.versionId.length > 0
      && candidate.statement.length > 0
    );
}

export function createProductGapResolutionListReference(input: Readonly<{
  candidates: readonly ProductGapResolutionCandidate[];
  now: Date;
  kind?: "active" | "history";
}>): ProductGapResolutionListReference | null {
  if (!Number.isFinite(input.now.getTime()) || !validCandidates(input.candidates)) return null;
  let nextReference: string | null = null;
  for (let offset = Math.floor((input.candidates.length - 1) / 10) * 10; offset >= 0; offset -= 10) {
    const reference = opaqueReference();
    listReferences.set(reference, Object.freeze({
      kind: input.kind ?? "active",
      candidates: Object.freeze(input.candidates.slice(offset, offset + 10).map(candidate => Object.freeze({ ...candidate }))),
      expiresAt: input.now.getTime() + TTL_MS,
      nextReference,
    }));
    nextReference = reference;
  }
  return nextReference as ProductGapResolutionListReference;
}

export function resolveProductGapResolutionListReference(input: Readonly<{
  reference: unknown;
  ordinal: number;
  now: Date;
}>): ProductGapResolutionCandidate | null {
  if (typeof input.reference !== "string" || !Number.isInteger(input.ordinal)) return null;
  const entry = listReferences.get(input.reference);
  if (!entry) return null;
  if (entry.kind !== "active") return null;
  if (!Number.isFinite(input.now.getTime()) || input.now.getTime() > entry.expiresAt) {
    listReferences.delete(input.reference);
    return null;
  }
  const candidate = entry.candidates[input.ordinal - 1];
  if (!candidate) return null;
  listReferences.delete(input.reference);
  return Object.freeze({ ...candidate });
}

export function advanceProductGapResolutionListReference(input: Readonly<{
  reference: unknown;
  now: Date;
  kind?: "active" | "history";
}>): Readonly<{
  reference: ProductGapResolutionListReference;
  candidates: readonly ProductGapResolutionCandidate[];
  hasMore: boolean;
}> | null {
  if (typeof input.reference !== "string") return null;
  const entry = listReferences.get(input.reference);
  if (!entry) return null;
  if (entry.kind !== (input.kind ?? "active")) return null;
  listReferences.delete(input.reference);
  if (!Number.isFinite(input.now.getTime()) || input.now.getTime() > entry.expiresAt || !entry.nextReference) return null;
  const next = listReferences.get(entry.nextReference);
  if (!next || next.kind !== entry.kind || input.now.getTime() > next.expiresAt) return null;
  return Object.freeze({
    reference: entry.nextReference as ProductGapResolutionListReference,
    candidates: Object.freeze(next.candidates.map(candidate => Object.freeze({ ...candidate }))),
    hasMore: next.nextReference !== null,
  });
}

export function createProductGapResolutionTargetReference(input: Readonly<{
  target: ProductGapResolutionTarget;
  now: Date;
}>): ProductGapResolutionTargetReference | null {
  if (!Number.isFinite(input.now.getTime())
    || input.target.recordId.length === 0
    || input.target.versionId.length === 0) return null;
  const reference = opaqueReference();
  targetReferences.set(reference, Object.freeze({
    target: Object.freeze({ ...input.target }),
    expiresAt: input.now.getTime() + TTL_MS,
  }));
  return reference as ProductGapResolutionTargetReference;
}

export function consumeProductGapResolutionTargetReference(input: Readonly<{
  reference: unknown;
  now: Date;
}>): ProductGapResolutionTarget | null {
  if (typeof input.reference !== "string") return null;
  const entry = targetReferences.get(input.reference);
  if (!entry) return null;
  targetReferences.delete(input.reference);
  if (!Number.isFinite(input.now.getTime()) || input.now.getTime() > entry.expiresAt) return null;
  return Object.freeze({ ...entry.target });
}

export function discardProductGapResolutionTargetReference(reference: unknown): void {
  if (typeof reference === "string") targetReferences.delete(reference);
}

export function parseProductGapResolutionSelection(utterance: string): number | null {
  const value = normalized(utterance);
  const numeric = value.match(/^select product gap (10|[1-9]) for resolution[.!?]*$/i);
  if (numeric) return Number(numeric[1]);
  const word = value.match(/^select the (first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth) product gap for resolution[.!?]*$/i);
  if (!word) return null;
  return ORDINAL_WORDS[word[1].toLowerCase() as keyof typeof ORDINAL_WORDS] ?? null;
}

export function parseProductGapResolutionWriteIntent(utterance: string): boolean {
  const value = normalized(utterance);
  return /^(?:mark this product gap as resolved|resolve this product gap)[.!?]*$/i.test(value);
}

export const PRODUCT_GAP_RESOLUTION_REFERENCE_TTL_MS = TTL_MS;
