import type { DurablePurposeProjectionResult } from "./purpose-projection-retrieval";
import type { ProductGapResolutionCandidate } from "./product-gap-resolution-reference";

export type ProductGapResolutionHistoryItem = ProductGapResolutionCandidate & Readonly<{
  status: "active" | "resolved";
  resolvedAt?: string;
}>;

export type ProductGapResolutionProjectionResult =
  | Readonly<{
      status: "projected";
      active: readonly ProductGapResolutionCandidate[];
      history: readonly ProductGapResolutionHistoryItem[];
    }>
  | Readonly<{ status: "rejected"; reason: "projection_unavailable" | "resolution_integrity_failure" }>;

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
  const resolutions = new Map<string, string>();

  for (const item of projection.items) {
    if (item.subject.namespace !== "product_gap_resolution") continue;
    const target = resolutionTarget(item);
    if (!target || !originalIds.has(target) || resolutions.has(target) || !item.authorshipAt) {
      return Object.freeze({ status: "rejected", reason: "resolution_integrity_failure" });
    }
    resolutions.set(target, item.authorshipAt);
  }

  const history = originals.map(original => {
    const resolvedAt = resolutions.get(original.recordId);
    return Object.freeze({
      ...original,
      status: resolvedAt ? "resolved" as const : "active" as const,
      ...(resolvedAt ? { resolvedAt } : {}),
    });
  });
  return Object.freeze({
    status: "projected",
    active: Object.freeze(history.filter(item => item.status === "active").map(({ status: _status, resolvedAt: _resolvedAt, ...item }) => Object.freeze(item))),
    history: Object.freeze(history),
  });
}
