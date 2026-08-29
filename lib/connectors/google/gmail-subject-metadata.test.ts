import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("./access-token", () => ({ getValidGoogleAccessToken: vi.fn(async () => "token") }));
import { GoogleGmailSubjectMetadataConnector } from "./gmail-subject-metadata";

describe("GoogleGmailSubjectMetadataConnector", () => {
  beforeEach(() => vi.unstubAllGlobals());

  it("requests only Gmail From + Subject metadata and releases only those metadata fields", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>(async (_input, _init) => new Response(JSON.stringify({
      snippet: "provider snippet must not be used",
      payload: {
        headers: [
          { name: "Subject", value: "Governed subject" },
          { name: "From", value: "private@example.com" },
        ],
        body: { data: "private-body" },
      },
    }), { status: 200 }));
    vi.stubGlobal("fetch", fetch);

    await expect(new GoogleGmailSubjectMetadataConnector().retrieveMessage("id-1")).resolves.toEqual({
      sender: "private@example.com",
      subject: "Governed subject",
    });

    const [rawUrl, init] = fetch.mock.calls[0];
    const url = new URL(rawUrl as string);
    expect(url.searchParams.get("format")).toBe("metadata");
    expect(url.searchParams.getAll("metadataHeaders")).toEqual(["From", "Subject"]);
    expect(url.searchParams.get("format")).not.toBe("full");
    expect(init).toEqual({ headers: { Authorization: "Bearer token" } });
  });
});
