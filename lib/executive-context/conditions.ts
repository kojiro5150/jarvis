import type { ExecutiveStateSnapshot } from "../executive-operating-system/situational-awareness/assembly";
import { compareCodeUnits, stableIdentity } from "./identity";
import type { DeterministicCondition, DeterministicConditionType, ExecutiveContextMeasures } from "./types";

export function deriveConditions(source: ExecutiveStateSnapshot, measures: ExecutiveContextMeasures): readonly DeterministicCondition[] {
  const entityCount = source.state.roles.length + source.state.projects.length + source.state.commitments.length
    + source.state.waitingItems.length + source.state.priorities.length + source.state.activeWork.length;
  const definitions: readonly [DeterministicConditionType, boolean, readonly string[], Record<string, number | boolean>][] = [
    ["EMPTY_EXECUTIVE_STATE", entityCount === 0, [source.snapshotId], { entityCount }],
    ["HAS_CONFLICTS", measures.conflictCount > 0, source.conflicts.map((x) => x.conflictId), { conflictCount: measures.conflictCount }],
    ["HAS_INFORMATION_GAPS", measures.gapCount > 0, source.gaps.map((x) => x.gapId), { gapCount: measures.gapCount }],
    ["HAS_UNKNOWN_VALUES", measures.unknownValueCount > 0, source.gaps.filter((x) => x.type === "explicit_unknown").map((x) => x.gapId), { unknownValueCount: measures.unknownValueCount }],
    ["HAS_MULTIPLE_SOURCES", measures.sourceCount > 1, [...new Set(source.metadata.sourceIds)], { sourceCount: measures.sourceCount }],
    ["HAS_UNRESOLVED_REFERENCES", false, [], { unresolvedReferenceCount: 0 }],
  ];
  return definitions.filter(([, present]) => present).map(([type, , ids, values]) => ({ conditionId: stableIdentity("executive-context-condition", [source.snapshotId, type, ids, values]), type, ruleId: `context.condition.${type}.v1`, sourceSnapshotId: source.snapshotId, observedAt: source.observedAt, supportingIdentities: [...ids].sort(compareCodeUnits), supportingValues: values })).sort((a, b) => compareCodeUnits(a.conditionId, b.conditionId));
}
