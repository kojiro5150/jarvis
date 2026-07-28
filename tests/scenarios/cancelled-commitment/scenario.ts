import { goldenProjectionArtifactSet } from "../../fixtures/eos/golden-projection-artifact-set";
import { cloneJson, deepFreeze } from "../shared/constitutional";
import type { ExecutiveScenario } from "../shared/types";

export const cancelledCommitmentScenario: ExecutiveScenario = deepFreeze({
  metadata: {
    id: "cancelled-commitment",
    title: "Cancelled commitment",
    version: 1,
    description: "A scheduled governance commitment is observed as cancelled.",
  },
  projectionArtifacts: cloneJson(goldenProjectionArtifactSet),
  provenance: { fixture: "tests/fixtures/eos/golden-projection-artifact-set.ts", sourceSprint: "3.24.2" },
  replayIdentity: "cancelled-commitment:v1:golden-current",
  assertions: [
    { id: "cancelled-commitment-is-prioritised", path: ["attention", "records", 0, "entityId"], expected: "governance-review" },
    { id: "runtime-completes-without-ungoverned-action", path: ["proposals", "proposals"], expected: [] },
  ],
});
