import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("./access-token", () => ({ getValidGoogleAccessToken: vi.fn(async () => "token") }));
import { GoogleGmailSubjectMetadataConnector } from "./gmail-subject-metadata";

describe("GoogleGmailSubjectMetadataConnector", () => {
  beforeEach(() => vi.unstubAllGlobals());

  it("requests only Gmail Subject metadata and releases only the subject field", async () => {
    const fetch = vi.fn(async () => new Response(JSON.stringify({
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
      subject: "Governed subject",
    });

    const [rawUrl, init] = fetch.mock.calls[0];
    const url = new URL(rawUrl as string);
    expect(url.searchParams.get("format")).toBe("metadata");
    expect(url.searchParams.getAll("metadataHeaders")).toEqual(["Subject"]);
    expect(url.searchParams.get("format")).not.toBe("full");
    expect(init).toEqual({ headers: { Authorization: "Bearer token" } });
  });
});
