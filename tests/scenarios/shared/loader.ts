import { DeterministicExecutiveOperatingSystemRuntime } from "../../../lib/executive-operating-system/runtime";
import type { ExecutiveOperatingSystemConfiguration } from "../../../lib/executive-operating-system/runtime";
import { cloneJson, deepFreeze, structurallyEqual, validateExecutiveScenario } from "./constitutional";
import type { ExecutiveScenarioLoader, ExecutiveScenarioRegistry, ExecutiveScenarioResult } from "./types";

export class DeterministicExecutiveScenarioLoader implements ExecutiveScenarioLoader {
  constructor(private readonly registry: ExecutiveScenarioRegistry) {}

  execute(scenarioId: string, configuration: ExecutiveOperatingSystemConfiguration): ExecutiveScenarioResult {
    const scenario = this.registry.get(scenarioId);
    if (!scenario) throw new Error(`unknown executive scenario: ${scenarioId}`);
    validateExecutiveScenario(scenario);
    const runtimeResult = new DeterministicExecutiveOperatingSystemRuntime().run({
      projectionArtifacts: scenario.projectionArtifacts,
      referenceTime: scenario.projectionArtifacts.observedAt,
      configuration,
    });
    const assertions = scenario.assertions.map((assertion) => {
      const selected = assertion.path.reduce<unknown>((value, part) =>
        value !== null && typeof value === "object" ? (value as Record<string | number, unknown>)[part] : undefined,
      runtimeResult);
      const actual = selected === undefined ? null : selected;
      return deepFreeze({ assertionId: assertion.id, passed: structurallyEqual(actual, assertion.expected), expected: cloneJson(assertion.expected), actual: cloneJson(actual) });
    });
    return deepFreeze({
      scenarioId: scenario.metadata.id,
      scenarioVersion: scenario.metadata.version,
      replayIdentity: scenario.replayIdentity,
      status: assertions.every(({ passed }) => passed) ? "passed" : "failed",
      assertions,
      runtimeResult,
    });
  }
}
