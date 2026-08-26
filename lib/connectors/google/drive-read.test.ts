import { beforeEach, describe, expect, it, vi } from "vitest";
import { GoogleDriveReadConnector, GOOGLE_DOC_MIME } from "./drive-read";

vi.mock("./access-token", () => ({ getValidGoogleAccessToken: vi.fn(async () => "access-token") }));

const metadata = (id = "authorized-id", mimeType = GOOGLE_DOC_MIME) =>
  new Response(JSON.stringify({ id, mimeType }), { status: 200, headers: { "content-type": "application/json" } });

describe("GoogleDriveReadConnector HTTP and bounded streaming", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("binds exact metadata/export URLs and authorization to the authorized provider ID", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(metadata())
      .mockResolvedValueOnce(new Response("verbatim ✓"));
    await expect(new GoogleDriveReadConnector().readGoogleDocText("authorized-id", 65_536)).resolves.toEqual({
      fileId: "authorized-id", mimeType: GOOGLE_DOC_MIME, text: "verbatim ✓",
    });
    expect(fetchMock).toHaveBeenNthCalledWith(1,
      "https://www.googleapis.com/drive/v3/files/authorized-id?fields=id,mimeType",
      { headers: { Authorization: "Bearer access-token" } });
    expect(fetchMock).toHaveBeenNthCalledWith(2,
      "https://www.googleapis.com/drive/v3/files/authorized-id/export?mimeType=text%2Fplain",
      { headers: { Authorization: "Bearer access-token" } });
  });

  it.each([
    ["different-id", GOOGLE_DOC_MIME],
    ["authorized-id", "text/plain"],
    ["authorized-id", "application/pdf"],
  ])("rejects mismatched identity or unsupported MIME before export: %s / %s", async (id, mimeType) => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(metadata(id, mimeType));
    await expect(new GoogleDriveReadConnector().readGoogleDocText("authorized-id", 65_536)).rejects.toThrow("unsupported_drive_mime");
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("rejects a declared oversized response without reading or releasing it", async () => {
    const start = vi.fn();
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(metadata()).mockResolvedValueOnce(
      new Response(new ReadableStream({ start }), { headers: { "content-length": "65537" } }));
    await expect(new GoogleDriveReadConnector().readGoogleDocText("authorized-id", 65_536)).rejects.toThrow("drive_content_too_large");
    expect(start).toHaveBeenCalledOnce();
  });

  it("cancels an undeclared stream as soon as it crosses the bound and never returns truncation", async () => {
    const cancel = vi.fn();
    const body = new ReadableStream<Uint8Array>({ start(controller) {
      controller.enqueue(new Uint8Array(65_536)); controller.enqueue(new Uint8Array([1]));
    }, cancel });
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(metadata()).mockResolvedValueOnce(new Response(body));
    await expect(new GoogleDriveReadConnector().readGoogleDocText("authorized-id", 65_536)).rejects.toThrow("drive_content_too_large");
    expect(cancel).toHaveBeenCalledOnce();
  });

  it("accepts exactly 65536 streamed bytes with no Content-Length", async () => {
    const body = new ReadableStream<Uint8Array>({ start(controller) { controller.enqueue(new Uint8Array(65_536).fill(97)); controller.close(); } });
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(metadata()).mockResolvedValueOnce(new Response(body));
    const result = await new GoogleDriveReadConnector().readGoogleDocText("authorized-id", 65_536);
    expect(result.text).toHaveLength(65_536); expect(result.text).toBe("a".repeat(65_536));
  });

  it("decodes valid UTF-8 verbatim and fails malformed UTF-8 without replacement characters", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(metadata())
      .mockResolvedValueOnce(new Response(new TextEncoder().encode("café 日本語")));
    await expect(new GoogleDriveReadConnector().readGoogleDocText("authorized-id", 65_536)).resolves.toMatchObject({ text: "café 日本語" });
    fetchMock.mockResolvedValueOnce(metadata()).mockResolvedValueOnce(new Response(new Uint8Array([0xc3, 0x28])));
    await expect(new GoogleDriveReadConnector().readGoogleDocText("authorized-id", 65_536)).rejects.toThrow();
  });
});
