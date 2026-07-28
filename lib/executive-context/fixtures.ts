import { SituationalAwarenessEngine } from "../executive-operating-system/situational-awareness/assembly";
import type { ExecutiveStateSnapshot } from "../executive-operating-system/situational-awareness/assembly";
import { goldenProjectionArtifactSet } from "../../tests/fixtures/eos/golden-projection-artifact-set";

const assembled = new SituationalAwarenessEngine().assemble(goldenProjectionArtifactSet);
if (assembled.outcome !== "success") throw new Error("invalid deterministic Executive Context fixture");

/** Credential-free replay fixture sourced through the canonical assembly boundary. */
export const executiveContextFixture: ExecutiveStateSnapshot = assembled.snapshot;
export const executiveContextReferenceTime = "2030-01-14T11:00:00Z";
