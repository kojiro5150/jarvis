import { describe, expect, it, vi } from "vitest";
import { DRIVE_CONTENT_POLICY, DRIVE_READ_MAX_BYTES, resolveProductionDriveRead } from "./production-drive-read";
import { proposeDriveRead } from "./drive-read-authority";

const file = { fileId: "provider_315", mimeType: "application/vnd.google-apps.document" as const, text: "Exact document text." };
function deps(events: string[] = []) {
  const readGoogleDocText = vi.fn(async (id: string, bound: number) => { events.push(`acquire:${id}:${bound}`); return file; });
  const createConnector = vi.fn(() => { events.push("connector"); return { readGoogleDocText }; });
  const loadPolicy = vi.fn<() => Promise<typeof DRIVE_CONTENT_POLICY | null>>(async () => { events.push("policy"); return DRIVE_CONTENT_POLICY; });
  return { dependencies: { loadPolicy,
    hasOAuthCapability: vi.fn(async () => { events.push("oauth"); return true; }), createConnector }, createConnector, readGoogleDocText };
}

describe("identified Google Drive read authority", () => {
  it("defines the immutable exact closed operation", () => {
    const operation = proposeDriveRead("provider_315");
    expect(operation).toEqual({ capability: "drive.read", fileId: "provider_315", contentMode: "text" });
    expect(Object.isFrozen(operation)).toBe(true);
  });
  it("orders authority then policy, OAuth, connector, exact acquisition and bounded deterministic release", async () => {
    const events: string[] = []; const harness = deps(events);
    const result = await resolveProductionDriveRead({ currentUserUtterance: "drive.read provider_315 [text]" }, harness.dependencies);
    expect(events).toEqual(["policy", "oauth", "connector", `acquire:provider_315:${DRIVE_READ_MAX_BYTES}`]);
    expect(result).toMatchObject({ handled: true, decision: "ALLOW", reason: "explicit_drive_read", reply: "Drive document (provider_315):\nExact document text." });
  });
  it.each(["drive.read", "drive.read provider_315", "drive.read provider_315 [plain]", " drive.read provider_315 [text]", "drive.read report [text] extra"])("fails malformed syntax before policy or connector: %s", async utterance => {
    const harness = deps(); const result = await resolveProductionDriveRead({ currentUserUtterance: utterance }, harness.dependencies);
    expect(result.handled).toBe(utterance.startsWith("drive.read")); expect(harness.createConnector).not.toHaveBeenCalled();
    expect(harness.dependencies.loadPolicy).not.toHaveBeenCalled();
  });
  it("fails closed at policy and OAuth boundaries without constructing a connector", async () => {
    const harness = deps(); harness.dependencies.loadPolicy.mockResolvedValueOnce(null);
    expect((await resolveProductionDriveRead({ currentUserUtterance: "drive.read provider_315 [text]" }, harness.dependencies)).reason).toBe("drive_content_policy_denied");
    expect(harness.createConnector).not.toHaveBeenCalled();
    harness.dependencies.loadPolicy.mockResolvedValueOnce(DRIVE_CONTENT_POLICY); harness.dependencies.hasOAuthCapability.mockResolvedValueOnce(false);
    expect((await resolveProductionDriveRead({ currentUserUtterance: "drive.read provider_315 [text]" }, harness.dependencies)).reason).toBe("drive_oauth_scope_unavailable");
    expect(harness.createConnector).not.toHaveBeenCalled();
  });
  it("rejects MIME and size failures without truncating", async () => {
    const harness = deps(); harness.readGoogleDocText.mockRejectedValueOnce(new Error("unsupported_drive_mime"));
    expect((await resolveProductionDriveRead({ currentUserUtterance: "drive.read provider_315 [text]" }, harness.dependencies)).reason).toBe("drive_content_policy_denied");
    harness.readGoogleDocText.mockRejectedValueOnce(new Error("drive_content_too_large"));
    const result = await resolveProductionDriveRead({ currentUserUtterance: "drive.read provider_315 [text]" }, harness.dependencies);
    expect(result).toMatchObject({ reason: "drive_content_too_large", reply: expect.stringContaining("65536") });
  });
  it.each(["yes", "read it", "provider_315"])("does not treat search results or anaphora as read authority: %s", async utterance => {
    const harness = deps(); expect((await resolveProductionDriveRead({ currentUserUtterance: utterance }, harness.dependencies)).handled).toBe(false);
    expect(harness.createConnector).not.toHaveBeenCalled();
  });
});
