import { describe, expect, it } from "vitest";
import type { ExecutiveContextSnapshot } from "../../executive-context";
import { ExecutiveCapabilityRegistry, ExecutiveCapabilityRouter } from ".";

const context = (conditions: ExecutiveContextSnapshot["deterministicConditions"]): ExecutiveContextSnapshot => ({
  contextId: "context:1",
  sourceStateIdentity: { snapshotId: "snapshot:1", contractVersion: "projection-artifact-v1", observedAt: "2026-01-01T00:00:00.000Z", lifecycleSnapshotId: "lifecycle:1", previousLifecycleSnapshotId: "lifecycle:0", assemblyVersion: "1.0.0" },
  observedAt: "2026-01-01T00:00:00.000Z", referenceTime: "2026-01-01T00:00:00.000Z",
  lifecycle: { lifecycleSnapshotId: "lifecycle:1", previousLifecycleSnapshotId: "lifecycle:0" },
  entitySummary: { totalEntityCount: 0, roleCount: 0, projectCount: 0, commitmentCount: 0, waitingItemCount: 0, explicitPriorityCount: 0, activeWorkCount: 0 },
  relationshipContext: { totalRelationshipCount: 0, byRole: [], byProject: [] },
  sourceContext: { sourceCount: 0, sourceIds: [], artifactsBySource: {}, adapterIds: [], completeProvenanceCount: 0, provenanceCoverage: 0, oldestObservationAgeMilliseconds: null, newestObservationAgeMilliseconds: null },
  conflictContext: { totalCount: 0, recordIds: [], byType: {} }, gapContext: { totalCount: 0, recordIds: [], byType: {} },
  deterministicConditions: conditions, calculationEvidence: [],
  derivationMetadata: { contractVersion: "executive-context-v1", engineVersion: "1.0.0", ruleVersion: "1.0.0" },
});

const condition = (conditionId: string): ExecutiveContextSnapshot["deterministicConditions"][number] => ({
  conditionId, type: "HAS_CONFLICTS", rule: "test", supportingCanonicalIdentities: [], supportingValues: {}, sourceSnapshotId: "snapshot:1", observedAt: "2026-01-01T00:00:00.000Z",
});

describe("ExecutiveCapabilityRouter", () => {
  it("matches stable condition types and retains condition ids as evidence", () => {
    const capability = { capabilityId: "conflict.review", capabilityVersion: "1", status: "active" as const, dependencyCapabilityIds: [] };
    const scenario = { scenarioId: "daily", capabilityIds: [capability.capabilityId] };
    const policy = { policyId: "governed", eligibleCapabilityIds: [capability.capabilityId] };
    const registry = new ExecutiveCapabilityRegistry([capability], [scenario], [policy], [{ routingRuleId: "on-conflict", capabilityId: capability.capabilityId, conditionTypes: ["HAS_CONFLICTS"] }]);
    const first = new ExecutiveCapabilityRouter(registry).route({ executiveContext: context([condition("condition:a")]), scenario, policy });
    const second = new ExecutiveCapabilityRouter(registry).route({ executiveContext: context([condition("condition:b")]), scenario, policy });
    expect(first.executiveStateSnapshotId).toBe("snapshot:1");
    expect(first.executiveContextContractVersion).toBe("executive-context-v1");
    expect(first.routedCapabilities[0]?.supportingConditionIds).toEqual(["condition:a"]);
    expect(second.routedCapabilities[0]?.supportingConditionIds).toEqual(["condition:b"]);
  });

  it("reports inactive, denied, and unmatched requested capabilities as unresolved", () => {
    const capabilities = [
      { capabilityId: "inactive", capabilityVersion: "1", status: "inactive" as const, dependencyCapabilityIds: [] },
      { capabilityId: "denied", capabilityVersion: "1", status: "active" as const, dependencyCapabilityIds: [] },
      { capabilityId: "unmatched", capabilityVersion: "1", status: "active" as const, dependencyCapabilityIds: [] },
    ];
    const scenario = { scenarioId: "all", capabilityIds: capabilities.map((value) => value.capabilityId) };
    const policy = { policyId: "limited", eligibleCapabilityIds: ["inactive", "unmatched"] };
    const rules = capabilities.map((value) => ({ routingRuleId: `rule:${value.capabilityId}`, capabilityId: value.capabilityId, conditionTypes: ["HAS_CONFLICTS" as const] }));
    const result = new ExecutiveCapabilityRouter(new ExecutiveCapabilityRegistry(capabilities, [scenario], [policy], rules)).route({ executiveContext: context([]), scenario, policy });
    expect(result.unresolvedCapabilities).toEqual([
      { capabilityId: "denied", reason: "not_permitted" },
      { capabilityId: "inactive", reason: "inactive" },
      { capabilityId: "unmatched", reason: "conditions_not_met" },
    ]);
  });

  it("rejects every unknown reference and dependency cycles at publication", () => {
    const capability = { capabilityId: "known", capabilityVersion: "1", status: "active" as const, dependencyCapabilityIds: [] };
    expect(() => new ExecutiveCapabilityRegistry([capability], [{ scenarioId: "bad", capabilityIds: ["unknown"] }], [], [])).toThrow("unknown capability id");
    expect(() => new ExecutiveCapabilityRegistry([capability], [], [{ policyId: "bad", eligibleCapabilityIds: ["unknown"] }], [])).toThrow("unknown capability id");
    expect(() => new ExecutiveCapabilityRegistry([capability], [], [], [{ routingRuleId: "bad", capabilityId: "unknown", conditionTypes: ["HAS_CONFLICTS"] }])).toThrow("unknown capability id");
    expect(() => new ExecutiveCapabilityRegistry([
      { ...capability, dependencyCapabilityIds: ["other"] },
      { ...capability, capabilityId: "other", dependencyCapabilityIds: ["known"] },
    ], [], [], [])).toThrow("dependency cycle");
  });
});
