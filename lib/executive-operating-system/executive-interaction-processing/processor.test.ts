import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { goldenRuntimeInput } from "../../../tests/fixtures/eos/golden-projection-artifact-set";
import { composeExecutiveInteractionContract, type ExecutiveInteractionContract } from "../executive-interaction";
import { composeExecutiveOperationalResult } from "../operational-state";
import { DeterministicExecutiveOperatingSystemRuntime } from "../runtime";
import { processExecutiveInteraction } from ".";

function contract(): ExecutiveInteractionContract {
  const record = new DeterministicExecutiveOperatingSystemRuntime().run(goldenRuntimeInput).executiveRunRecord;
  return composeExecutiveOperationalResult(record).executiveInteractionContract;
}

function reidentify(value: ExecutiveInteractionContract): ExecutiveInteractionContract {
  const { interactionContractId: ignored, ...body } = value;
  return {
    interactionContractId: `executive-interaction-contract:${createHash("sha256").update(JSON.stringify(body)).digest("hex")}`,
    ...body,
  };
}

describe("ExecutiveInteractionProcessor", () => {
  it("publishes exactly one immutable, deterministic, content-addressed result", () => {
    const input = contract();
    const first = processExecutiveInteraction(input);
    const replay = processExecutiveInteraction(input);
    const { interactionResultId, ...body } = first;
    expect(replay).toEqual(first);
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.validationFindings)).toBe(true);
    expect(interactionResultId).toBe(`executive-interaction-result:${createHash("sha256").update(JSON.stringify(body)).digest("hex")}`);
    const operationalResult = composeExecutiveOperationalResult(
      new DeterministicExecutiveOperatingSystemRuntime().run(goldenRuntimeInput).executiveRunRecord,
    );
    expect(Object.keys(operationalResult).filter((key) => key === "executiveInteractionResult")).toHaveLength(1);
  });

  it("references the contract only and does not reconstruct foundation payloads", () => {
    const result = processExecutiveInteraction(contract());
    expect(result.interactionContractId).toBe(contract().interactionContractId);
    for (const field of ["executiveInteractionContract", "executiveSession", "executiveOperationalState", "executiveRunRecord", "conversation", "reasoning", "execution"]) {
      expect(result).not.toHaveProperty(field);
    }
    const processor = readFileSync(new URL("./processor.ts", import.meta.url), "utf8");
    expect(processor).not.toMatch(/from ["'][^"']*(runtime|operational-state|executive-session)/);
    expect(processor).toContain('from "../executive-interaction"');
  });

  it("derives READY, READ_ONLY, and UNAVAILABLE by explicit rules", () => {
    const ready = contract();
    const readOnly = reidentify({ ...ready, interactionMode: "OBSERVATION" });
    const unavailable = { ...ready, schemaVersion: "unsupported" } as unknown as ExecutiveInteractionContract;
    expect(processExecutiveInteraction(ready).interactionReadiness).toBe("READY");
    expect(processExecutiveInteraction(readOnly).interactionReadiness).toBe("READ_ONLY");
    expect(processExecutiveInteraction(unavailable).interactionReadiness).toBe("UNAVAILABLE");
  });

  it.each([
    ["schema", (c: ExecutiveInteractionContract) => ({ ...c, schemaVersion: "bad" }), "UNSUPPORTED_SCHEMA_VERSION"],
    ["ownership", (c: ExecutiveInteractionContract) => ({ ...c, metadata: { ...c.metadata, owner: "bad" } }), "INVALID_METADATA"],
    ["metadata", (c: ExecutiveInteractionContract) => ({ ...c, metadata: { ...c.metadata, deterministic: false } }), "INVALID_METADATA"],
    ["authority", (c: ExecutiveInteractionContract) => ({ ...c, authorityBoundaries: { ...c.authorityBoundaries, humanAuthority: "bad" } }), "INVALID_AUTHORITY_BOUNDARIES"],
    ["constraints", (c: ExecutiveInteractionContract) => ({ ...c, interactionConstraints: { ...c.interactionConstraints, mayExecute: true } }), "INVALID_INTERACTION_CONSTRAINTS"],
    ["references", (c: ExecutiveInteractionContract) => ({ ...c, sessionIdentityReference: { executiveSessionId: "" } }), "INVALID_REQUIRED_REFERENCES"],
  ])("returns deterministic findings for invalid %s without throwing", (_name, mutate, code) => {
    const invalid = mutate(contract()) as unknown as ExecutiveInteractionContract;
    const first = processExecutiveInteraction(invalid);
    expect(first).toEqual(processExecutiveInteraction(invalid));
    expect(first.processingStatus).toBe("VALIDATION_FAILED");
    expect(first.validationFindings.map(({ code: findingCode }) => findingCode)).toContain(code);
    expect(first.validationFindings).toContainEqual(expect.objectContaining({ severity: "ERROR", affectedField: expect.any(String), message: expect.any(String) }));
  });
});
