import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { goldenRuntimeInput } from "../../../tests/fixtures/eos/golden-projection-artifact-set";
import { composeExecutiveOperationalResult } from "../operational-state";
import type { ExecutiveSession } from "../executive-session";
import { DeterministicExecutiveOperatingSystemRuntime } from "../runtime";
import {
  composeExecutiveInteractionContract,
  EXECUTIVE_INTERACTION_CHANNELS,
  EXECUTIVE_INTERACTION_CONTRACT_SCHEMA_VERSION,
} from ".";

function foundation() {
  const record = new DeterministicExecutiveOperatingSystemRuntime().run(goldenRuntimeInput)
    .executiveRunRecord;
  return composeExecutiveOperationalResult(record);
}

describe("ExecutiveInteractionContract", () => {
  it("publishes exactly one deeply immutable contract per session", () => {
    const result = foundation();
    const contract = result.executiveInteractionContract;

    expect(Object.keys(result).filter((key) => key === "executiveInteractionContract")).toHaveLength(1);
    expect(Object.isFrozen(contract)).toBe(true);
    expect(Object.isFrozen(contract.channelAvailability)).toBe(true);
    expect(Object.isFrozen(contract.channelAvailability[0])).toBe(true);
    expect(Object.isFrozen(contract.capabilityAvailability.routingPlanReferences)).toBe(true);
    expect(contract.sessionIdentityReference.executiveSessionId).toBe(
      result.executiveSession.executiveSessionId,
    );
  });

  it("has deterministic identity and replay for identical sessions", () => {
    const { executiveSession } = foundation();
    const first = composeExecutiveInteractionContract(executiveSession);
    const replay = composeExecutiveInteractionContract(executiveSession);

    expect(replay).toEqual(first);
    expect(first.interactionContractId).toMatch(/^executive-interaction-contract:[a-f0-9]{64}$/);
    expect(first.schemaVersion).toBe(EXECUTIVE_INTERACTION_CONTRACT_SCHEMA_VERSION);
    expect(
      composeExecutiveInteractionContract({
        ...executiveSession,
        executiveSessionId: `${executiveSession.executiveSessionId}:next`,
      }).interactionContractId,
    ).not.toBe(first.interactionContractId);
  });

  it("binds every session field consumed by the contract into contract identity", () => {
    const { executiveSession } = foundation();
    const originalId = composeExecutiveInteractionContract(executiveSession).interactionContractId;
    const variants: ExecutiveSession[] = [
      { ...executiveSession, createdAt: "2031-01-01T00:00:00.000Z" },
      {
        ...executiveSession,
        currentExecutiveIdentity: { executiveStateSnapshotId: "executive-state:changed" },
      },
      { ...executiveSession, interactionMode: "OBSERVATION" },
      {
        ...executiveSession,
        specialistContext: {
          ...executiveSession.specialistContext,
          activeSpecialistIdentity: "specialist:changed",
        },
      },
      {
        ...executiveSession,
        specialistContext: {
          ...executiveSession.specialistContext,
          specialistRoleReference: "role:changed",
        },
      },
      {
        ...executiveSession,
        specialistContext: {
          ...executiveSession.specialistContext,
          specialistHandoffReference: "handoff:changed",
        },
      },
      {
        ...executiveSession,
        activeExecutiveCapabilities: {
          ...executiveSession.activeExecutiveCapabilities,
          routingPlanReferences: ["routing:changed"],
        },
      },
      {
        ...executiveSession,
        activeExecutiveCapabilities: {
          ...executiveSession.activeExecutiveCapabilities,
          invocationHandoffReferences: ["invocation-handoff:changed"],
        },
      },
      {
        ...executiveSession,
        runtimeCompletionReference: {
          ...executiveSession.runtimeCompletionReference,
          executiveRunRecordId: "executive-run-record:changed",
        },
      },
      {
        ...executiveSession,
        runtimeCompletionReference: {
          ...executiveSession.runtimeCompletionReference,
          completedAt: "2031-01-01T00:00:00.000Z",
        },
      },
      {
        ...executiveSession,
        executiveOperationalStateId: "executive-operational-state:changed",
      },
    ];

    for (const variant of variants) {
      expect(variant.executiveSessionId).toBe(executiveSession.executiveSessionId);
      expect(composeExecutiveInteractionContract(variant).interactionContractId).not.toBe(
        originalId,
      );
    }

    const objectiveOnly = composeExecutiveInteractionContract({
      ...executiveSession,
      activeExecutiveObjectiveReference: "objective:not-exposed-by-contract",
    });
    expect(objectiveOnly).toEqual(composeExecutiveInteractionContract(executiveSession));
    expect(objectiveOnly).not.toHaveProperty("activeExecutiveObjectiveReference");
  });

  it("prevents a shared session id with different mode from aliasing a contract identity", () => {
    const { executiveSession } = foundation();
    const observationSession: ExecutiveSession = {
      ...executiveSession,
      interactionMode: "OBSERVATION",
    };
    const executiveContract = composeExecutiveInteractionContract(executiveSession);
    const observationContract = composeExecutiveInteractionContract(observationSession);

    expect(observationSession.executiveSessionId).toBe(executiveSession.executiveSessionId);
    expect(observationContract.interactionMode).not.toBe(executiveContract.interactionMode);
    expect(observationContract.interactionContractId).not.toBe(
      executiveContract.interactionContractId,
    );
  });

  it("rejects mutation of every contract-relevant category after identity generation", () => {
    const contract = foundation().executiveInteractionContract;

    expect(() => Object.assign(contract, { interactionMode: "IDLE" })).toThrow(TypeError);
    expect(() =>
      Object.assign(contract.sessionIdentityReference, { executiveSessionId: "changed" }),
    ).toThrow(TypeError);
    expect(() =>
      Object.assign(contract.executiveIdentityReference, {
        executiveStateSnapshotId: "changed",
      }),
    ).toThrow(TypeError);
    expect(() => Object.assign(contract.channelAvailability[0], { available: false })).toThrow(
      TypeError,
    );
    expect(() =>
      (contract.capabilityAvailability.routingPlanReferences as string[]).push("changed"),
    ).toThrow(TypeError);
    expect(() =>
      Object.assign(contract.permittedSpecialistReferences, {
        activeSpecialistIdentity: "changed",
      }),
    ).toThrow(TypeError);
    expect(() => Object.assign(contract.interactionConstraints, { mayExecute: true })).toThrow(
      TypeError,
    );
    expect(() =>
      Object.assign(contract.authorityBoundaries, { grantsAdditionalAuthority: true }),
    ).toThrow(TypeError);
    expect(() =>
      Object.assign(contract.runtimeCompletionReference, { completedAt: "changed" }),
    ).toThrow(TypeError);
    expect(() =>
      Object.assign(contract.operationalStateReference, {
        executiveOperationalStateId: "changed",
      }),
    ).toThrow(TypeError);
    expect(() => Object.assign(contract.metadata, { deterministic: false })).toThrow(TypeError);
  });

  it("hashes the exact published body and commits every canonical content category", () => {
    const contract = foundation().executiveInteractionContract;
    const { interactionContractId, ...publishedBody } = contract;
    const contentId = (body: unknown) =>
      `executive-interaction-contract:${createHash("sha256")
        .update(JSON.stringify(body))
        .digest("hex")}`;

    expect(interactionContractId).toBe(contentId(publishedBody));

    const variants = [
      { ...publishedBody, interactionMode: "IDLE" },
      {
        ...publishedBody,
        executiveIdentityReference: { executiveStateSnapshotId: "changed" },
      },
      {
        ...publishedBody,
        channelAvailability: [{ channel: "CHAT", available: false }],
      },
      {
        ...publishedBody,
        capabilityAvailability: {
          ...publishedBody.capabilityAvailability,
          routingPlanReferences: ["changed"],
        },
      },
      {
        ...publishedBody,
        permittedSpecialistReferences: {
          ...publishedBody.permittedSpecialistReferences,
          activeSpecialistIdentity: "changed",
        },
      },
      {
        ...publishedBody,
        interactionConstraints: { ...publishedBody.interactionConstraints, mayExecute: true },
      },
      {
        ...publishedBody,
        authorityBoundaries: {
          ...publishedBody.authorityBoundaries,
          grantsAdditionalAuthority: true,
        },
      },
      {
        ...publishedBody,
        runtimeCompletionReference: {
          ...publishedBody.runtimeCompletionReference,
          completedAt: "changed",
        },
      },
      {
        ...publishedBody,
        operationalStateReference: { executiveOperationalStateId: "changed" },
      },
      { ...publishedBody, metadata: { ...publishedBody.metadata, deterministic: false } },
    ];

    for (const variant of variants) expect(contentId(variant)).not.toBe(interactionContractId);
  });

  it("retains bounded references without reconstructing foundation payloads", () => {
    const result = foundation();
    const contract = result.executiveInteractionContract;

    expect(contract.operationalStateReference.executiveOperationalStateId).toBe(
      result.executiveOperationalState.operationalStateId,
    );
    expect(contract.runtimeCompletionReference).toEqual(
      result.executiveSession.runtimeCompletionReference,
    );
    expect(contract.capabilityAvailability).toEqual(
      result.executiveSession.activeExecutiveCapabilities,
    );
    for (const excluded of [
      "executiveSession",
      "executiveOperationalState",
      "executiveRunRecord",
      "reasoning",
      "execution",
      "conversation",
      "prompts",
    ]) {
      expect(contract).not.toHaveProperty(excluded);
    }
  });

  it("preserves explicit authority and ownership boundaries", () => {
    const contract = foundation().executiveInteractionContract;

    expect(contract.authorityBoundaries).toEqual({
      humanAuthority: "FINAL",
      approvalBoundary: "EXPLICIT_APPROVAL_REQUIRED",
      runtimeOwner: "ConstitutionalRuntime",
      operationalOwner: "ExecutiveOperationalStateComposer",
      sessionOwner: "ExecutiveSessionComposer",
      grantsAdditionalAuthority: false,
    });
    expect(contract.interactionConstraints).toEqual({
      mayExecute: false,
      mayRoute: false,
      mayPlan: false,
      mayReason: false,
      mayMutateSession: false,
      mayBypassFoundation: false,
    });
  });

  it("publishes valid channels and deterministic capability references", () => {
    const first = foundation().executiveInteractionContract;
    const replay = foundation().executiveInteractionContract;

    expect(first.channelAvailability.map(({ channel }) => channel)).toEqual(
      EXECUTIVE_INTERACTION_CHANNELS,
    );
    expect(first.channelAvailability.every(({ available }) => available)).toBe(true);
    expect(replay.channelAvailability).toEqual(first.channelAvailability);
    expect(replay.capabilityAvailability).toEqual(first.capabilityAvailability);
  });

  it("enforces the one-way interface boundary at the package level", () => {
    const composer = readFileSync(new URL("./composer.ts", import.meta.url), "utf8");
    const sessionComposer = readFileSync(new URL("../executive-session/composer.ts", import.meta.url), "utf8");
    const runtimeEngine = readFileSync(new URL("../runtime/engine.ts", import.meta.url), "utf8");

    expect(composer).toContain('from "../executive-session"');
    expect(composer).not.toMatch(/from ["'][^"']*operational-state/);
    expect(composer).not.toMatch(/from ["'][^"']*runtime/);
    expect(composer).not.toContain("DeterministicExecutiveOperatingSystemRuntime");
    expect(sessionComposer).not.toContain("executive-interaction");
    expect(runtimeEngine).not.toContain("executive-interaction");
  });
});
