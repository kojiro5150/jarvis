import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { goldenRuntimeInput } from "../../../tests/fixtures/eos/golden-projection-artifact-set";
import {
  DeterministicExecutiveOperatingSystemRuntime,
  EXECUTIVE_OPERATING_SYSTEM_STAGE_ORDER,
  ExecutiveOperatingSystemRuntimeError,
} from "../runtime";
import {
  composeExecutiveOperationalResult,
  composeExecutiveOperationalState,
  EXECUTIVE_OPERATIONAL_STATE_SCHEMA_VERSION,
} from ".";

describe("ExecutiveOperationalState", () => {
  it("publishes exactly one immutable state after each terminal run record", () => {
    const runtimeResult = new DeterministicExecutiveOperatingSystemRuntime().run(goldenRuntimeInput);
    const operationalResult = composeExecutiveOperationalResult(runtimeResult.executiveRunRecord);

    expect(Object.keys(operationalResult)).toEqual([
      "executiveRunRecord",
      "executiveOperationalState",
      "executiveSession",
    ]);
    expect(operationalResult.executiveOperationalState.latestRun.executiveRunRecordId).toBe(
      runtimeResult.executiveRunRecord.executiveRunRecordId,
    );
    expect(Object.isFrozen(operationalResult)).toBe(true);
    expect(Object.isFrozen(operationalResult.executiveOperationalState)).toBe(true);
    expect(Object.isFrozen(operationalResult.executiveOperationalState.executionOutcome)).toBe(true);
    expect(Object.isFrozen(operationalResult.executiveOperationalState.reasoningReferences)).toBe(true);
  });

  it("has deterministic identity and replay derived from only the three identity inputs", () => {
    const record = new DeterministicExecutiveOperatingSystemRuntime().run(
      goldenRuntimeInput,
    ).executiveRunRecord;
    const first = composeExecutiveOperationalState(record);
    const replay = composeExecutiveOperationalState(record);

    expect(replay).toEqual(first);
    expect(replay.operationalStateId).toBe(first.operationalStateId);
    expect(first.operationalStateId).toMatch(/^executive-operational-state:[a-f0-9]{64}$/);
    expect(first.schemaVersion).toBe(EXECUTIVE_OPERATIONAL_STATE_SCHEMA_VERSION);

    const nextRecord = {
      ...record,
      executiveRunRecordId: `${record.executiveRunRecordId}:next`,
    };
    expect(composeExecutiveOperationalState(nextRecord).operationalStateId).not.toBe(
      first.operationalStateId,
    );
  });

  it("references constitutional publications without reconstructing their payloads", () => {
    const result = new DeterministicExecutiveOperatingSystemRuntime().run(goldenRuntimeInput);
    const state = composeExecutiveOperationalState(result.executiveRunRecord);

    expect(state.executiveIdentity.executiveStateSnapshotIds).toEqual([
      result.executiveState.snapshotId,
    ]);
    expect(state.situationalSummaryReferences.executiveSituationSetIds).toEqual(
      result.executiveRunRecord.publicationReferences.find(
        ({ publicationType }) => publicationType === "ExecutiveSituationSet",
      )?.publicationIds,
    );
    expect(state.reasoningReferences.executiveReasoningRecordIds).toEqual([
      result.reasoning.reasoningRecordId,
    ]);
    expect(state.proposalReferences.governedActionProposalSetIds).toEqual([
      result.proposals.proposalSetId,
    ]);
    expect(state.executionOutcome.capabilityExecutionResultIds).toEqual([
      result.capabilityExecutionResult.executionResultId,
    ]);
    expect(state).not.toHaveProperty("reasoning");
    expect(state).not.toHaveProperty("proposals");
    expect(state).not.toHaveProperty("assessment");
    expect(state).not.toHaveProperty("routingDecision");
    expect(state).not.toHaveProperty("executionPayload");
  });

  it("projects failed run health without fabricating absent publications", () => {
    const invalidReferenceTime = {
      ...goldenRuntimeInput,
      referenceTime: "2030-01-14T09:00:00Z",
    };

    try {
      new DeterministicExecutiveOperatingSystemRuntime().run(invalidReferenceTime);
      throw new Error("expected runtime failure");
    } catch (error) {
      expect(error).toBeInstanceOf(ExecutiveOperatingSystemRuntimeError);
      const record = (error as ExecutiveOperatingSystemRuntimeError).executiveRunRecord!;
      const state = composeExecutiveOperationalState(record);
      expect(state.operationalStatus).toBe("runtime_failed");
      expect(state.runtimeHealth).toEqual({ status: "failed", failureCount: 1 });
      expect(state.reasoningReferences.executiveReasoningRecordIds).toEqual([]);
      expect(state.executionOutcome.capabilityExecutionResultIds).toEqual([]);
    }
  });

  it("enforces the runtime boundary without extending or re-entering the runtime", () => {
    const result = new DeterministicExecutiveOperatingSystemRuntime().run(goldenRuntimeInput);
    const stageIdsBeforeProjection = result.trace.stages.map(({ stageId }) => stageId);
    composeExecutiveOperationalState(result.executiveRunRecord);

    expect(stageIdsBeforeProjection).toEqual(EXECUTIVE_OPERATING_SYSTEM_STAGE_ORDER);
    expect(stageIdsBeforeProjection.at(-1)).toBe("executive_run_record");
    expect(result.trace.stages.map(({ stageId }) => stageId)).toEqual(stageIdsBeforeProjection);

    const composerSource = readFileSync(new URL("./composer.ts", import.meta.url), "utf8");
    expect(composerSource).not.toMatch(/from ["'][^"']*\/runtime\/engine["']/);
    expect(composerSource).not.toContain("DeterministicExecutiveOperatingSystemRuntime");
  });
});
