import type {
  ExecutiveOperatingSystemConfiguration,
  ExecutiveOperatingSystemResult,
  ProjectionArtifactSet,
} from "../../../lib/executive-operating-system/runtime";

export interface ExecutiveScenarioMetadata {
  readonly id: string;
  readonly title: string;
  readonly version: number;
  readonly description: string;
}

export interface ExecutiveScenarioProvenance {
  readonly fixture: string;
  readonly sourceSprint: string;
}

export interface ExecutiveScenarioAssertion {
  readonly id: string;
  readonly path: readonly (string | number)[];
  readonly expected: unknown;
}

/** An executive environment only. Runtime configuration is deliberately absent. */
export interface ExecutiveScenario {
  readonly metadata: ExecutiveScenarioMetadata;
  readonly projectionArtifacts: ProjectionArtifactSet;
  readonly assertions: readonly ExecutiveScenarioAssertion[];
  readonly provenance: ExecutiveScenarioProvenance;
  readonly replayIdentity: string;
}

export interface ExecutiveScenarioAssertionResult {
  readonly assertionId: string;
  readonly passed: boolean;
  readonly expected: unknown;
  readonly actual: unknown;
}

export interface ExecutiveScenarioResult {
  readonly scenarioId: string;
  readonly scenarioVersion: number;
  readonly replayIdentity: string;
  readonly status: "passed" | "failed";
  readonly assertions: readonly ExecutiveScenarioAssertionResult[];
  readonly runtimeResult: ExecutiveOperatingSystemResult;
}

export interface ExecutiveScenarioLoader {
  execute(
    scenarioId: string,
    configuration: ExecutiveOperatingSystemConfiguration,
  ): ExecutiveScenarioResult;
}

export interface ExecutiveScenarioRegistry {
  list(): readonly ExecutiveScenario[];
  get(id: string): ExecutiveScenario | undefined;
}
