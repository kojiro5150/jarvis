import { cancelledCommitmentScenario } from "./cancelled-commitment/scenario";
import { CanonicalExecutiveScenarioRegistry } from "./registry/registry";

export const canonicalExecutiveScenarioRegistry = new CanonicalExecutiveScenarioRegistry([
  cancelledCommitmentScenario,
]);

export * from "./shared/types";
export * from "./shared/constitutional";
export * from "./shared/loader";
export * from "./registry/registry";
