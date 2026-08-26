import { describe, expect, it, vi } from "vitest";

vi.mock("../connectors/google/access-token", () => ({ getValidGoogleAccessToken: vi.fn(async () => "test-token") }));
import { escapeDriveQueryLiteral, GoogleDriveSearchConnector } from "../connectors/google/drive-search";
import { resolveProductionDriveSearch } from "./production-drive-search";

describe("production drive.search", () => {
  it("authorizes the exact command before constructing the Google connector and preserves provider IDs", async () => {
    const order: string[] = [];
    const result = await resolveProductionDriveSearch({ currentUserUtterance: "drive.search Atlas" }, { createConnector: () => {
      order.push("connector");
      return { search: async (name, max) => {
        order.push(`${name}:${max}`);
        return [{ id: "provider-1", name: "Atlas plan", mimeType: "application/pdf", modifiedTime: "2026-08-25T00:00:00Z" }];
      } };
    } });
    expect(order).toEqual(["connector", "Atlas:5"]);
    expect(result).toMatchObject({ decision: "ALLOW", files: [{ id: "provider-1" }] });
    expect(result.reply).toContain("provider-1");
  });

  it.each(["drive.search", "drive.search ", " drive.search Atlas", "Drive.search Atlas", "search Drive for Atlas"])("does not broaden exact grammar: %s", async utterance => {
    const createConnector = vi.fn();
    const result = await resolveProductionDriveSearch({ currentUserUtterance: utterance }, { createConnector });
    expect(createConnector).not.toHaveBeenCalled();
    expect(result.handled).toBe(utterance.startsWith("drive.search"));
  });

  it("hard caps a misbehaving provider at five metadata records", async () => {
    const files = Array.from({ length: 8 }, (_, index) => ({ id: `id-${index}`, name: `Atlas ${index}`, mimeType: "text/plain", modifiedTime: "2026-08-25T00:00:00Z" }));
    const result = await resolveProductionDriveSearch({ currentUserUtterance: "drive.search Atlas" }, { createConnector: () => ({ search: async () => files }) });
    expect(result.files).toHaveLength(5);
  });

  it("escapes apostrophes and backslashes in Drive query literals", () => {
    expect(escapeDriveQueryLiteral("O'Reilly\\Atlas")).toBe("O\\'Reilly\\\\Atlas");
  });

  it("uses one deterministic metadata-only files.list request", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ files: [] }), { status: 200 }));
    await new GoogleDriveSearchConnector().search("O'Reilly", 5);
    const url = new URL(String(fetchMock.mock.calls[0][0]));
    expect(url.pathname).toBe("/drive/v3/files");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      q: "name contains 'O\\'Reilly' and trashed = false", pageSize: "5", orderBy: "modifiedTime desc,name",
      fields: "files(id,name,mimeType,modifiedTime)",
    });
    fetchMock.mockRestore();
  });
});
