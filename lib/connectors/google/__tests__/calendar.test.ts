import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../access-token", () => ({ getValidGoogleAccessToken: vi.fn(async () => "token") }));

import { GoogleCalendarConnector } from "../calendar";

afterEach(() => vi.unstubAllGlobals());

describe("GoogleCalendarConnector bounded reads", () => {
  it("sends the exact authorized Melbourne-tomorrow bounds to events.list", async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ items: [{ id: "primary", summary: "Primary" }] }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ items: [] }), { status: 200 }));
    vi.stubGlobal("fetch", fetch);

    await new GoogleCalendarConnector().listBetween(
      "2026-08-25T14:00:00.000Z",
      "2026-08-26T14:00:00.000Z",
      5,
    );

    expect(fetch).toHaveBeenCalledTimes(2);
    const eventsUrl = new URL(fetch.mock.calls[1][0] as string);
    expect(eventsUrl.searchParams.get("timeMin")).toBe("2026-08-25T14:00:00.000Z");
    expect(eventsUrl.searchParams.get("timeMax")).toBe("2026-08-26T14:00:00.000Z");
    expect(eventsUrl.searchParams.get("eventLabelVersion")).toBe("1");
  });

  it("resolves a real event label definition into a governed time mode", async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ items: [{ id: "primary", summary: "Primary" }] }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        items: [{
          id: "evt-labeled",
          summary: "JARVIS Testing",
          eventLabelId: "label-native-456",
          start: { dateTime: "2026-08-28T10:00:00+10:00" },
          end: { dateTime: "2026-08-28T11:00:00+10:00" },
        }],
      }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        labelProperties: {
          eventLabels: [{
            id: "label-native-456",
            name: "Deep Work / Discovery",
            backgroundColor: "#3f51b5",
          }],
        },
      }), { status: 200 }));
    vi.stubGlobal("fetch", fetch);

    const result = await new GoogleCalendarConnector().listBetweenWithCompleteness(
      "2026-08-27T14:00:00.000Z",
      "2026-08-28T14:00:00.000Z",
      5,
    );

    const eventsUrl = new URL(fetch.mock.calls[1][0] as string);
    expect(eventsUrl.searchParams.get("eventLabelVersion")).toBe("1");
    expect(fetch.mock.calls[2][0]).toBe(
      "https://www.googleapis.com/calendar/v3/calendars/primary",
    );
    expect(result.events).toHaveLength(1);
    expect(result.events[0]).toMatchObject({
      eventLabelId: "label-native-456",
      timeMode: "deep_work",
    });
  });

  it("does not manufacture unclassified when provider label definitions are unavailable", async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ items: [{ id: "primary", summary: "Primary" }] }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        items: [{
          id: "evt-labeled",
          summary: "JARVIS Testing",
          eventLabelId: "label-native-456",
          start: { dateTime: "2026-08-28T10:00:00+10:00" },
          end: { dateTime: "2026-08-28T11:00:00+10:00" },
        }],
      }), { status: 200 }))
      .mockResolvedValueOnce(new Response("unavailable", { status: 503 }));
    vi.stubGlobal("fetch", fetch);

    const result = await new GoogleCalendarConnector().listBetweenWithCompleteness(
      "2026-08-27T14:00:00.000Z",
      "2026-08-28T14:00:00.000Z",
      5,
    );

    expect(result.events[0].eventLabelId).toBe("label-native-456");
    expect(result.events[0].timeMode).toBeUndefined();
  });
  it("proves complete bounded membership only when every discovered target is complete and the merge is not truncated", async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ items: [
        { id: "a", summary: "A" },
        { id: "b", summary: "B" },
      ] }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ items: [
        { id: "a-1", start: { dateTime: "2026-08-28T10:00:00+10:00" }, end: { dateTime: "2026-08-28T11:00:00+10:00" } },
      ] }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ items: [
        { id: "b-1", start: { dateTime: "2026-08-28T12:00:00+10:00" }, end: { dateTime: "2026-08-28T13:00:00+10:00" } },
      ] }), { status: 200 }));
    vi.stubGlobal("fetch", fetch);

    const result = await new GoogleCalendarConnector().listBetweenWithCompleteness(
      "2026-08-27T14:00:00.000Z",
      "2026-08-28T14:00:00.000Z",
      5,
    );

    expect(result.events.map(event => event.id)).toEqual(["a-1", "b-1"]);
    expect(result.completeness).toMatchObject({
      targetDiscovery: "calendar_list",
      targetCount: 2,
      mergeTruncated: false,
      completeness: "complete",
      targets: [
        { calendarId: "a", status: "complete", continuation: "none", returnedCount: 1 },
        { calendarId: "b", status: "complete", continuation: "none", returnedCount: 1 },
      ],
    });
  });

  it("marks provider continuation as partial without exposing the raw page token", async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ items: [{ id: "primary" }] }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        items: [],
        nextPageToken: "secret-provider-page-token",
      }), { status: 200 }));
    vi.stubGlobal("fetch", fetch);

    const result = await new GoogleCalendarConnector().listBetweenWithCompleteness(
      "2026-08-27T14:00:00.000Z",
      "2026-08-28T14:00:00.000Z",
      5,
    );

    expect(result.completeness).toMatchObject({
      completeness: "partial",
      targets: [{ calendarId: "primary", status: "partial", continuation: "present" }],
    });
    expect(JSON.stringify(result.completeness)).not.toContain("secret-provider-page-token");
  });

  it("preserves one target failure as partial instead of complete empty membership", async () => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const fetch = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ items: [{ id: "a" }, { id: "b" }] }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ items: [] }), { status: 200 }))
      .mockResolvedValueOnce(new Response("unavailable", { status: 503 }));
    vi.stubGlobal("fetch", fetch);

    const result = await new GoogleCalendarConnector().listBetweenWithCompleteness(
      "2026-08-27T14:00:00.000Z",
      "2026-08-28T14:00:00.000Z",
      5,
    );

    expect(result.completeness.completeness).toBe("partial");
    expect(result.completeness.targets).toEqual([
      expect.objectContaining({ calendarId: "a", status: "complete", continuation: "none" }),
      expect.objectContaining({ calendarId: "b", status: "unavailable", continuation: "unknown" }),
    ]);
    warning.mockRestore();
  });

  it("classifies total target failure as unavailable", async () => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const fetch = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ items: [{ id: "a" }] }), { status: 200 }))
      .mockResolvedValueOnce(new Response("unavailable", { status: 503 }));
    vi.stubGlobal("fetch", fetch);

    const result = await new GoogleCalendarConnector().listBetweenWithCompleteness(
      "2026-08-27T14:00:00.000Z",
      "2026-08-28T14:00:00.000Z",
      5,
    );

    expect(result.completeness.completeness).toBe("unavailable");
    expect(result.events).toEqual([]);
    warning.mockRestore();
  });

  it("marks an otherwise complete multi-calendar acquisition partial when the global merge truncates", async () => {
    const event = (id: string, hour: number) => ({
      id,
      start: { dateTime: `2026-08-28T${String(hour).padStart(2, "0")}:00:00+10:00` },
      end: { dateTime: `2026-08-28T${String(hour + 1).padStart(2, "0")}:00:00+10:00` },
    });
    const fetch = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ items: [{ id: "a" }, { id: "b" }] }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ items: [event("a-1", 9), event("a-2", 11)] }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ items: [event("b-1", 10), event("b-2", 12)] }), { status: 200 }));
    vi.stubGlobal("fetch", fetch);

    const result = await new GoogleCalendarConnector().listBetweenWithCompleteness(
      "2026-08-27T14:00:00.000Z",
      "2026-08-28T14:00:00.000Z",
      3,
    );

    expect(result.events).toHaveLength(3);
    expect(result.completeness).toMatchObject({
      mergeTruncated: true,
      mergedReturnedCount: 3,
      completeness: "partial",
    });
  });

  it("keeps primary fallback useful but never classifies it as complete", async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ items: [] }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ items: [] }), { status: 200 }));
    vi.stubGlobal("fetch", fetch);

    const result = await new GoogleCalendarConnector().listBetweenWithCompleteness(
      "2026-08-27T14:00:00.000Z",
      "2026-08-28T14:00:00.000Z",
      5,
    );

    expect(result.completeness).toMatchObject({
      targetDiscovery: "primary_fallback",
      completeness: "partial",
      mergeTruncated: false,
    });
  });
});
