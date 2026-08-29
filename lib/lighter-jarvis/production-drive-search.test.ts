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

  it("preserves exact-command authority even when the client supplies a null pending reference", async () => {
    const search = vi.fn(async () => []);
    const result = await resolveProductionDriveSearch({ currentUserUtterance: "drive.search Atlas", pendingAuthorizationReference: null },
      { createConnector: () => ({ search }) });
    expect(result).toMatchObject({ decision: "ALLOW", reason: "explicit_drive_search" });
    expect(search).toHaveBeenCalledWith("Atlas", 5);
  });

  it.each(["drive.search", "drive.search ", " drive.search Atlas", "Drive.search Atlas"])("does not broaden exact grammar: %s", async utterance => {
    const createConnector = vi.fn();
    const result = await resolveProductionDriveSearch({ currentUserUtterance: utterance }, { createConnector });
    expect(createConnector).not.toHaveBeenCalled();
    expect(result.handled).toBe(utterance.startsWith("drive.search"));
  });

  it("accepts 'search Drive for Atlas' as a proposal only, never as authority", async () => {
    const createConnector = vi.fn();
    const proposed = await resolveProductionDriveSearch({ currentUserUtterance: "search Drive for Atlas" }, { createConnector });
    expect(proposed).toMatchObject({
      handled: true,
      decision: "ASK",
      reason: "explicit_drive_search_not_established",
      pendingAuthorizationReference: { pendingAuthorizationId: expect.any(String) },
    });
    expect(createConnector).not.toHaveBeenCalled();
  });

  it("hard caps a misbehaving provider at five metadata records", async () => {
    const files = Array.from({ length: 8 }, (_, index) => ({ id: `id-${index}`, name: `Atlas ${index}`, mimeType: "text/plain", modifiedTime: "2026-08-25T00:00:00Z" }));
    const result = await resolveProductionDriveSearch({ currentUserUtterance: "drive.search Atlas" }, { createConnector: () => ({ search: async () => files }) });
    expect(result.files).toHaveLength(5);
  });

  it("asks, then executes the exact stored proposal once on explicit confirmation", async () => {
    const search = vi.fn(async () => [{ id: "provider-1", name: "Atlas", mimeType: "text/plain", modifiedTime: "2026-08-25T00:00:00Z" }]);
    const dependencies = { createConnector: vi.fn(() => ({ search })) };
    const proposed = await resolveProductionDriveSearch({ currentUserUtterance: "Search my Drive for Atlas" }, dependencies);
    expect(proposed).toMatchObject({ decision: "ASK", reason: "explicit_drive_search_not_established" });
    expect(dependencies.createConnector).not.toHaveBeenCalled();

    const confirmed = await resolveProductionDriveSearch({ currentUserUtterance: "yes",
      pendingAuthorizationReference: proposed.pendingAuthorizationReference }, dependencies);
    expect(confirmed).toMatchObject({ decision: "ALLOW", reason: "pending_authorization_confirmed", files: [{ id: "provider-1" }] });
    expect(search).toHaveBeenCalledWith("Atlas", 5);

    const replay = await resolveProductionDriveSearch({ currentUserUtterance: "yes",
      pendingAuthorizationReference: proposed.pendingAuthorizationReference }, dependencies);
    expect(replay).toMatchObject({ decision: "ASK", reason: "pending_authorization_already_consumed" });
    expect(search).toHaveBeenCalledOnce();
  });

  it.each(["Yes.", "YES", "yes!", "yes please", "yes"])("resolves an intact active Drive reference equivalently: %s", async confirmation => {
    const search = vi.fn(async () => []);
    const dependencies = { createConnector: vi.fn(() => ({ search })) };
    const proposed = await resolveProductionDriveSearch({ currentUserUtterance: "Search my Drive for Atlas" }, dependencies);
    const result = await resolveProductionDriveSearch({ currentUserUtterance: confirmation,
      pendingAuthorizationReference: proposed.pendingAuthorizationReference }, dependencies);
    expect(result).toMatchObject({ decision: "ALLOW", reason: "pending_authorization_confirmed" });
    expect(search).toHaveBeenCalledWith("Atlas", 5);
  });

  it("does not treat bare confirmation or another capability's pending state as Drive authority", async () => {
    expect((await resolveProductionDriveSearch({ currentUserUtterance: "yes" })).handled).toBe(false);
    const foreign = (await import("./pending-authorization")).createPendingAuthorization(
      (await import("./gmail-search-authority")).proposeGmailSearch("1d"),
    );
    expect((await resolveProductionDriveSearch({ currentUserUtterance: "yes", pendingAuthorizationReference: foreign })).handled).toBe(false);
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
