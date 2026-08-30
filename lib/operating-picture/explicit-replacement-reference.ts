import { randomUUID } from "node:crypto";

import {
  getOperatingPictureHeadVersion,
  getOperatingPictureVersion,
} from "./server-store";

declare const EXACT_EXPLICIT_REPLACEMENT_RESOLUTION: unique symbol;

export type OperatingPictureReplacementReference = Readonly<{
  operatingPictureReplacementReferenceId: string;
}>;

export type ExactExplicitReplacementResolution = Readonly<{
  previousRecordId: string;
  replacementRecordId: string;
  previousVersionId: string;
  replacementVersionId: string;
  confirmedAt: string;
  utterance: string;
  [EXACT_EXPLICIT_REPLACEMENT_RESOLUTION]: "exact_explicit_replacement_resolution";
}>;

type StoredReplacementReference = Readonly<{
  id: string;
  reference: OperatingPictureReplacementReference;
  previousRecordId: string;
  replacementRecordId: string;
  previousVersionId: string;
  replacementVersionId: string;
  status: "active" | "consumed";
}>;

export type OperatingPictureReplacementReferenceResolution =
  | Readonly<{
      status: "confirmed";
      resolution: ExactExplicitReplacementResolution;
      replacementReference: null;
    }>
  | Readonly<{
      status: "ask";
      reason:
        | "not_confirmed"
        | "invalid_reference"
        | "reference_not_found"
        | "already_consumed"
        | "record_head_changed"
        | "record_missing";
      resolution: null;
      replacementReference: OperatingPictureReplacementReference | null;
    }>
  | Readonly<{
      status: "declined";
      resolution: null;
      replacementReference: null;
    }>;

const replacements = new Map<string, StoredReplacementReference>();
const CONFIRM_REPLACEMENT = /^(?:yes|yes,?\s+please|confirm|confirmed|replace|replace\s+it|proceed|go\s+ahead)[.!]?$/i;
const DECLINE_REPLACEMENT = /^(?:no|no,?\s+thanks|decline|cancel|never\s+mind)[.!]?$/i;

function isReference(value: unknown): value is OperatingPictureReplacementReference {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const descriptor = Object.getOwnPropertyDescriptor(value, "operatingPictureReplacementReferenceId");
  return Boolean(
    descriptor
    && "value" in descriptor
    && typeof descriptor.value === "string"
    && descriptor.value.trim().length > 0
  );
}

function consume(stored: StoredReplacementReference): void {
  replacements.set(stored.id, Object.freeze({ ...stored, status: "consumed" }));
}

/**
 * Creates server-owned replacement intent only for two exact, currently stored heads.
 * The returned handle contains no record identity and grants no replacement authority.
 */
export function createOperatingPictureReplacementReference(input: {
  readonly previousVersionId: string;
  readonly replacementVersionId: string;
}): OperatingPictureReplacementReference | null {
  const previous = getOperatingPictureVersion(input.previousVersionId);
  const replacement = getOperatingPictureVersion(input.replacementVersionId);
  if (!previous || !replacement) return null;
  if (previous.versionId === replacement.versionId) return null;
  if (previous.recordId === replacement.recordId) return null;

  const previousHead = getOperatingPictureHeadVersion(previous.recordId);
  const replacementHead = getOperatingPictureHeadVersion(replacement.recordId);
  if (!previousHead || !replacementHead) return null;
  if (previousHead.versionId !== previous.versionId) return null;
  if (replacementHead.versionId !== replacement.versionId) return null;

  if (previous.record.subject.namespace !== replacement.record.subject.namespace) return null;
  if (previous.record.subject.entity !== replacement.record.subject.entity) return null;
  if (previous.record.subject.attribute !== replacement.record.subject.attribute) return null;
  if (previous.record.subject.revision !== "explicit_replacement") return null;
  if (replacement.record.subject.revision !== "explicit_replacement") return null;

  const id = randomUUID();
  const reference = Object.freeze({ operatingPictureReplacementReferenceId: id });
  replacements.set(id, Object.freeze({
    id,
    reference,
    previousRecordId: previous.recordId,
    replacementRecordId: replacement.recordId,
    previousVersionId: previous.versionId,
    replacementVersionId: replacement.versionId,
    status: "active",
  }));
  return reference;
}

/**
 * Resolves only against server-owned stored identities and the current user utterance.
 * If either referenced record head changes, the intent is stale and cannot confirm.
 */
export function resolveOperatingPictureReplacementReference(input: {
  readonly replacementReference?: unknown;
  readonly currentUserUtterance: string;
  readonly confirmedAt: string;
}): OperatingPictureReplacementReferenceResolution {
  const supplied = input.replacementReference;
  if (!isReference(supplied)) {
    return Object.freeze({
      status: "ask",
      reason: "invalid_reference",
      resolution: null,
      replacementReference: null,
    });
  }

  const stored = replacements.get(supplied.operatingPictureReplacementReferenceId);
  if (!stored) {
    return Object.freeze({
      status: "ask",
      reason: "reference_not_found",
      resolution: null,
      replacementReference: null,
    });
  }
  if (stored.status === "consumed") {
    return Object.freeze({
      status: "ask",
      reason: "already_consumed",
      resolution: null,
      replacementReference: null,
    });
  }

  const previous = getOperatingPictureVersion(stored.previousVersionId);
  const replacement = getOperatingPictureVersion(stored.replacementVersionId);
  if (!previous || !replacement) {
    consume(stored);
    return Object.freeze({
      status: "ask",
      reason: "record_missing",
      resolution: null,
      replacementReference: null,
    });
  }

  const previousHead = getOperatingPictureHeadVersion(stored.previousRecordId);
  const replacementHead = getOperatingPictureHeadVersion(stored.replacementRecordId);
  if (
    !previousHead
    || !replacementHead
    || previousHead.versionId !== stored.previousVersionId
    || replacementHead.versionId !== stored.replacementVersionId
  ) {
    consume(stored);
    return Object.freeze({
      status: "ask",
      reason: "record_head_changed",
      resolution: null,
      replacementReference: null,
    });
  }

  const utterance = input.currentUserUtterance.trim();
  if (DECLINE_REPLACEMENT.test(utterance)) {
    consume(stored);
    return Object.freeze({
      status: "declined",
      resolution: null,
      replacementReference: null,
    });
  }
  if (!CONFIRM_REPLACEMENT.test(utterance)) {
    return Object.freeze({
      status: "ask",
      reason: "not_confirmed",
      resolution: null,
      replacementReference: stored.reference,
    });
  }

  if (!Number.isFinite(Date.parse(input.confirmedAt))) {
    return Object.freeze({
      status: "ask",
      reason: "not_confirmed",
      resolution: null,
      replacementReference: stored.reference,
    });
  }

  consume(stored);
  return Object.freeze({
    status: "confirmed",
    resolution: Object.freeze({
      previousRecordId: stored.previousRecordId,
      replacementRecordId: stored.replacementRecordId,
      previousVersionId: stored.previousVersionId,
      replacementVersionId: stored.replacementVersionId,
      confirmedAt: input.confirmedAt,
      utterance: input.currentUserUtterance,
    }) as ExactExplicitReplacementResolution,
    replacementReference: null,
  });
}
