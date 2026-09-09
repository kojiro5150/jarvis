import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./access-token", () => ({ getValidGoogleAccessToken: vi.fn(async () => "token") }));
import { GoogleGmailTopicSearchConnector } from "./gmail-topic-search";

describe("GoogleGmailTopicSearchConnector", () => {
  beforeEach(() => vi.unstubAllGlobals());

  it("constructs an exact provider-side topic query and returns at most five IDs", async () => {
    const fetch = vi.fn(async (_url: string, _init?: RequestInit) => new Response(JSON.stringify({
      messages: Array.from({ length: 7 }, (_, index) => ({ id: `id-${index + 1}`, threadId: "must-not-return" })),
    }), { status: 200 }));
    vi.stubGlobal("fetch", fetch);

    await expect(new GoogleGmailTopicSearchConnector().searchByTopic("Rotary", 5))
      .resolves.toEqual(["id-1", "id-2", "id-3", "id-4", "id-5"]);
    const parsed = new URL(fetch.mock.calls[0][0]);
    expect(parsed.searchParams.get("q")).toBe('"Rotary"');
    expect(parsed.searchParams.get("maxResults")).toBe("5");
    expect(fetch.mock.calls[0][1]).toEqual({ headers: { Authorization: "Bearer token" } });
  });
});
