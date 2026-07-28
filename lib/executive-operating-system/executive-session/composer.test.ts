import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { goldenRuntimeInput } from "../../../tests/fixtures/eos/golden-projection-artifact-set";
import { composeExecutiveOperationalResult, composeExecutiveOperationalState } from "../operational-state";
import { DeterministicExecutiveOperatingSystemRuntime, EXECUTIVE_OPERATING_SYSTEM_STAGE_ORDER } from "../runtime";
import {
  composeExecutiveSession,
  EXECUTIVE_INTERACTION_MODES,
  EXECUTIVE_SESSION_SCHEMA_VERSION,
} from ".";

function operationalState() {
  const record = new DeterministicExecutiveOperatingSystemRuntime().run(goldenRuntimeInput).executiveRunRecord;
  return composeExecutiveOperationalState(record);
}

describe("ExecutiveSession", () => {
  it("composes exactly one deeply immutable session in the operational result", () => {
    const record = new DeterministicExecutiveOperatingSystemRuntime().run(goldenRuntimeInput).executiveRunRecord;
    const result = composeExecutiveOperationalResult(record);

    expect(Object.keys(result).filter((key) => key === "executiveSession")).toHaveLength(1);
    expect(Object.isFrozen(result.executiveSession)).toBe(true);
    expect(Object.isFrozen(result.executiveSession.specialistContext)).toBe(true);
    expect(Object.isFrozen(result.executiveSession.activeExecutiveCapabilities.routingPlanReferences)).toBe(true);
    expect(result.executiveSession.executiveOperationalStateId).toBe(result.executiveOperationalState.operationalStateId);
  });

  it("has deterministic identity and replay from only state identity and schema version", () => {
    const state = operationalState();
    const first = composeExecutiveSession(state);
    const replay = composeExecutiveSession(state);

    expect(replay).toEqual(first);
    expect(first.executiveSessionId).toMatch(/^executive-session:[a-f0-9]{64}$/);
    expect(first.schemaVersion).toBe(EXECUTIVE_SESSION_SCHEMA_VERSION);
    expect(first.createdAt).toBe(state.latestRun.runtimeCompletionTimestamp);
    expect(composeExecutiveSession({ ...state, operationalStateId: `${state.operationalStateId}:next` }).executiveSessionId).not.toBe(first.executiveSessionId);
  });

  it("retains references without operational or runtime payload reconstruction", () => {
    const state = operationalState();
    const session = composeExecutiveSession(state);

    expect(session.activeExecutiveObjectiveReference).toBe(state.proposalReferences.governedActionProposalSetIds[0]);
    expect(session.activeExecutiveCapabilities.routingPlanReferences).toEqual(state.capabilityAvailability.routingPlanIds);
    expect(session.runtimeCompletionReference.executiveRunRecordId).toBe(state.latestRun.executiveRunRecordId);
    expect(session).not.toHaveProperty("executiveOperationalState");
    expect(session).not.toHaveProperty("executiveRunRecord");
    expect(session).not.toHaveProperty("reasoning");
    expect(session).not.toHaveProperty("proposals");
    expect(session).not.toHaveProperty("runtimePublications");
  });

  it("assigns only valid deterministic modes and keeps specialist context inert", () => {
    const state = operationalState();
    const executive = composeExecutiveSession(state);
    const idle = composeExecutiveSession({ ...state, proposalReferences: { governedActionProposalSetIds: [] } });
    const observation = composeExecutiveSession({ ...state, runtimeHealth: { status: "failed", failureCount: 1 } });

    expect(executive.interactionMode).toBe("EXECUTIVE");
    expect(idle.interactionMode).toBe("IDLE");
    expect(observation.interactionMode).toBe("OBSERVATION");
    for (const session of [executive, idle, observation]) expect(EXECUTIVE_INTERACTION_MODES).toContain(session.interactionMode);
    expect(executive.specialistContext).toEqual({ activeSpecialistIdentity: null, specialistRoleReference: null, specialistHandoffReference: null });
    expect(Object.isFrozen(executive.specialistContext)).toBe(true);
  });

  it("preserves the one-way foundation and never imports runtime engines", () => {
    expect(EXECUTIVE_OPERATING_SYSTEM_STAGE_ORDER.at(-1)).toBe("executive_run_record");
    const composer = readFileSync(new URL("./composer.ts", import.meta.url), "utf8");
    const runtimeEngine = readFileSync(new URL("../runtime/engine.ts", import.meta.url), "utf8");
    expect(composer).toContain('from "../operational-state"');
    expect(composer).not.toMatch(/from ["'][^"']*runtime/);
    expect(composer).not.toContain("DeterministicExecutiveOperatingSystemRuntime");
    expect(runtimeEngine).not.toContain("executive-session");
    expect(runtimeEngine).not.toContain("operational-state");
  });
});
