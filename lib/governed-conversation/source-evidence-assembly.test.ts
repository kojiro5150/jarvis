import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { GmailProductionAcquisition } from "../connectors/google/gmail";
import type { MemoryStore } from "../memory/schema";
import { composeGovernedConversationalProjection } from "./projection-composer";
import { projectionInput } from "./lineage-test-fixtures";
import { assembleGovernedSourceEvidence, type GovernedSourceEvidenceAssemblyInput } from "./source-evidence-assembly";

const gmail: GmailProductionAcquisition = Object.freeze({ messages: [], observedAt: "2026-08-01T10:00:01.000Z", snapshotId: "google-gmail:snapshot", observations: Object.freeze([{ id: "provider-1", retrievedAt: "2026-08-01T10:00:01.000Z", internalDate: "1785582000000", payload: { headers: [{ name: "Message-ID", value: "<message@example.com>" }, { name: "From", value: "Cassie Kozyrkov <decision@substack.com>" }, { name: "To", value: "recipient@example.com" }, { name: "Date", value: "Thu, 1 Jan 2026 10:00:00 +0000" }] } }]) });
const memory: MemoryStore = { priorities: [{ rank: 1, title: "Unattested", detail: "private", due: "today", urgent: true }], projects: [], signals: [], calendar: [], gmailThreads: [], driveFiles: [], updatedAt: "2026-08-01T10:00:00Z" };
const assemblyInput = (): GovernedSourceEvidenceAssemblyInput => ({
  gmail: { connector: { acquireRecent: async () => gmail }, limit: 5 },
  calendar: { connector: { source: "google", listUpcoming: async () => [{ id: "provider-event", title: "private", start: "2026-08-02T09:00:00+10:00", end: "2026-08-02T10:00:00+10:00", day: "SUN", time: "09:00", source: "google", calendarId: "primary", calendarName: "Private" }] }, clock: (() => { const values = [new Date("2026-08-01T10:00:00Z"), new Date("2026-08-01T10:00:02Z")]; return () => values.shift()!; })(), requestedLimit: 5, horizonDays: 7 },
  memory: { read: async () => memory },
  connectorAvailability: { observedAt: "2026-08-01T10:00:03Z", results: [{ connectorId: "calendar", source: "google", connected: true }, { connectorId: "gmail", source: "google", connected: true }, { connectorId: "drive", source: "local", connected: false }] },
});
describe("governed source evidence assembly", () => {
  it("assembles all sources independently and passes the exact collections to the real composer", async () => {
    const assembled = await assembleGovernedSourceEvidence(assemblyInput());
    expect(assembled.sourceResults).toEqual({ gmail: { status: "available" }, calendar: { status: "available" }, memoryPriority: { status: "available" }, connectorAvailability: { status: "available" } });
    expect([assembled.communicationEvidence.length, assembled.calendarEvidence.length, assembled.memoryPriorityReferences.length, assembled.connectorAvailability.length]).toEqual([1, 1, 0, 3]);
    expect(assembled.communicationEvidence[0].senderDisplayName).toBe("Cassie Kozyrkov");
    const base = projectionInput(); const projection = composeGovernedConversationalProjection({ ...base, communicationEvidence: assembled.communicationEvidence, calendarEvidence: assembled.calendarEvidence, memoryPriorityReferences: assembled.memoryPriorityReferences, connectorAvailability: assembled.connectorAvailability });
    expect(projection.projectionId).toBeTruthy(); expect(projection.communicationEvidence).toEqual(assembled.communicationEvidence); expect(projection.calendarEvidence).toEqual(assembled.calendarEvidence); expect(projection.memoryPriorityReferences).toEqual([]); expect(projection.connectorAvailability).toEqual(assembled.connectorAvailability); expect(projection.connectorAvailability[2].fallbackStatus).toBe("unavailable");
    expect(Object.isFrozen(assembled) && Object.isFrozen(assembled.sourceResults) && Object.isFrozen(assembled.communicationEvidence) && Object.isFrozen(assembled.communicationEvidence[0])).toBe(true);
    expect(() => composeGovernedConversationalProjection({ ...base, communicationEvidence: assembled.communicationEvidence, calendarEvidence: assembled.calendarEvidence, memoryPriorityReferences: assembled.memoryPriorityReferences, connectorAvailability: [{ ...assembled.connectorAvailability[2], observedAt: "" }] })).toThrow();
  });
  it("does not let source unavailability suppress other sources or turn defects into unavailability", async () => { const input = assemblyInput(); const assembled = await assembleGovernedSourceEvidence({ ...input, gmail: { connector: { acquireRecent: async () => { throw new Error(); } } }, calendar: { ...input.calendar, connector: { source: "google", listUpcoming: async () => { throw new Error(); } } }, memory: { read: async () => { throw new Error(); } } }); expect(assembled.sourceResults).toMatchObject({ gmail: { status: "unavailable" }, calendar: { status: "unavailable" }, memoryPriority: { status: "unavailable" }, connectorAvailability: { status: "available" } }); expect(assembled.connectorAvailability).toHaveLength(3); const defective = await assembleGovernedSourceEvidence({ ...assemblyInput(), connectorAvailability: { observedAt: "bad", results: [] } }); expect(defective.sourceResults.connectorAvailability.status).toBe("failed"); });
});

const hashes: Record<string, string> = {
  "app/api/chat/route.ts": "4a1951b824b9b371a13b8596ebf936252c360b2da6ecdae960bc065e85fa716a", "lib/context-builder.ts": "8e689bf0880375ef2539c37cac8f8891669e66f4eb6ca72602fe97137438894d", "lib/useAgentConversation.ts": "55274931370b78e0ea6cf0fd144b4fba88400be0f9a14361682428846eea9c97", "lib/agents/chat-execution.ts": "a8fc170c4273b0dc9e90ec1d85dfaf98c2b4aeddbae3e38380fbe4aad3533dc7", "lib/governed-conversation/projection-composer.ts": "51b58941273e2b6ac748ce94e54368020928a384074cd3f062bd8d9b2dcd6106",
  "lib/governed-conversation/gmail-evidence-publisher.ts": "58a4dcadece2d303d11d6311aafd9c9629a9f1d0a8489fd9ecbf96dfe6bdf102", "lib/governed-conversation/calendar-evidence-publisher.ts": "5a7ad289102cc527a4dfe03640c87f048ab0927d4f9df013ca46cec533afff70", "lib/governed-conversation/memory-priority-evidence-publisher.ts": "8579eafeccde1ec5d3d3b8696a5eb570b7ae5c0093fe0eb722a043895d0fa176", "lib/governed-conversation/connector-availability-publisher.ts": "1078425229522654b440115480aa6ef4d4d2065694b8eb0e60bf2f0f167c6345",
};
const walk = (root: string): string[] => readdirSync(root).flatMap(name => { const path = join(root, name); return statSync(path).isDirectory() ? walk(path) : [path]; });
describe("pure-Node Sprint 3.101 isolation", () => {
  it("preserves protected/publisher bytes and has no production wiring", () => { for (const [path, hash] of Object.entries(hashes)) expect(createHash("sha256").update(readFileSync(path)).digest("hex"), path).toBe(hash); const production = [...walk("app"), ...walk("components"), ...walk("lib/agents")].filter(path => /\.tsx?$/.test(path)); for (const path of production) expect(readFileSync(path, "utf8"), path).not.toContain("source-evidence-assembly"); });
  it("keeps adapter and assembly imports isolated from routes/models and other adapters", () => { const adapters = ["gmail-evidence-acquisition-adapter", "calendar-evidence-acquisition-adapter", "memory-priority-acquisition-adapter", "connector-availability-acquisition-adapter"]; for (const adapter of adapters) { const source = readFileSync(`lib/governed-conversation/${adapter}.ts`, "utf8"); for (const other of adapters.filter(value => value !== adapter)) expect(source).not.toContain(other); for (const forbidden of ["app/api", "context-builder", "useAgentConversation", "chat-execution", "model-invocation"]) expect(source).not.toContain(forbidden); } const assembly = readFileSync("lib/governed-conversation/source-evidence-assembly.ts", "utf8"); for (const forbidden of ["app/api", "context-builder", "useAgentConversation", "chat-execution", "model-invocation"]) expect(assembly).not.toContain(forbidden); });
});
