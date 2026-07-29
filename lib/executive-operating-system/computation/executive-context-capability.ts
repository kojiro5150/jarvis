import { ConversationContextAdapter, type ExecutiveContext } from "../conversation-context";
import { createSituationalAwarenessSnapshot, type SituationalAwarenessSnapshotInput } from "../situational-awareness";
import { AvailabilityEngine } from "./availability";
import type { AvailabilityComputationWindow } from "./availability";

export type ExecutiveContextCapabilityInput = Readonly<{
  snapshot: SituationalAwarenessSnapshotInput;
  computationWindow: AvailabilityComputationWindow;
}>;

/** Constitutional bridge from a completed snapshot through deterministic computation to Sprint 3.48 context. */
export function deriveConversationExecutiveContext(input: ExecutiveContextCapabilityInput): ExecutiveContext {
  const snapshot = createSituationalAwarenessSnapshot(input.snapshot);
  const availability = new AvailabilityEngine().compute(snapshot, input.computationWindow);
  return new ConversationContextAdapter().adapt(snapshot, availability);
}
