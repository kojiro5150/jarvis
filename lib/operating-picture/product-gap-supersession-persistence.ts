import { createHash } from "node:crypto";

import { createDecisionRecord, type UserDecisionRecord } from "./record-core";
import { createInitialOperatingPictureRecordVersion, type OperatingPictureRecordVersion } from "./record-version-history";
import type { DurablePurposeProjectionResult } from "./purpose-projection-retrieval";
import type { SupabaseOperatingPictureAppendResult } from "./supabase-persistence";
import type { ProductGapSupersessionPair } from "./product-gap-supersession-reference";
import { MODEL_CONTINUITY_PURPOSE } from "./model-continuity-contract";

export type ProductGapSupersessionValue = Readonly<{
  relationship: "superseded_by";
  targetRecordId: string;
  successorRecordId: string;
  successorVersionId: string;
}>;
export type ProductGapSupersessionRecord = UserDecisionRecord<ProductGapSupersessionValue>;
export type ProductGapSupersessionPersistenceResult = Readonly<{ status: "persisted"; recordId: string; versionId: string }>
  | Readonly<{ status: "rejected"; reason: "target_not_found" | "target_changed" | "target_ineligible" | "successor_not_found" | "successor_changed" | "successor_ineligible" | "already_closed" | "invalid_assertion" | "projection_unavailable" | "persistence_unavailable" }>;

type Item = Extract<DurablePurposeProjectionResult, { status: "projected" }>["items"][number];
function isGap(item: Item): boolean {
  return item.authorshipSource === "user" && item.recoveryDisposition === "recoverable_user_continuity"
    && item.subject.namespace === "user_continuity" && item.subject.revision === "append_only"
    && typeof item.payload === "object" && item.payload !== null && !Array.isArray(item.payload)
    && typeof (item.payload as Record<string, unknown>).statement === "string"
    && /^JARVIS product gap\b/i.test(((item.payload as Record<string, unknown>).statement as string).normalize("NFKC").trim());
}
function closesTarget(item: Item, targetRecordId: string): boolean {
  if (item.semanticClass !== "decision" || item.authorshipSource !== "user" || item.subject.revision !== "append_only"
    || typeof item.payload !== "object" || item.payload === null || Array.isArray(item.payload)) return false;
  const payload = item.payload as Record<string, unknown>;
  return (item.subject.namespace === "product_gap_resolution" && payload.status === "resolved" && payload.targetRecordId === targetRecordId)
    || (item.subject.namespace === "product_gap_supersession" && payload.relationship === "superseded_by" && payload.targetRecordId === targetRecordId);
}

export function productGapSupersessionRecordId(targetRecordId: string): string {
  return `product-gap-supersession:${createHash("sha256").update(targetRecordId).digest("hex")}`;
}

export function createProductGapSupersessionInitialVersion(input: Readonly<{ pair: ProductGapSupersessionPair; statedAt: string }>): OperatingPictureRecordVersion<ProductGapSupersessionRecord> | null {
  if (!Number.isFinite(Date.parse(input.statedAt)) || input.pair.target.recordId === input.pair.successor.recordId) return null;
  const record = createDecisionRecord({
    id: productGapSupersessionRecordId(input.pair.target.recordId),
    subject: Object.freeze({ namespace: "product_gap_supersession", entity: input.pair.target.recordId, attribute: "successor", revision: "append_only" as const }),
    visibility: Object.freeze([MODEL_CONTINUITY_PURPOSE]),
    value: Object.freeze({ relationship: "superseded_by" as const, targetRecordId: input.pair.target.recordId, successorRecordId: input.pair.successor.recordId, successorVersionId: input.pair.successor.versionId }),
    statedAt: input.statedAt,
  });
  return createInitialOperatingPictureRecordVersion(record, input.statedAt);
}

export async function persistProductGapSupersessionAssertion(input: Readonly<{
  pair: ProductGapSupersessionPair;
  statedAt: string;
  retrieveProjection: () => Promise<DurablePurposeProjectionResult>;
  appendVersion: (version: OperatingPictureRecordVersion<ProductGapSupersessionRecord>) => Promise<SupabaseOperatingPictureAppendResult>;
}>): Promise<ProductGapSupersessionPersistenceResult> {
  let projection: DurablePurposeProjectionResult;
  try { projection = await input.retrieveProjection(); } catch { return Object.freeze({ status: "rejected", reason: "projection_unavailable" }); }
  if (projection.status !== "projected") return Object.freeze({ status: "rejected", reason: projection.status === "empty" ? "target_not_found" : "projection_unavailable" });
  const target = projection.items.find(item => item.recordId === input.pair.target.recordId);
  const successor = projection.items.find(item => item.recordId === input.pair.successor.recordId);
  if (!target) return Object.freeze({ status: "rejected", reason: "target_not_found" });
  if (target.versionId !== input.pair.target.versionId) return Object.freeze({ status: "rejected", reason: "target_changed" });
  if (!isGap(target)) return Object.freeze({ status: "rejected", reason: "target_ineligible" });
  if (projection.items.some(item => closesTarget(item, target.recordId))) return Object.freeze({ status: "rejected", reason: "already_closed" });
  if (!successor) return Object.freeze({ status: "rejected", reason: "successor_not_found" });
  if (successor.versionId !== input.pair.successor.versionId) return Object.freeze({ status: "rejected", reason: "successor_changed" });
  if (!isGap(successor) || successor.recordId === target.recordId) return Object.freeze({ status: "rejected", reason: "successor_ineligible" });
  const version = createProductGapSupersessionInitialVersion({ pair: input.pair, statedAt: input.statedAt });
  if (!version) return Object.freeze({ status: "rejected", reason: "invalid_assertion" });
  let append: SupabaseOperatingPictureAppendResult;
  try { append = await input.appendVersion(version); } catch { return Object.freeze({ status: "rejected", reason: "persistence_unavailable" }); }
  if (append.status !== "appended") return Object.freeze({ status: "rejected", reason: append.reason === "record_already_exists" || append.reason === "version_already_exists" ? "already_closed" : "persistence_unavailable" });
  return Object.freeze({ status: "persisted", recordId: append.version.recordId, versionId: append.version.versionId });
}
