import { deriveConditions } from "./conditions";
import { executiveContextIdentity } from "./identity";
import { deriveEntitySummary, deriveMeasures, deriveRelationshipGroups, deriveSourceContext } from "./measures";
import {
  EXECUTIVE_CONTEXT_CONTRACT_VERSION, EXECUTIVE_CONTEXT_ENGINE_VERSION, EXECUTIVE_CONTEXT_RULE_VERSION,
  type ExecutiveContextDerivationInput, type ExecutiveContextFailure, type ExecutiveContextResult,
} from "./types";
import { deepFreeze, publishContext, validTimestamp, validateSourceState } from "./validation";

const countBy = (values: readonly { type: string }[]): Readonly<Record<string, number>> => Object.freeze(values.reduce<Record<string, number>>((out, value) => { out[value.type] = (out[value.type] ?? 0) + 1; return out; }, {}));
const failure = (stage: ExecutiveContextFailure["stage"], code: ExecutiveContextFailure["code"], rule: string, message: string): ExecutiveContextFailure => deepFreeze({ outcome: "failure", stage, code, rule, message });

/** Pure deterministic boundary from one canonical state snapshot to one context snapshot. */
export class ExecutiveContextEngine {
  derive(input: ExecutiveContextDerivationInput): ExecutiveContextResult {
    if (!input || typeof input !== "object") return failure("input_validation", "INVALID_SOURCE_STATE", "valid_derivation_input", "derivation input is required");
    if (!validTimestamp(input.referenceTime)) return failure("input_validation", "INVALID_REFERENCE_TIME", "explicit_rfc3339_reference_time", "referenceTime must be an RFC 3339 timestamp");
    try { validateSourceState(input.sourceState); }
    catch (error) { const message = error instanceof Error ? error.message : "invalid source state"; return failure("input_validation", message.includes("unsupported") ? "UNSUPPORTED_VERSION" : "INVALID_SOURCE_STATE", "validated_executive_state_snapshot", message); }
    try {
      const source = input.sourceState, { measures, evidence } = deriveMeasures(source, input.referenceTime);
      const versions = { contractVersion: EXECUTIVE_CONTEXT_CONTRACT_VERSION, engineVersion: EXECUTIVE_CONTEXT_ENGINE_VERSION, ruleVersion: EXECUTIVE_CONTEXT_RULE_VERSION };
      const snapshot = publishContext({
        identity: { contextId: executiveContextIdentity(source.snapshotId, input.referenceTime), ...versions },
        sourceStateIdentity: { snapshotId: source.snapshotId, lifecycleSnapshotId: source.lifecycleSnapshotId, previousLifecycleSnapshotId: source.previousLifecycleSnapshotId, observedAt: source.observedAt, assemblyVersion: source.metadata.assemblyVersion, canonicalContractVersion: source.metadata.canonicalContractVersion },
        observedAt: source.observedAt, referenceTime: input.referenceTime, entitySummary: deriveEntitySummary(source), measures,
        relationshipGroups: deriveRelationshipGroups(source), sourceContext: deriveSourceContext(source),
        conflictsByType: countBy(source.conflicts), gapsByType: countBy(source.gaps),
        deterministicConditions: deriveConditions(source, measures), calculationEvidence: evidence, derivationMetadata: versions,
      });
      return deepFreeze({ outcome: "success", snapshot });
    } catch (error) { return failure("snapshot_validation", "INVALID_CONTEXT_SNAPSHOT", "atomic_valid_context_publication", error instanceof Error ? error.message : "context derivation failed"); }
  }
}
