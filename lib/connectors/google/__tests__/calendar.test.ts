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
  });
});
