import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { goldenRuntimeInput } from "../../../tests/fixtures/eos/golden-projection-artifact-set";
import type { ExecutiveInteractionResult } from "../executive-interaction-processing";
import { composeExecutiveOperationalResult } from "../operational-state";
import { DeterministicExecutiveOperatingSystemRuntime } from "../runtime";
import { projectExecutiveApplicationContext } from ".";

function interactionResult(): ExecutiveInteractionResult {
  const record = new DeterministicExecutiveOperatingSystemRuntime().run(goldenRuntimeInput).executiveRunRecord;
  return composeExecutiveOperationalResult(record).executiveInteractionResult;
}

describe("ExecutiveApplicationContextProjector", () => {
  it("publishes exactly one deeply immutable, deterministic, content-addressed context", () => {
    const source = interactionResult();
    const first = projectExecutiveApplicationContext(source);
    const replay = projectExecutiveApplicationContext(source);
    const { applicationContextId, ...body } = first;
    expect(replay).toEqual(first);
    expect(applicationContextId).toBe(`executive-application-context:${createHash("sha256").update(JSON.stringify(body)).digest("hex")}`);
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.readinessSummary)).toBe(true);
    expect(Object.isFrozen(first.availableChannels)).toBe(true);
    expect(Object.isFrozen(first.applicationCapabilities)).toBe(true);

    const operationalResult = composeExecutiveOperationalResult(
      new DeterministicExecutiveOperatingSystemRuntime().run(goldenRuntimeInput).executiveRunRecord,
    );
    expect(Object.keys(operationalResult).filter((key) => key === "executiveApplicationContext")).toHaveLength(1);
  });

  it("consumes only the interaction result and remains reference-only", () => {
    const source = interactionResult();
    const context = projectExecutiveApplicationContext(source);
    expect(context.interactionResultId).toBe(source.interactionResultId);
    for (const field of ["executiveInteractionResult", "executiveInteractionContract", "executiveSession", "executiveOperationalState", "executiveRunRecord", "conversation", "prompts", "memory", "reasoning", "orchestration", "execution", "interface"]) {
      expect(context).not.toHaveProperty(field);
    }
    const projector = readFileSync(new URL("./projector.ts", import.meta.url), "utf8");
    expect(projector).not.toMatch(/from ["'][^"']*(runtime|operational-state|executive-session|executive-interaction["'])/);
    expect(projector).toContain('from "../executive-interaction-processing"');
  });

  it("publishes safe unavailable context for a non-canonical source", () => {
    const invalid = { ...interactionResult(), interactionResultId: "invalid" };
    const context = projectExecutiveApplicationContext(invalid);
    expect(context.publicationStatus).toBe("SOURCE_INVALID");
    expect(context.readinessSummary).toEqual({ status: "UNAVAILABLE", available: false });
    expect(context.availableInteractionModes).toEqual([]);
    expect(context.availableChannels).toEqual([]);
  });

  it("expresses readiness through application-neutral modes", () => {
    const ready = interactionResult();
    expect(projectExecutiveApplicationContext(ready).availableInteractionModes).toEqual(["INTERACTIVE"]);
    const { interactionResultId: ignored, ...body } = { ...ready, interactionReadiness: "READ_ONLY" as const };
    const readOnly = {
      interactionResultId: `executive-interaction-result:${createHash("sha256").update(JSON.stringify(body)).digest("hex")}`,
      ...body,
    };
    expect(projectExecutiveApplicationContext(readOnly).availableInteractionModes).toEqual(["READ_ONLY"]);
  });
});
