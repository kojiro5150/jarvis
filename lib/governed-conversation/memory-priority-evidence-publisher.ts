import type { Priority } from "../memory/schema";
import type { GovernedMemoryPriorityReference } from "./projection-composer";

export const MEMORY_PRIORITY_CONVERSATIONAL_DISCLOSURE_POLICY = "governed-memory-priority-conversational-disclosure.v1";
export interface GovernedPriorityPublication {
  readonly priorityId: string; readonly priority: Priority; readonly lifecycleState: "available" | "unavailable";
  readonly provenance: { readonly sourceOwner: string; readonly classification: "operator_priority" | "derived_interpretation"; readonly createdAt: string; readonly updatedAt: string; readonly attestedAt?: string; readonly derivationReference?: string; readonly sourcePublicationReferences?: readonly string[] };
}
const nonempty = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;
const timestamp = (value: unknown): value is string => nonempty(value) && Number.isFinite(Date.parse(value));
export function projectLegacyMemoryPriorities(_priorities: readonly Priority[]): readonly GovernedMemoryPriorityReference[] { return Object.freeze([]); }
export function publishMemoryPriorityEvidence(input: readonly GovernedPriorityPublication[]): readonly GovernedMemoryPriorityReference[] {
  return Object.freeze(input.flatMap(publication => {
    const { provenance } = publication;
    if (publication.lifecycleState !== "available" || !nonempty(publication.priorityId) || !nonempty(provenance?.sourceOwner) || !timestamp(provenance?.updatedAt)) return [];
    const operator = provenance.classification === "operator_priority" && timestamp(provenance.attestedAt);
    const derived = provenance.classification === "derived_interpretation" && provenance.sourceOwner !== "operator" && nonempty(provenance.derivationReference) && Boolean(provenance.sourcePublicationReferences?.length);
    if (!operator && !derived) return [];
    return [Object.freeze({ memoryReference: `jarvis-memory:priority:${publication.priorityId}`, sourceOwner: provenance.sourceOwner, freshness: provenance.updatedAt, available: true, classification: provenance.classification, policyReference: MEMORY_PRIORITY_CONVERSATIONAL_DISCLOSURE_POLICY })];
  }));
}
