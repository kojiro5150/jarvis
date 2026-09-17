import type { DurablePurposeProjectionResult } from "./purpose-projection-retrieval";
import type { ProductGapResolutionCandidate } from "./product-gap-resolution-reference";

export type ProductGapResolutionHistoryItem = ProductGapResolutionCandidate & Readonly<{
  status: "active" | "resolved" | "superseded";
  resolvedAt?: string;
  supersededAt?: string;
  supersededByRecordId?: string;
}>;

export type ProductGapResolutionProjectionResult =
  | Readonly<{
      status: "projected";
      active: readonly ProductGapResolutionCandidate[];
      history: readonly ProductGapResolutionHistoryItem[];
    }>
  | Readonly<{ status: "rejected"; reason: "projection_unavailable" | "resolution_integrity_failure" | "supersession_integrity_failure" }>;

function statementOf(item: Extract<DurablePurposeProjectionResult, { status: "projected" }>["items"][number]): string | null {
  if (item.authorshipSource !== "user"
    || item.recoveryDisposition !== "recoverable_user_continuity"
    || item.subject.namespace !== "user_continuity"
    || item.subject.revision !== "append_only"
    || typeof item.payload !== "object"
    || item.payload === null
    || Array.isArray(item.payload)) return null;
  const statement = (item.payload as Record<string, unknown>).statement;
  if (typeof statement !== "string") return null;
  const normalized = statement.normalize("NFKC").trim();
  return /^JARVIS product gap\b/i.test(normalized) ? normalized : null;
}

function resolutionTarget(item: Extract<DurablePurposeProjectionResult, { status: "projected" }>["items"][number]): string | null {
  if (item.semanticClass !== "decision"
    || item.authorshipSource !== "user"
    || item.recoveryDisposition !== "recoverable_user_continuity"
    || item.subject.namespace !== "product_gap_resolution"
    || item.subject.attribute !== "status"
    || item.subject.revision !== "append_only"
    || typeof item.payload !== "object"
    || item.payload === null
    || Array.isArray(item.payload)) return null;
  const payload = item.payload as Record<string, unknown>;
  return payload.status === "resolved"
    && typeof payload.targetRecordId === "string"
    && payload.targetRecordId === item.subject.entity
    ? payload.targetRecordId
    : null;
}

function supersession(item: Extract<DurablePurposeProjectionResult, { status: "projected" }>["items"][number]): Readonly<{ target: string; successor: string; successorVersion: string }> | null {
  if (item.semanticClass !== "decision" || item.authorshipSource !== "user"
    || item.recoveryDisposition !== "recoverable_user_continuity"
    || item.subject.namespace !== "product_gap_supersession" || item.subject.attribute !== "successor"
    || item.subject.revision !== "append_only" || typeof item.payload !== "object"
    || item.payload === null || Array.isArray(item.payload)) return null;
  const payload = item.payload as Record<string, unknown>;
  return payload.relationship === "superseded_by" && typeof payload.targetRecordId === "string"
    && typeof payload.successorRecordId === "string" && typeof payload.successorVersionId === "string"
    && payload.targetRecordId === item.subject.entity && payload.targetRecordId !== payload.successorRecordId
    ? Object.freeze({ target: payload.targetRecordId, successor: payload.successorRecordId, successorVersion: payload.successorVersionId }) : null;
}

export function projectProductGapResolutionStatus(
  projection: DurablePurposeProjectionResult,
): ProductGapResolutionProjectionResult {
  if (projection.status === "rejected") {
    return Object.freeze({ status: "rejected", reason: "projection_unavailable" });
  }
  if (projection.status === "empty") {
    return Object.freeze({ status: "projected", active: Object.freeze([]), history: Object.freeze([]) });
  }

  const originals = projection.items.flatMap(item => {
    const statement = statementOf(item);
    return statement ? [Object.freeze({ recordId: item.recordId, versionId: item.versionId, statement })] : [];
  });
  const originalIds = new Set(originals.map(item => item.recordId));
  const originalVersions = new Map(originals.map(item => [item.recordId, item.versionId] as const));
  const resolutions = new Map<string, string>();
  const supersessions = new Map<string, Readonly<{ successor: string; at: string }>>();

  for (const item of projection.items) {
    if (item.subject.namespace !== "product_gap_resolution") continue;
    const target = resolutionTarget(item);
    if (!target || !originalIds.has(target) || resolutions.has(target) || !item.authorshipAt) {
      return Object.freeze({ status: "rejected", reason: "resolution_integrity_failure" });
    }
    resolutions.set(target, item.authorshipAt);
  }

  for (const item of projection.items) {
    if (item.subject.namespace !== "product_gap_supersession") continue;
    const relation = supersession(item);
    if (!relation || !originalIds.has(relation.target) || originalVersions.get(relation.successor) !== relation.successorVersion
      || resolutions.has(relation.target) || supersessions.has(relation.target) || !item.authorshipAt) {
      return Object.freeze({ status: "rejected", reason: "supersession_integrity_failure" });
    }
    supersessions.set(relation.target, Object.freeze({ successor: relation.successor, at: item.authorshipAt }));
  }

  const history = originals.map(original => {
    const resolvedAt = resolutions.get(original.recordId);
    const superseded = supersessions.get(original.recordId);
    return Object.freeze({
      ...original,
      status: superseded ? "superseded" as const : resolvedAt ? "resolved" as const : "active" as const,
      ...(resolvedAt ? { resolvedAt } : {}),
      ...(superseded ? { supersededAt: superseded.at, supersededByRecordId: superseded.successor } : {}),
    });
  });
  return Object.freeze({
    status: "projected",
    active: Object.freeze(history.filter(item => item.status === "active").map(({ status: _status, resolvedAt: _resolvedAt, supersededAt: _supersededAt, supersededByRecordId: _supersededByRecordId, ...item }) => Object.freeze(item))),
    history: Object.freeze(history),
  });
}
