import { describe, expect, it, vi } from "vitest";
import type { MemoryStore, Priority } from "../memory/schema";
import type { GovernedPriorityPublication } from "./memory-priority-evidence-publisher";
import { acquireLegacyMemoryPriorityEvidence } from "./memory-priority-acquisition-adapter";
const priority: Priority = { rank: 1, title: "private", detail: "private", due: "today", urgent: true };
const store = (updatedAt = "2099-01-01T00:00:00Z"): MemoryStore => ({ priorities: [priority], projects: [], signals: [], calendar: [], gmailThreads: [], driveFiles: [], updatedAt });
const governed = (): GovernedPriorityPublication => ({ priorityId: "stable-1", priority, lifecycleState: "available", provenance: { sourceOwner: "operator", classification: "operator_priority", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-02T00:00:00Z", attestedAt: "2026-01-01T00:00:00Z" } });
describe("Memory priority acquisition adapter", () => {
  it("reads realistic unattested legacy priorities and truthfully produces none", async () => { const read = vi.fn().mockResolvedValue(store()); const result = await acquireLegacyMemoryPriorityEvidence({ read }); expect(read).toHaveBeenCalledOnce(); expect(result).toMatchObject({ status: "available", evidence: [] }); });
  it("publishes only separately governed provenance and ignores store freshness/urgent", async () => { const result = await acquireLegacyMemoryPriorityEvidence({ read: async () => store(), governedPriorityPublications: [governed()] }); expect(result.evidence).toEqual([{ memoryReference: "jarvis-memory:priority:stable-1", sourceOwner: "operator", freshness: "2026-01-02T00:00:00Z", available: true, classification: "operator_priority", policyReference: "governed-memory-priority-conversational-disclosure.v1" }]); });
  it("fails closed for read failure and rejects duplicate governed references", async () => { expect((await acquireLegacyMemoryPriorityEvidence({ read: async () => { throw new Error(); } })).status).toBe("unavailable"); await expect(acquireLegacyMemoryPriorityEvidence({ read: async () => store(), governedPriorityPublications: [governed(), governed()] })).rejects.toThrow("duplicate"); });
});
