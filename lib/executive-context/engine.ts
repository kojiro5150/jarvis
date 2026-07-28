import { createHash } from "node:crypto";
import { createSituationalAwareness } from "../executive-operating-system/situational-awareness/model";
import type { ExecutiveStateSnapshot, ExplicitRelationship } from "../executive-operating-system/situational-awareness/assembly";
import {
  EXECUTIVE_CONTEXT_CONTRACT_VERSION, EXECUTIVE_CONTEXT_ENGINE_VERSION,
} from "./types";
import type {
  ContextMeasureEvidence, ContextRecordSummary, ContextRelationshipGroup,
  ExecutiveContextCondition, ExecutiveContextConditionType, ExecutiveContextDerivationInput,
  ExecutiveContextFailure, ExecutiveContextFailureCode, ExecutiveContextFailureStage,
  ExecutiveContextResult, ExecutiveContextSnapshot,
} from "./types";

const RULE_VERSION = "1.0.0" as const;
const RFC3339 = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])T([01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-]([01]\d|2[0-3]):[0-5]\d)$/;
const compareText = (left: string, right: string) => left < right ? -1 : left > right ? 1 : 0;
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).sort(compareText).map((key) => `${JSON.stringify(key)}:${canonical((value as Record<string, unknown>)[key])}`).join(",")}}`;
  const encoded = JSON.stringify(value);
  if (encoded === undefined) throw new Error("value is not JSON-compatible");
  return encoded;
}
const identity = (kind: string, value: unknown) => `${kind}:${createHash("sha256").update(canonical(value), "utf8").digest("hex")}`;
function deepFreeze<T>(value: T, seen = new WeakSet<object>()): Readonly<T> {
  if (!value || typeof value !== "object" || seen.has(value)) return value;
  seen.add(value); Object.values(value as object).forEach((child) => deepFreeze(child, seen));
  return Object.freeze(value);
}
const clone = <T>(value: T): T => JSON.parse(canonical(value)) as T;
function validTimestamp(value: unknown): value is string {
  if (typeof value !== "string" || !RFC3339.test(value)) return false;
  return Number.isFinite(Date.parse(value));
}
function failure(stage: ExecutiveContextFailureStage, code: ExecutiveContextFailureCode, rule: string, message: string, sourceSnapshotId?: string): ExecutiveContextFailure {
  return deepFreeze({ outcome: "failure", stage, code, rule, message, ...(sourceSnapshotId ? { sourceSnapshotId } : {}) });
}
function uniqueOrdered(values: readonly string[]): readonly string[] { return [...new Set(values)].sort(compareText); }
function groupRelationships(items: readonly ExplicitRelationship[], targetKind: "role" | "project"): readonly ContextRelationshipGroup[] {
  const groups = new Map<string, ExplicitRelationship[]>();
  for (const item of items.filter((relationship) => relationship.targetKind === targetKind)) groups.set(item.targetId, [...(groups.get(item.targetId) ?? []), item]);
  return [...groups].sort(([left], [right]) => compareText(left, right)).map(([targetId, relationships]) => ({
    targetId,
    relationshipIds: uniqueOrdered(relationships.map(({ relationshipId }) => relationshipId)),
    sourceIds: uniqueOrdered(relationships.map(({ sourceId }) => sourceId)),
  }));
}
function recordSummary(records: readonly ({ readonly type: string } & ({ readonly conflictId: string } | { readonly gapId: string }))[]): ContextRecordSummary {
  const byType: Record<string, number> = {};
  for (const record of records) byType[record.type] = (byType[record.type] ?? 0) + 1;
  return { totalCount: records.length, recordIds: records.map((record) => "conflictId" in record ? record.conflictId : record.gapId).sort(compareText), byType: Object.fromEntries(Object.entries(byType).sort(([a], [b]) => compareText(a, b))) };
}
function validateSource(source: ExecutiveStateSnapshot): string | undefined {
  if (!source || typeof source !== "object" || typeof source.snapshotId !== "string" || !source.snapshotId || !validTimestamp(source.observedAt)) return "source identity and observedAt are required";
  if (source.metadata?.canonicalContractVersion !== "projection-artifact-v1" || source.metadata?.assemblyVersion !== "1.0.0") return "unsupported source snapshot contract version";
  if (!source.lifecycleSnapshotId || !source.previousLifecycleSnapshotId || !Array.isArray(source.artifacts) || !Array.isArray(source.relationships) || !Array.isArray(source.conflicts) || !Array.isArray(source.gaps) || !Array.isArray(source.provenance)) return "source snapshot structure is invalid";
  try { createSituationalAwareness(source.state); canonical(source); } catch (error) { return error instanceof Error ? error.message : "source snapshot is invalid"; }
  if (source.metadata.artifactCount !== source.artifacts.length || source.metadata.relationshipCount !== source.relationships.length || source.metadata.conflictCount !== source.conflicts.length || source.metadata.gapCount !== source.gaps.length) return "source metadata counts do not match source collections";
  if (new Set(source.artifacts.map(({ artifactId }) => artifactId)).size !== source.artifacts.length) return "artifact identities must be unique";
  if (source.relationships.some((item) => !item.relationshipId || !item.sourceId || !item.targetId)) return "relationship integrity validation failed";
  if (source.conflicts.some((item) => !item.conflictId || item.type !== "structural_conflict") || source.gaps.some((item) => !item.gapId || item.type !== "explicit_unknown")) return "conflict or gap integrity validation failed";
  if (source.provenance.some((item) => !item.sourceId || !item.adapterId || !validTimestamp(item.projectedAt))) return "provenance integrity validation failed";
}

/** Deterministically derives descriptive context from one canonical state snapshot. */
export class ExecutiveContextEngine {
  derive(input: ExecutiveContextDerivationInput): ExecutiveContextResult {
    if (!input || typeof input !== "object" || !validTimestamp(input.referenceTime)) return failure("configuration", "CONFIGURATION_FAILURE", "explicit_valid_reference_time", "referenceTime must be an RFC 3339 timestamp");
    const source = input.sourceSnapshot;
    const validationMessage = validateSource(source);
    if (validationMessage) {
      const unsupported = validationMessage === "unsupported source snapshot contract version";
      return failure("input_validation", unsupported ? "UNSUPPORTED_CONTRACT_VERSION" : "SOURCE_SNAPSHOT_VALIDATION_FAILURE", unsupported ? "supported_source_contract_version" : "valid_executive_state_snapshot", validationMessage, source?.snapshotId);
    }
    if (Date.parse(input.referenceTime) < Date.parse(source.observedAt)) return failure("configuration", "CONFIGURATION_FAILURE", "reference_time_not_before_observation", "referenceTime must not precede source observedAt", source.snapshotId);
    try {
      const state = source.state;
      const counts = [state.roles.length, state.projects.length, state.commitments.length, state.waitingItems.length, state.priorities.length, state.activeWork.length];
      const entitySummary = { totalEntityCount: counts.reduce((sum, count) => sum + count, 0), roleCount: counts[0], projectCount: counts[1], commitmentCount: counts[2], waitingItemCount: counts[3], explicitPriorityCount: counts[4], activeWorkCount: counts[5] };
      const sourceIds = uniqueOrdered(source.provenance.map(({ sourceId }) => sourceId));
      const adapters = uniqueOrdered(source.provenance.map(({ adapterId }) => adapterId));
      const artifactsBySource: Record<string, number> = {};
      for (const { artifact } of source.artifacts) artifactsBySource[artifact.provenance.sourceId] = (artifactsBySource[artifact.provenance.sourceId] ?? 0) + 1;
      const ages = source.provenance.map(({ projectedAt }) => Date.parse(input.referenceTime) - Date.parse(projectedAt)).sort((a, b) => a - b);
      if (ages.some((age) => age < 0)) return failure("derivation", "DERIVATION_FAILURE", "non_negative_observation_age", "referenceTime precedes provenance projectedAt", source.snapshotId);
      const completeProvenanceCount = source.provenance.length;
      const provenanceCoverage = source.artifacts.length === 0 ? 1 : completeProvenanceCount / source.artifacts.length;
      const sourceContext = { sourceCount: sourceIds.length, sourceIds, artifactsBySource: Object.fromEntries(Object.entries(artifactsBySource).sort(([a], [b]) => compareText(a, b))), adapterIds: adapters, completeProvenanceCount, provenanceCoverage, oldestObservationAgeMilliseconds: ages.length ? ages[ages.length - 1] : null, newestObservationAgeMilliseconds: ages.length ? ages[0] : null };
      const relationshipContext = { totalRelationshipCount: source.relationships.length, byRole: groupRelationships(source.relationships, "role"), byProject: groupRelationships(source.relationships, "project") };
      const conflictContext = recordSummary(source.conflicts), gapContext = recordSummary(source.gaps);
      const conditionSpecs: readonly [ExecutiveContextConditionType, boolean, string, readonly string[], Record<string, number | string | boolean>][] = [
        ["EMPTY_EXECUTIVE_STATE", entitySummary.totalEntityCount === 0, "total_entity_count_equals_zero", [], { totalEntityCount: entitySummary.totalEntityCount }],
        ["HAS_CONFLICTS", source.conflicts.length > 0, "conflict_count_greater_than_zero", source.conflicts.map(({ conflictId }) => conflictId), { conflictCount: source.conflicts.length }],
        ["HAS_INFORMATION_GAPS", source.gaps.length > 0, "gap_count_greater_than_zero", source.gaps.map(({ gapId }) => gapId), { gapCount: source.gaps.length }],
        ["HAS_UNKNOWN_VALUES", source.gaps.some(({ type }) => type === "explicit_unknown"), "explicit_unknown_gap_exists", source.gaps.map(({ gapId }) => gapId), { unknownValueCount: source.gaps.filter(({ type }) => type === "explicit_unknown").length }],
        ["HAS_MULTIPLE_SOURCES", sourceIds.length > 1, "distinct_source_count_greater_than_one", sourceIds, { sourceCount: sourceIds.length }],
      ];
      const deterministicConditions: ExecutiveContextCondition[] = conditionSpecs.filter(([, active]) => active).map(([type, , rule, ids, values]) => ({ conditionId: identity("executive-context-condition", [source.snapshotId, type, rule, ids, values]), type, rule, supportingCanonicalIdentities: uniqueOrdered(ids), supportingValues: values, sourceSnapshotId: source.snapshotId, observedAt: source.observedAt })).sort((a, b) => compareText(a.conditionId, b.conditionId));
      const evidenceValues: readonly [string, number][] = [["total_entity_count", entitySummary.totalEntityCount], ["relationship_count", source.relationships.length], ["conflict_count", source.conflicts.length], ["gap_count", source.gaps.length], ["distinct_source_count", sourceIds.length], ["provenance_coverage", provenanceCoverage]];
      const calculationEvidence: ContextMeasureEvidence[] = evidenceValues.map(([rule, outputValue]) => ({ evidenceId: identity("context-evidence", [source.snapshotId, rule, outputValue]), rule, inputIdentities: [source.snapshotId], inputValues: { sourceArtifactCount: source.artifacts.length }, outputValue, ruleVersion: RULE_VERSION })).sort((a, b) => compareText(a.evidenceId, b.evidenceId));
      const content = { sourceStateIdentity: { snapshotId: source.snapshotId, contractVersion: source.metadata.canonicalContractVersion, observedAt: source.observedAt, lifecycleSnapshotId: source.lifecycleSnapshotId, previousLifecycleSnapshotId: source.previousLifecycleSnapshotId, assemblyVersion: source.metadata.assemblyVersion }, observedAt: source.observedAt, referenceTime: input.referenceTime, lifecycle: { lifecycleSnapshotId: source.lifecycleSnapshotId, previousLifecycleSnapshotId: source.previousLifecycleSnapshotId }, entitySummary, relationshipContext, sourceContext, conflictContext, gapContext, deterministicConditions, calculationEvidence, derivationMetadata: { contractVersion: EXECUTIVE_CONTEXT_CONTRACT_VERSION, engineVersion: EXECUTIVE_CONTEXT_ENGINE_VERSION, ruleVersion: RULE_VERSION } };
      const snapshot: ExecutiveContextSnapshot = { contextId: identity("executive-context-snapshot", content), ...content };
      if (!snapshot.contextId || snapshot.calculationEvidence.some(({ outputValue }) => !Number.isFinite(outputValue))) return failure("context_validation", "CONTEXT_VALIDATION_FAILURE", "valid_context_snapshot", "derived context validation failed", source.snapshotId);
      return deepFreeze({ outcome: "success", snapshot: clone(snapshot) });
    } catch (error) { return failure("derivation", "DERIVATION_FAILURE", "deterministic_context_derivation", error instanceof Error ? error.message : "context derivation failed", source.snapshotId); }
  }
}
