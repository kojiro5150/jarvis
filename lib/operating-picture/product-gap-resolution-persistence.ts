import { createHash } from "node:crypto";

import { createDecisionRecord, type UserDecisionRecord } from "./record-core";
import {
  createInitialOperatingPictureRecordVersion,
  type OperatingPictureRecordVersion,
} from "./record-version-history";
import type { DurablePurposeProjectionResult } from "./purpose-projection-retrieval";
import type { SupabaseOperatingPictureAppendResult } from "./supabase-persistence";
import type { ProductGapResolutionTarget } from "./product-gap-resolution-reference";
import { MODEL_CONTINUITY_PURPOSE } from "./model-continuity-contract";

export type ProductGapResolutionValue = Readonly<{
  status: "resolved";
  targetRecordId: string;
}>;

export type ProductGapResolutionRecord = UserDecisionRecord<ProductGapResolutionValue>;

export type ProductGapResolutionPersistenceResult =
  | Readonly<{ status: "persisted"; recordId: string; versionId: string }>
  | Readonly<{
      status: "rejected";
      reason:
        | "target_not_found"
        | "target_changed"
        | "target_ineligible"
        | "already_resolved"
        | "projection_unavailable"
        | "invalid_assertion"
        | "persistence_unavailable";
    }>;

type AppendVersion = (
  version: OperatingPictureRecordVersion<ProductGapResolutionRecord>,
) => Promise<SupabaseOperatingPictureAppendResult>;

export function productGapResolutionRecordId(targetRecordId: string): string {
  return `product-gap-resolution:${createHash("sha256").update(targetRecordId).digest("hex")}`;
}

function productGapStatement(item: Extract<DurablePurposeProjectionResult, { status: "projected" }>["items"][number]): string | null {
  if (item.authorshipSource !== "user"
    || item.recoveryDisposition !== "recoverable_user_continuity"
    || item.semanticClass === "decision" && item.subject.namespace === "product_gap_resolution"
    || item.subject.namespace !== "user_continuity"
    || item.subject.revision !== "append_only"
    || typeof item.payload !== "object"
    || item.payload === null
    || Array.isArray(item.payload)) return null;
  const statement = (item.payload as Record<string, unknown>).statement;
  return typeof statement === "string" && /^JARVIS product gap\b/i.test(statement.normalize("NFKC").trim())
    ? statement
    : null;
}

function validResolutionFor(item: Extract<DurablePurposeProjectionResult, { status: "projected" }>["items"][number], targetRecordId: string): boolean {
  if (item.semanticClass !== "decision"
    || item.authorshipSource !== "user"
    || item.recoveryDisposition !== "recoverable_user_continuity"
    || item.subject.namespace !== "product_gap_resolution"
    || item.subject.entity !== targetRecordId
    || item.subject.attribute !== "status"
    || item.subject.revision !== "append_only"
    || typeof item.payload !== "object"
    || item.payload === null
    || Array.isArray(item.payload)) return false;
  const payload = item.payload as Record<string, unknown>;
  return payload.status === "resolved" && payload.targetRecordId === targetRecordId;
}

export function createProductGapResolutionInitialVersion(input: Readonly<{
  targetRecordId: string;
  statedAt: string;
}>): OperatingPictureRecordVersion<ProductGapResolutionRecord> | null {
  if (!Number.isFinite(Date.parse(input.statedAt)) || input.targetRecordId.length === 0) return null;
  const recordId = productGapResolutionRecordId(input.targetRecordId);
  const record = createDecisionRecord({
    id: recordId,
    subject: Object.freeze({
      namespace: "product_gap_resolution",
      entity: input.targetRecordId,
      attribute: "status",
      revision: "append_only" as const,
    }),
    visibility: Object.freeze([MODEL_CONTINUITY_PURPOSE]),
    value: Object.freeze({ status: "resolved" as const, targetRecordId: input.targetRecordId }),
    statedAt: input.statedAt,
  });
  return createInitialOperatingPictureRecordVersion(record, input.statedAt);
}

export async function persistProductGapResolutionAssertion(input: Readonly<{
  target: ProductGapResolutionTarget;
  statedAt: string;
  retrieveProjection: () => Promise<DurablePurposeProjectionResult>;
  appendVersion: AppendVersion;
}>): Promise<ProductGapResolutionPersistenceResult> {
  let projection: DurablePurposeProjectionResult;
  try {
    projection = await input.retrieveProjection();
  } catch {
    return Object.freeze({ status: "rejected", reason: "projection_unavailable" });
  }
  if (projection.status === "rejected") {
    return Object.freeze({ status: "rejected", reason: "projection_unavailable" });
  }
  if (projection.status === "empty") {
    return Object.freeze({ status: "rejected", reason: "target_not_found" });
  }

  const target = projection.items.find(item => item.recordId === input.target.recordId);
  if (!target) return Object.freeze({ status: "rejected", reason: "target_not_found" });
  if (target.versionId !== input.target.versionId) {
    return Object.freeze({ status: "rejected", reason: "target_changed" });
  }
  if (!productGapStatement(target)) {
    return Object.freeze({ status: "rejected", reason: "target_ineligible" });
  }
  if (projection.items.some(item => validResolutionFor(item, input.target.recordId))) {
    return Object.freeze({ status: "rejected", reason: "already_resolved" });
  }

  const version = createProductGapResolutionInitialVersion({
    targetRecordId: input.target.recordId,
    statedAt: input.statedAt,
  });
  if (!version) return Object.freeze({ status: "rejected", reason: "invalid_assertion" });

  let append: SupabaseOperatingPictureAppendResult;
  try {
    append = await input.appendVersion(version);
  } catch {
    return Object.freeze({ status: "rejected", reason: "persistence_unavailable" });
  }
  if (append.status !== "appended") {
    return Object.freeze({
      status: "rejected",
      reason: append.reason === "record_already_exists" || append.reason === "version_already_exists"
        ? "already_resolved"
        : "persistence_unavailable",
    });
  }
  return Object.freeze({
    status: "persisted",
    recordId: append.version.recordId,
    versionId: append.version.versionId,
  });
}
