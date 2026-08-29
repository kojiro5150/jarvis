import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./access-token", () => ({
  getValidGoogleAccessToken: vi.fn(async () => "token"),
}));
vi.mock("./calendar-write-scope", () => ({
  hasGoogleCalendarWriteScope: vi.fn(async () => true),
}));

import { GoogleCalendarEventWriteConnector } from "./calendar-write";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("Google Calendar event move connector", () => {
  it("PATCHes only start and end for the exact provider event", async () => {
    const fetchMock = vi.fn<typeof globalThis.fetch>(async (_input, _init) =>
      new Response("{}", {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const connector = new GoogleCalendarEventWriteConnector();
    await expect(
      connector.moveEvent(
        "primary",
        "deep",
        "2026-08-29T10:30:00.000Z",
        "2026-08-29T12:00:00.000Z",
      ),
    ).resolves.toEqual({ ok: true, status: 200 });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events/deep",
    );
    expect(init?.method).toBe("PATCH");
    expect(JSON.parse(String(init?.body))).toEqual({
      start: { dateTime: "2026-08-29T10:30:00.000Z" },
      end: { dateTime: "2026-08-29T12:00:00.000Z" },
    });
  });

  it("does not call Google when the stored grant lacks write scope", async () => {
    const scope = await import("./calendar-write-scope");
    vi.mocked(scope.hasGoogleCalendarWriteScope).mockResolvedValueOnce(false);
    const fetchMock = vi.fn<typeof globalThis.fetch>();
    vi.stubGlobal("fetch", fetchMock);

    const connector = new GoogleCalendarEventWriteConnector();
    await expect(
      connector.moveEvent(
        "primary",
        "deep",
        "2026-08-29T10:30:00.000Z",
        "2026-08-29T12:00:00.000Z",
      ),
    ).resolves.toEqual({ ok: false, status: 403 });

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
