import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("./access-token", () => ({ getValidGoogleAccessToken: vi.fn(async () => "token") }));
import { GoogleGmailSearchConnector } from "./gmail-search";

describe("GoogleGmailSearchConnector", () => {
  beforeEach(() => vi.unstubAllGlobals());
  it.each(["1d", "7d"] as const)("constructs the fixed provider query and returns IDs only for %s", async newerThan => {
    const fetch = vi.fn(async (_input: string | URL | Request, _init?: RequestInit) => new Response(JSON.stringify({ messages: [{ id: "id-1", threadId: "secret" }, { id: "id-2" }] }), { status: 200 }));
    vi.stubGlobal("fetch", fetch);
    await expect(new GoogleGmailSearchConnector().search(newerThan, 5)).resolves.toEqual(["id-1", "id-2"]);
    const [url, init] = fetch.mock.calls[0]; const parsed = new URL(url as string);
    expect(parsed.searchParams.get("q")).toBe(`newer_than:${newerThan}`);
    expect(parsed.searchParams.get("maxResults")).toBe("5");
    expect(init).toEqual({ headers: { Authorization: "Bearer token" } });
    expect(fetch).toHaveBeenCalledOnce();
  });
  it("hard-bounds even an oversized provider response to five IDs", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ messages: Array.from({ length: 8 }, (_, i) => ({ id: String(i) })) }), { status: 200 })));
    await expect(new GoogleGmailSearchConnector().search("1d", 5)).resolves.toHaveLength(5);
  });
});
