import { afterEach, describe, expect, it, vi } from "vitest";
import { GoogleGmailSenderSearchConnector } from "./gmail-sender-search";

vi.mock("./access-token", () => ({
  getValidGoogleAccessToken: vi.fn(async () => "token"),
}));

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("GoogleGmailSenderSearchConnector", () => {
  it("discovers real From metadata using deterministic provider sender terms", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ messages: [{ id: "one" }, { id: "two" }] }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ payload: { headers: [{ name: "From", value: "Georgia McDonald <georgia@example.com>" }] } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ payload: { headers: [{ name: "From", value: "Georgia McDonald <georgia@example.com>" }] } }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await new GoogleGmailSenderSearchConnector().discoverSenderIdentities(["mcdonald", "georgia"], 100);

    expect(result).toEqual({
      complete: true,
      identities: [
        { displayName: "Georgia McDonald", address: "georgia@example.com" },
        { displayName: "Georgia McDonald", address: "georgia@example.com" },
      ],
    });
    const listUrl = String(fetchMock.mock.calls[0][0]);
    expect(listUrl).toContain("q=from%3Amcdonald+from%3Ageorgia");
    expect(listUrl).toContain("maxResults=100");
  });

  it("marks identity evidence incomplete rather than claiming uniqueness when the scan bound is exhausted", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        messages: [{ id: "one" }],
        nextPageToken: "more",
      }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        payload: { headers: [{ name: "From", value: "Georgia <georgia@example.com>" }] },
      }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    expect(await new GoogleGmailSenderSearchConnector().discoverSenderIdentities(["georgia"], 1)).toEqual({
      complete: false,
      incompleteReason: "provider_truncated",
      identities: [{ displayName: "Georgia", address: "georgia@example.com" }],
    });
  });

  it("searches the uniquely resolved literal address and preserves the five-result bound", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({
      messages: [{ id: "one" }, { id: "two" }, { id: "three" }, { id: "four" }, { id: "five" }, { id: "six" }],
    }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const ids = await new GoogleGmailSenderSearchConnector().searchByAddress("georgia@example.com", 5);
    expect(ids).toEqual(["one", "two", "three", "four", "five"]);
    expect(String(fetchMock.mock.calls[0][0])).toContain("q=from%3Ageorgia%40example.com");
  });
  it("marks the scan incomplete when any sender metadata read fails, without discarding successful evidence", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        messages: [{ id: "one" }, { id: "two" }, { id: "three" }],
      }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        payload: { headers: [{ name: "From", value: "Georgia McDonald <georgia@example.com>" }] },
      }), { status: 200 }))
      .mockResolvedValueOnce(new Response("", { status: 429 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        payload: { headers: [{ name: "From", value: "Georgia McDonald <georgia@example.com>" }] },
      }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await new GoogleGmailSenderSearchConnector().discoverSenderIdentities(["georgia"], 100);

    expect(result).toEqual({
      complete: false,
      incompleteReason: "metadata_incomplete",
      identities: [
        { displayName: "Georgia McDonald", address: "georgia@example.com" },
        { displayName: "Georgia McDonald", address: "georgia@example.com" },
      ],
    });
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

});
