import { describe, expect, it, vi } from "vitest";
import { ClientAuthorityTurnState, type OpaquePendingAuthorization } from "./client-authority-turn-state";
import { VoiceTurnQueue } from "./voice-turn-queue";

type Reply = { result: string; pending: OpaquePendingAuthorization | null };

function governedVoiceHarness(server: (text: string, pending: OpaquePendingAuthorization | null) => Promise<Reply>) {
  const authority = new ClientAuthorityTurnState();
  const applied: string[] = [];
  let concurrent = 0;
  let maximumConcurrent = 0;
  const queue = new VoiceTurnQueue(async ({ transcript }) => {
    concurrent += 1;
    maximumConcurrent = Math.max(maximumConcurrent, concurrent);
    const request = authority.beginRequest();
    const reply = await server(transcript, request.pendingAuthorizationReference);
    if (authority.applyResponse(request.requestId, reply.pending)) applied.push(reply.result);
    concurrent -= 1;
  });
  return { queue, applied, maximumConcurrent: () => maximumConcurrent };
}

describe("voice authority turn integrity", () => {
  it("applies voice Calendar ASK, then voice yes, then the Calendar result", async () => {
    const pending = { pendingAuthorizationId: "calendar-opaque" };
    const server = vi.fn(async (text: string, reference: OpaquePendingAuthorization | null) =>
      text === "yes" && reference === pending
        ? { result: "Calendar result", pending: null }
        : { result: "Calendar ASK", pending });
    const harness = governedVoiceHarness(server);
    await Promise.all([
      harness.queue.enqueue({ id: 1, transcript: "what is on my calendar" }),
      harness.queue.enqueue({ id: 2, transcript: "yes" }),
    ]);
    expect(harness.applied).toEqual(["Calendar ASK", "Calendar result"]);
  });

  it("applies voice Gmail ASK, then voice yes, then Gmail IDs", async () => {
    const pending = { pendingAuthorizationId: "gmail-opaque" };
    const harness = governedVoiceHarness(async (text, reference) =>
      text === "yes" && reference === pending
        ? { result: "Gmail IDs: a, b", pending: null }
        : { result: "Gmail ASK", pending });
    await harness.queue.enqueue({ id: 10, transcript: "search Gmail for invoices from the last week" });
    await harness.queue.enqueue({ id: 11, transcript: "yes" });
    expect(harness.applied).toEqual(["Gmail ASK", "Gmail IDs: a, b"]);
  });

  it("does not start transcript B while unresolved turn A can mutate authority", async () => {
    let release!: () => void;
    const blocked = new Promise<void>((resolve) => { release = resolve; });
    const server = vi.fn(async (text: string) => {
      if (text === "A") await blocked;
      return { result: text, pending: null };
    });
    const harness = governedVoiceHarness(server);
    const a = harness.queue.enqueue({ id: 20, transcript: "A" });
    const b = harness.queue.enqueue({ id: 21, transcript: "B" });
    await Promise.resolve();
    expect(server).toHaveBeenCalledTimes(1);
    release();
    await Promise.all([a, b]);
    expect(harness.maximumConcurrent()).toBe(1);
  });

  it("rejects an out-of-order stale response instead of overwriting pending authority", () => {
    const state = new ClientAuthorityTurnState();
    const older = state.beginRequest();
    const newer = state.beginRequest();
    expect(state.applyResponse(newer.requestId, { pendingAuthorizationId: "current" })).toBe(true);
    expect(state.applyResponse(older.requestId, { pendingAuthorizationId: "stale" })).toBe(false);
    expect(state.beginRequest().pendingAuthorizationReference).toEqual({ pendingAuthorizationId: "current" });
  });

  it("submits identical yes transcripts from distinct events and deduplicates one event", async () => {
    const delivered: number[] = [];
    const queue = new VoiceTurnQueue(async (turn) => { delivered.push(turn.id); });
    await Promise.all([
      queue.enqueue({ id: 30, transcript: "yes" }),
      queue.enqueue({ id: 30, transcript: "yes" }),
      queue.enqueue({ id: 31, transcript: "yes" }),
    ]);
    expect(delivered).toEqual([30, 31]);
  });
});
