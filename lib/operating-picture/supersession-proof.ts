import type {
  FactRecord,
  OperatingPictureRecord,
} from "./record-core";
import type {
  ExactExplicitReplacementResolution,
} from "./explicit-replacement-reference";
import {
  sameOperatingPictureRevisionSemantics,
  sameOperatingPictureSubject,
} from "./record-core";

declare const EXPLICIT_REPLACEMENT_DECLARATION: unique symbol;
declare const EXPLICIT_REPLACEMENT_PROOF: unique symbol;
declare const AUTHORITATIVE_SNAPSHOT_PROOF: unique symbol;

/**
 * This type is intentionally constructible only inside this module.
 * A later exact-reference resolver may be added as the sole trusted constructor.
 */
export type ExplicitReplacementDeclaration = Readonly<{
  previousRecordId: string;
  replacementRecordId: string;
  statedAt: string;
  [EXPLICIT_REPLACEMENT_DECLARATION]: "explicit_replacement_declaration";
}>;

export type ExplicitReplacementSupersessionProof = Readonly<{
  basis: "explicit_replacement";
  previousRecordId: string;
  replacementRecordId: string;
  subject: Readonly<{
    namespace: string;
    entity: string;
    attribute: string;
  }>;
  statedAt: string;
  [EXPLICIT_REPLACEMENT_PROOF]: "explicit_replacement_supersession_proof";
}>;

export type AuthoritativeSnapshotSupersessionProof = Readonly<{
  basis: "authoritative_snapshot";
  previousRecordId: string;
  replacementRecordId: string;
  source: string;
  previousObservedAt: string;
  replacementObservedAt: string;
  subject: Readonly<{
    namespace: string;
    entity: string;
    attribute: string;
  }>;
  [AUTHORITATIVE_SNAPSHOT_PROOF]: "authoritative_snapshot_supersession_proof";
}>;

export type SupersessionProof =
  | ExplicitReplacementSupersessionProof
  | AuthoritativeSnapshotSupersessionProof;

export function createExplicitReplacementDeclarationFromExactResolution(
  resolution: ExactExplicitReplacementResolution,
): ExplicitReplacementDeclaration {
  return Object.freeze({
    previousRecordId: resolution.previousRecordId,
    replacementRecordId: resolution.replacementRecordId,
    statedAt: resolution.confirmedAt,
  }) as ExplicitReplacementDeclaration;
}

function parseInstant(value: string): number | null {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Explicit replacement proof requires a separately trusted declaration that
 * names the exact prior record and exact replacement record.
 *
 * This PR intentionally exposes no public constructor for that declaration.
 */
export function proveExplicitReplacementSupersession(
  previous: OperatingPictureRecord,
  replacement: OperatingPictureRecord,
  declaration: ExplicitReplacementDeclaration,
): ExplicitReplacementSupersessionProof | null {
  if (previous.id === replacement.id) return null;
  if (!sameOperatingPictureSubject(previous, replacement)) return null;
  if (!sameOperatingPictureRevisionSemantics(previous, replacement)) return null;
  if (previous.subject.revision !== "explicit_replacement") return null;
  if (declaration.previousRecordId !== previous.id) return null;
  if (declaration.replacementRecordId !== replacement.id) return null;

  return Object.freeze({
    basis: "explicit_replacement",
    previousRecordId: previous.id,
    replacementRecordId: replacement.id,
    subject: Object.freeze({
      namespace: previous.subject.namespace,
      entity: previous.subject.entity,
      attribute: previous.subject.attribute,
    }),
    statedAt: declaration.statedAt,
  }) as ExplicitReplacementSupersessionProof;
}

/**
 * Authoritative snapshot proof is derivable only from trusted fact records.
 *
 * The replacement must be:
 * - the same canonical subject,
 * - governed by the same authoritative_snapshot semantics,
 * - observed from the same trusted source,
 * - strictly newer than the previous observation.
 */
export function proveAuthoritativeSnapshotSupersession<T>(
  previous: FactRecord<T>,
  replacement: FactRecord<T>,
): AuthoritativeSnapshotSupersessionProof | null {
  if (previous.id === replacement.id) return null;
  if (!sameOperatingPictureSubject(previous, replacement)) return null;
  if (!sameOperatingPictureRevisionSemantics(previous, replacement)) return null;
  if (previous.subject.revision !== "authoritative_snapshot") return null;
  if (previous.provenance.source !== replacement.provenance.source) return null;

  const previousObservedAt = parseInstant(previous.provenance.observedAt);
  const replacementObservedAt = parseInstant(replacement.provenance.observedAt);
  if (previousObservedAt === null || replacementObservedAt === null) return null;
  if (replacementObservedAt <= previousObservedAt) return null;

  return Object.freeze({
    basis: "authoritative_snapshot",
    previousRecordId: previous.id,
    replacementRecordId: replacement.id,
    source: previous.provenance.source,
    previousObservedAt: previous.provenance.observedAt,
    replacementObservedAt: replacement.provenance.observedAt,
    subject: Object.freeze({
      namespace: previous.subject.namespace,
      entity: previous.subject.entity,
      attribute: previous.subject.attribute,
    }),
  }) as AuthoritativeSnapshotSupersessionProof;
}
