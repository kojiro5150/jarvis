import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../access-token", () => ({ getValidGoogleAccessToken: async () => "token" }));

import { GoogleGmailConnector, GoogleGmailAuthError } from "../gmail";

const detail = (id: string) => ({
  id, internalDate: "1785322800000", payload: { headers: [
    { name: "Message-ID", value: `<${id}@example.test>` },
    { name: "From", value: "Sender <sender@example.test>" },
    { name: "To", value: '"Smith, John" <john@example.test>' },
    { name: "Date", value: "Wed, 29 Jul 2026 11:00:00 +0000" },
  ] },
});

afterEach(() => vi.unstubAllGlobals());

describe("GoogleGmailConnector canonical production acquisition", () => {
  it("unions both governed queries and fetches an overlapping message detail exactly once", async () => {
    const requests: string[] = [];
    vi.stubGlobal("fetch", vi.fn(async (input: string | URL | Request) => {
      const url = String(input); requests.push(url);
      if (url.includes("/messages?")) {
        const query = new URL(url).searchParams.get("q");
        return new Response(JSON.stringify({ messages: query?.startsWith("to:info@governanceengineering.com.au")
          ? [{ id: "overlap" }, { id: "governance" }]
          : [{ id: "main" }, { id: "overlap" }] }), { status: 200 });
      }
      const id = /\/messages\/([^?]+)/.exec(url)?.[1] as string;
      return new Response(JSON.stringify(detail(id)), { status: 200 });
    }));

    const acquired = await new GoogleGmailConnector(() => new Date("2026-08-01T01:02:03.000Z")).acquireRecent(5);
    const listRequests = requests.filter(url => url.includes("/messages?"));
    const getRequests = requests.filter(url => url.includes("/messages/") && !url.includes("/messages?"));
    expect(listRequests.map(url => new URL(url).searchParams.get("q"))).toEqual([
      "in:inbox -category:promotions -category:social -in:spam -in:trash",
      "to:info@governanceengineering.com.au -in:spam -in:trash",
    ]);
    expect(getRequests).toHaveLength(3);
    expect(getRequests.filter(url => url.includes("/messages/overlap?"))).toHaveLength(1);
    expect(acquired.observations.map(({ id }) => id)).toEqual(["overlap", "governance", "main"]);
    expect(acquired.observations.every(({ retrievedAt }) => retrievedAt === "2026-08-01T01:02:03.000Z")).toBe(true);
    expect(acquired.observedAt).toBe("2026-08-01T01:02:03.000Z");
    expect(acquired.snapshotId).toContain("overlap@2026-08-01T01:02:03.000Z");
  });

  it("preserves an authoritative detail 403 instead of returning empty success", async () => {
    vi.stubGlobal("fetch", vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      if (url.includes("/messages?")) return new Response(JSON.stringify({ messages: [{ id: "forbidden" }] }), { status: 200 });
      return new Response("forbidden", { status: 403 });
    }));
    await expect(new GoogleGmailConnector().acquireRecent(5)).rejects.toBeInstanceOf(GoogleGmailAuthError);
  });
});
