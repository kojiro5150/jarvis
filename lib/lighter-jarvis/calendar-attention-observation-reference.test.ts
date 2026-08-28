import { describe, expect, it } from "vitest";
import type { CanonicalCalendarAttentionObservationSet } from "../governed-conversation/calendar-attention-observation";
import {
  createCalendarAttentionObservationReference,
  resolveCalendarAttentionObservationReference,
  rotateCalendarAttentionObservationReference,
} from "./calendar-attention-observation-reference";

const set = (observedAt: string, startsAt = "2026-08-29T10:00:00+10:00"): CanonicalCalendarAttentionObservationSet => Object.freeze({
  sourceId: "google-calendar",
  observedAt,
  windowStart: "2026-08-29T00:00:00+10:00",
  windowEnd: "2026-08-30T00:00:00+10:00",
  requestedLimit: 5,
  coverageState: "bounded",
  coverageLimit: "window=2026-08-29T00:00:00+10:00/2026-08-30T00:00:00+10:00;max_events=5;scope=visible_non_hidden_calendars;completeness=bounded",
  policyReference: "governed-calendar-conversational-metadata-disclosure.v1",
  observations: Object.freeze([
    Object.freeze({
      id: "google-calendar:calendar:primary:event:evt-1",
      startsAt,
      endsAt: "2026-08-29T11:00:00+10:00",
      observedAt,
      timezone: "+10:00",
      sourceReference: Object.freeze({
        sourceId: "google-calendar",
        resourceId: "calendar:primary:event:evt-1",
        field: "schedule_interval",
        observedAt,
      }),
      provenanceReference: "google-calendar:calendar:primary:event:evt-1#provenance",
      coverageLimit: "window=2026-08-29T00:00:00+10:00/2026-08-30T00:00:00+10:00;max_events=5;scope=visible_non_hidden_calendars;completeness=bounded",
      policyReference: "governed-calendar-conversational-metadata-disclosure.v1",
    }),
  ]),
});

describe("server-owned Calendar attention observation references", () => {
  it("returns only an opaque reference and resolves against server-owned state", () => {
    const original = set("2026-08-28T00:00:00Z");
    const reference = createCalendarAttentionObservationReference(original);

    expect(Object.keys(reference)).toEqual(["calendarAttentionObservationReferenceId"]);
    expect(reference.calendarAttentionObservationReferenceId).toEqual(expect.any(String));
    expect(JSON.stringify(reference)).not.toContain("google-calendar");
    expect(JSON.stringify(reference)).not.toContain("evt-1");
    expect(Object.isFrozen(reference)).toBe(true);

    const resolved = resolveCalendarAttentionObservationReference(reference);
    expect(resolved).toEqual(original);
    expect(resolved).not.toBe(original);
    expect(Object.isFrozen(resolved)).toBe(true);
    expect(Object.isFrozen(resolved!.observations)).toBe(true);
    expect(Object.isFrozen(resolved!.observations[0])).toBe(true);
    expect(Object.isFrozen(resolved!.observations[0].sourceReference)).toBe(true);
  });

  it("does not trust a fabricated client-carried reference", () => {
    const original = set("2026-08-28T00:00:00Z");
    const real = createCalendarAttentionObservationReference(original);

    expect(resolveCalendarAttentionObservationReference({
      calendarAttentionObservationReferenceId: "fabricated",
      sourceId: "google-calendar",
      observations: original.observations,
    })).toBeNull();

    expect(resolveCalendarAttentionObservationReference({
      calendarAttentionObservationReferenceId: real.calendarAttentionObservationReferenceId,
      observations: [{ id: "forged" }],
    })).toEqual(original);
  });

  it("rejects malformed references without throwing", () => {
    for (const value of [null, undefined, "", {}, [], { calendarAttentionObservationReferenceId: "" }]) {
      expect(resolveCalendarAttentionObservationReference(value)).toBeNull();
    }
  });

  it("rotates valid prior server state and invalidates the old reference", () => {
    const previous = createCalendarAttentionObservationReference(set("2026-08-28T00:00:00Z"));
    const currentSet = set("2026-08-28T01:00:00Z", "2026-08-29T11:00:00+10:00");

    const current = rotateCalendarAttentionObservationReference({
      previousReference: previous,
      currentSet,
    });

    expect(resolveCalendarAttentionObservationReference(previous)).toBeNull();
    expect(resolveCalendarAttentionObservationReference(current)).toEqual(currentSet);
  });

  it("a fabricated previous reference cannot prevent creation of new server-owned state", () => {
    const currentSet = set("2026-08-28T01:00:00Z");
    const current = rotateCalendarAttentionObservationReference({
      previousReference: { calendarAttentionObservationReferenceId: "fabricated" },
      currentSet,
    });

    expect(resolveCalendarAttentionObservationReference(current)).toEqual(currentSet);
  });

  it("uses no connector, model, chat history or client authority as storage ownership", async () => {
    const source = await import("node:fs").then(({ readFileSync }) =>
      readFileSync("lib/lighter-jarvis/calendar-attention-observation-reference.ts", "utf8"));

    for (const forbidden of [
      "getCalendarConnector",
      "acquire",
      "callClaude",
      "messages",
      "PendingAuthorization",
      "pendingAuthorizationReference",
      "conversationId",
      "sessionId",
    ]) expect(source).not.toContain(forbidden);
  });
});
