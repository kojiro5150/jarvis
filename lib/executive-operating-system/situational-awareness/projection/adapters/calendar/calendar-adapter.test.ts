import { describe, expect, it } from "vitest";
import { normalizeGoogleEvent } from "../../../../../connectors/calendar-event";
import { ProjectionEngine } from "../../engine";
import { ProjectionRegistry } from "../../registry";
import { CalendarProjectionAdapter } from "./adapter";
import type { CalendarProjectionConnector, CalendarProjectionEvent } from "./types";

const identity = { userId: "user-1", displayName: "Sam" } as const;
const observedAt = "2026-07-27T12:00:00Z";

function event(overrides: Partial<CalendarProjectionEvent> = {}): CalendarProjectionEvent {
  return {
    ...normalizeGoogleEvent({
      id: "instance-1",
      summary: "Architecture review",
      start: { dateTime: "2026-07-28T09:00:00Z" },
      end: { dateTime: "2026-07-28T10:00:00Z" },
    }, 0, { calendarId: "primary", calendarName: "Primary" }),
    ...overrides,
  };
}

function connector(events: readonly CalendarProjectionEvent[]): CalendarProjectionConnector {
  return { source: "google", listUpcoming: async () => events };
}

function adapter(events: readonly CalendarProjectionEvent[]) {
  return new CalendarProjectionAdapter({ connector: connector(events), identity, observedAt });
}

describe("CalendarProjectionAdapter", () => {
  it("maps objective event fields and preserves artifact provenance", async () => {
    const artifact = await adapter([event()]).project();

    expect(artifact.entities.commitments).toEqual([{
      id: "google-calendar:primary:instance-1",
      title: "Architecture review",
      kind: "meeting",
      status: "scheduled",
      roleIds: [],
      projectIds: [],
      startsAt: "2026-07-28T09:00:00Z",
      dueAt: "2026-07-28T10:00:00Z",
    }]);
    expect(artifact.provenance).toEqual({
      sourceId: "google-calendar",
      sourceKind: "calendar",
      adapterId: "google-calendar",
      projectedAt: observedAt,
      availability: "available",
    });
    expect(artifact.metadata.connector).toBe("google-calendar");
  });

  it("is deterministic, immutable, replay-safe, and does not mutate connector data", async () => {
    const input = [event()];
    const first = await adapter(input).project();
    const second = await adapter(input).project();
    expect(first).toEqual(second);
    expect(JSON.parse(JSON.stringify(first))).toEqual(first);
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.entities.commitments)).toBe(true);
    expect(Object.isFrozen(first.entities.commitments?.[0])).toBe(true);
    expect(input[0].id).toBe("instance-1");
  });

  it("uses stable calendar-qualified identifiers for recurring instances", async () => {
    const recurring = event({ id: "series_20260728T090000Z" });
    const first = await adapter([recurring]).project();
    const replay = await adapter([{ ...recurring }]).project();
    expect(first.entities.commitments?.[0].id).toBe(
      "google-calendar:primary:series_20260728T090000Z"
    );
    expect(replay.entities.commitments?.[0].id).toBe(first.entities.commitments?.[0].id);
  });

  it("projects cancelled events deterministically without discarding them", async () => {
    const artifact = await adapter([event({ status: "cancelled" })]).project();
    expect(artifact.entities.commitments?.[0].status).toBe("cancelled");
  });

  it("orders commitments by stable identifier, independent of connector ordering", async () => {
    const a = event({ id: "a" });
    const b = event({ id: "b" });
    const forward = await adapter([a, b]).project();
    const reverse = await adapter([b, a]).project();
    expect(forward).toEqual(reverse);
    expect(forward.entities.commitments?.map(({ id }) => id)).toEqual([
      "google-calendar:primary:a", "google-calendar:primary:b",
    ]);
  });

  it.each([
    ["missing identifier", { id: "" }, "events[0].id"],
    ["missing title", { title: "" }, "events[0].title"],
    ["malformed start", { start: "tomorrow" }, "events[0].start"],
    ["all-day ambiguity", { start: "2026-07-28" }, "events[0].start"],
    ["reversed range", { end: "2026-07-28T08:00:00Z" }, "must not precede"],
  ])("explicitly rejects %s", async (_label, overrides, message) => {
    await expect(adapter([event(overrides)]).project()).rejects.toThrow(message);
  });

  it("rejects the whole projection when one observation in a window is unsupported", async () => {
    const valid = event({ id: "valid-instance" });
    const unsupportedAllDay = event({
      id: "all-day-instance",
      start: "2026-07-28",
      end: "2026-07-29",
    });

    await expect(adapter([valid, unsupportedAllDay]).project()).rejects.toThrow(
      "events[1].start must be an RFC 3339 timestamp",
    );
  });

  it("rejects duplicate source identities instead of silently resolving ambiguity", async () => {
    await expect(adapter([event(), event()]).project()).rejects.toThrow(
      "duplicate calendar event identifier"
    );
  });

  it("integrates connector through registry and engine into canonical awareness", async () => {
    const registry = new ProjectionRegistry();
    registry.register(adapter([event()]));
    const awareness = await new ProjectionEngine(registry).project();

    expect(awareness.commitments).toHaveLength(1);
    expect(awareness.commitments[0].title).toBe("Architecture review");
    expect(awareness.sources).toEqual([{
      id: "google-calendar",
      kind: "calendar",
      status: "available",
      observedAt,
    }]);
    expect(Object.isFrozen(awareness)).toBe(true);
  });
});
