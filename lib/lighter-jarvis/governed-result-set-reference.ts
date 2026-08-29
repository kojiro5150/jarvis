import { randomUUID } from "node:crypto";

export const GOVERNED_RESULT_SET_REFERENCE_TTL_MS = 15 * 60 * 1000;
export const GOVERNED_RESULT_SET_REFERENCE_MAX_SUBSEQUENT_USER_TURNS = 6;
const MAX_ORDERED_RESOURCES = 100;

export type GovernedReferentialCapability = "gmail" | "calendar" | "drive";
export type GovernedReferentialClass =
  | "gmail.latest_messages"
  | "calendar.factual_items"
  | "drive.search_results";
export type GovernedReferenceKind = "gmail_message" | "calendar_item" | "drive_file";

export type GovernedReferentialScopeReference = Readonly<{
  governedReferentialScopeId: string;
}>;

export type GovernedResultSetReference = Readonly<{
  governedResultSetReferenceId: string;
}>;

export type GovernedResultSetSnapshot = Readonly<{
  id: string;
  capability: GovernedReferentialCapability;
  resultSetType: "ordered_resources";
  referentialClass: GovernedReferentialClass;
  supportedReferenceKinds: readonly GovernedReferenceKind[];
  orderedResourceIds: readonly string[];
  originatingOperation: string;
  createdAt: string;
  expiresAt: string;
  remainingReferenceTurns: number;
  supersededBy: string | null;
}>;

export type GovernedOrdinalResolution =
  | Readonly<{ status: "resolved"; resourceId: string; ordinal: number; resultSet: GovernedResultSetSnapshot }>
  | Readonly<{ status: "absent" | "expired" | "out_of_range" | "invalid"; resourceId: null; ordinal: number | null; resultSet: GovernedResultSetSnapshot | null }>;

type StoredScope = Readonly<{
  id: string;
  reference: GovernedReferentialScopeReference;
  status: "active" | "closed";
  subsequentUserTurns: number;
}>;

type StoredResultSet = Readonly<{
  id: string;
  reference: GovernedResultSetReference;
  scopeId: string;
  capability: GovernedReferentialCapability;
  resultSetType: "ordered_resources";
  referentialClass: GovernedReferentialClass;
  supportedReferenceKinds: readonly GovernedReferenceKind[];
  orderedResourceIds: readonly string[];
  originatingOperation: string;
  createdAt: string;
  expiresAt: string;
  createdAtScopeTurn: number;
  supersededBy: string | null;
  invalidated: boolean;
}>;

const scopes = new Map<string, StoredScope>();
const resultSets = new Map<string, StoredResultSet>();

function cloneStringList(values: readonly string[]): readonly string[] {
  return Object.freeze([...values]);
}

function isOpaqueReference(value: unknown, key: string): value is Record<string, string> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const descriptor = Object.getOwnPropertyDescriptor(value, key);
  return Boolean(descriptor && "value" in descriptor && typeof descriptor.value === "string" && descriptor.value.trim().length > 0);
}

function scopeFrom(reference: unknown): StoredScope | null {
  if (!isOpaqueReference(reference, "governedReferentialScopeId")) return null;
  return scopes.get(reference.governedReferentialScopeId) ?? null;
}

function resultSetFrom(reference: unknown): StoredResultSet | null {
  if (!isOpaqueReference(reference, "governedResultSetReferenceId")) return null;
  return resultSets.get(reference.governedResultSetReferenceId) ?? null;
}

function turnsSinceCreation(scope: StoredScope, stored: StoredResultSet): number {
  return Math.max(0, scope.subsequentUserTurns - stored.createdAtScopeTurn);
}

function remainingTurns(scope: StoredScope, stored: StoredResultSet): number {
  return Math.max(0, GOVERNED_RESULT_SET_REFERENCE_MAX_SUBSEQUENT_USER_TURNS - turnsSinceCreation(scope, stored));
}

function snapshot(scope: StoredScope, stored: StoredResultSet): GovernedResultSetSnapshot {
  return Object.freeze({
    id: stored.id,
    capability: stored.capability,
    resultSetType: stored.resultSetType,
    referentialClass: stored.referentialClass,
    supportedReferenceKinds: cloneStringList(stored.supportedReferenceKinds),
    orderedResourceIds: cloneStringList(stored.orderedResourceIds),
    originatingOperation: stored.originatingOperation,
    createdAt: stored.createdAt,
    expiresAt: stored.expiresAt,
    remainingReferenceTurns: remainingTurns(scope, stored),
    supersededBy: stored.supersededBy,
  });
}

function validResourceIds(ids: readonly string[]): boolean {
  return ids.length <= MAX_ORDERED_RESOURCES
    && ids.every(id => typeof id === "string" && id.trim().length > 0)
    && new Set(ids).size === ids.length;
}

function validReferenceKinds(kinds: readonly GovernedReferenceKind[]): boolean {
  return kinds.length > 0 && new Set(kinds).size === kinds.length;
}

/**
 * Creates a module-private referential scope and returns only its opaque handle.
 * The handle contains no private resource identity and grants no authority.
 */
export function createGovernedReferentialScopeReference(): GovernedReferentialScopeReference {
  const id = randomUUID();
  const reference = Object.freeze({ governedReferentialScopeId: id });
  scopes.set(id, Object.freeze({ id, reference, status: "active", subsequentUserTurns: 0 }));
  return reference;
}

/**
 * Closes only a genuine server-owned scope. Client fabrication cannot create,
 * reopen, or close referential state.
 */
export function closeGovernedReferentialScope(reference: unknown): boolean {
  const scope = scopeFrom(reference);
  if (!scope || scope.status !== "active") return false;
  scopes.set(scope.id, Object.freeze({ ...scope, status: "closed" }));
  for (const [id, resultSet] of resultSets) {
    if (resultSet.scopeId === scope.id && !resultSet.invalidated) {
      resultSets.set(id, Object.freeze({ ...resultSet, invalidated: true }));
    }
  }
  return true;
}

/**
 * Advances the structural lifetime for every result set in one genuine scope.
 * Integration code should call this once for each subsequent user turn, before
 * resolving any implicit reference on that turn.
 */
export function advanceGovernedReferentialScopeUserTurn(reference: unknown): boolean {
  const scope = scopeFrom(reference);
  if (!scope || scope.status !== "active") return false;
  scopes.set(scope.id, Object.freeze({ ...scope, subsequentUserTurns: scope.subsequentUserTurns + 1 }));
  return true;
}

/**
 * Stores an immutable ordered identity set in module-private server state.
 * A successful same-class creation supersedes the previous same-class result,
 * including when the new ordered set is empty.
 */
export function createGovernedResultSetReference(input: {
  readonly scopeReference: unknown;
  readonly capability: GovernedReferentialCapability;
  readonly referentialClass: GovernedReferentialClass;
  readonly supportedReferenceKinds: readonly GovernedReferenceKind[];
  readonly orderedResourceIds: readonly string[];
  readonly originatingOperation: string;
  readonly now?: Date;
}): GovernedResultSetReference | null {
  const scope = scopeFrom(input.scopeReference);
  if (!scope || scope.status !== "active") return null;
  if (!validResourceIds(input.orderedResourceIds)
    || !validReferenceKinds(input.supportedReferenceKinds)
    || !input.originatingOperation.trim()) return null;

  const now = input.now ?? new Date();
  if (Number.isNaN(now.getTime())) return null;

  const id = randomUUID();
  const reference = Object.freeze({ governedResultSetReferenceId: id });

  for (const [existingId, existing] of resultSets) {
    if (existing.scopeId === scope.id
      && !existing.invalidated
      && existing.supersededBy === null
      && existing.referentialClass === input.referentialClass) {
      resultSets.set(existingId, Object.freeze({ ...existing, supersededBy: id }));
    }
  }

  const stored: StoredResultSet = Object.freeze({
    id,
    reference,
    scopeId: scope.id,
    capability: input.capability,
    resultSetType: "ordered_resources",
    referentialClass: input.referentialClass,
    supportedReferenceKinds: cloneStringList(input.supportedReferenceKinds),
    orderedResourceIds: cloneStringList(input.orderedResourceIds),
    originatingOperation: input.originatingOperation,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + GOVERNED_RESULT_SET_REFERENCE_TTL_MS).toISOString(),
    createdAtScopeTurn: scope.subsequentUserTurns,
    supersededBy: null,
    invalidated: false,
  });
  resultSets.set(id, stored);
  return reference;
}

/** Returns a frozen diagnostic snapshot only for genuine same-scope state. */
export function resolveGovernedResultSetReference(input: {
  readonly scopeReference: unknown;
  readonly resultSetReference: unknown;
}): GovernedResultSetSnapshot | null {
  const scope = scopeFrom(input.scopeReference);
  const stored = resultSetFrom(input.resultSetReference);
  if (!scope || !stored || stored.scopeId !== scope.id || stored.invalidated) return null;
  return snapshot(scope, stored);
}

/**
 * Resolves an ordinal against exact preserved server-owned ordering.
 * It never queries a connector, inspects rendered prose, invokes a model,
 * creates authority, or substitutes another resource.
 */
export function resolveGovernedResultSetOrdinal(input: {
  readonly scopeReference: unknown;
  readonly resultSetReference: unknown;
  readonly referenceKind: GovernedReferenceKind;
  readonly ordinal: number;
  readonly now?: Date;
}): GovernedOrdinalResolution {
  const scope = scopeFrom(input.scopeReference);
  const stored = resultSetFrom(input.resultSetReference);
  const ordinal = Number.isInteger(input.ordinal) ? input.ordinal : null;

  if (!scope || !stored || scope.status !== "active" || stored.scopeId !== scope.id || stored.invalidated || ordinal === null || ordinal < 1) {
    return Object.freeze({ status: "invalid", resourceId: null, ordinal, resultSet: null });
  }

  const current = snapshot(scope, stored);
  if (stored.supersededBy !== null || !stored.supportedReferenceKinds.includes(input.referenceKind)) {
    return Object.freeze({ status: "absent", resourceId: null, ordinal, resultSet: current });
  }

  const now = input.now ?? new Date();
  if (Number.isNaN(now.getTime())) {
    return Object.freeze({ status: "invalid", resourceId: null, ordinal, resultSet: current });
  }
  if (now.getTime() >= Date.parse(stored.expiresAt)
    || turnsSinceCreation(scope, stored) > GOVERNED_RESULT_SET_REFERENCE_MAX_SUBSEQUENT_USER_TURNS) {
    return Object.freeze({ status: "expired", resourceId: null, ordinal, resultSet: current });
  }

  if (ordinal > stored.orderedResourceIds.length) {
    return Object.freeze({ status: "out_of_range", resourceId: null, ordinal, resultSet: current });
  }

  return Object.freeze({
    status: "resolved",
    resourceId: stored.orderedResourceIds[ordinal - 1],
    ordinal,
    resultSet: current,
  });
}
