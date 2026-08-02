import { describe, expect, it } from "vitest";
import type { Priority } from "../memory/schema";
import { projectLegacyMemoryPriorities, publishMemoryPriorityEvidence, type GovernedPriorityPublication } from "./memory-priority-evidence-publisher";
const priority: Priority = { rank: 1, title: "Ship", detail: "Private", due: "today", urgent: true };
const publication = (overrides: Partial<GovernedPriorityPublication> = {}): GovernedPriorityPublication => ({ priorityId: "stable-1", priority, lifecycleState: "available", provenance: { sourceOwner: "operator", classification: "operator_priority", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-02T00:00:00Z", attestedAt: "2026-01-01T00:00:00Z" }, ...overrides });
describe("Memory priority evidence publisher", () => {
  it("rejects store-shaped unattested legacy and seed priorities", () => expect(projectLegacyMemoryPriorities([priority, { rank: 2, title: "Seed", detail: "x", due: "later" }])).toEqual([]));
  it("maps attested operator evidence exactly, immutably, without urgent, rank, title, digest, or store freshness", () => {
    const input = [publication()]; const before = structuredClone(input); const result = publishMemoryPriorityEvidence(input);
    expect(result).toEqual([{ memoryReference: "jarvis-memory:priority:stable-1", sourceOwner: "operator", freshness: "2026-01-02T00:00:00Z", available: true, classification: "operator_priority", policyReference: "governed-memory-priority-conversational-disclosure.v1" }]);
    expect(publishMemoryPriorityEvidence([publication({ priority: { ...priority, urgent: false } })])).toEqual(result); expect(input).toEqual(before); expect(Object.isFrozen(result) && Object.isFrozen(result[0])).toBe(true); expect(publishMemoryPriorityEvidence(structuredClone(input))).toEqual(result);
  });
  it("validates derived provenance and every mandatory governed field", () => {
    const derived = publication({ provenance: { sourceOwner: "governed-planner", classification: "derived_interpretation", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-03T00:00:00Z", derivationReference: "derivation:1", sourcePublicationReferences: ["source:1"] } });
    expect(publishMemoryPriorityEvidence([derived])[0].classification).toBe("derived_interpretation");
    const cases = [publication({ priorityId: "" }), publication({ lifecycleState: "unavailable" }), publication({ provenance: { ...publication().provenance, sourceOwner: "" } }), publication({ provenance: { ...publication().provenance, updatedAt: "" } }), publication({ provenance: { ...publication().provenance, attestedAt: undefined } }), { ...derived, provenance: { ...derived.provenance, derivationReference: undefined } }];
    for (const bad of cases) expect(publishMemoryPriorityEvidence([bad])).toEqual([]);
  });
});
