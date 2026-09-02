import { DRIVE_READONLY_SCOPE, GOOGLE_DOC_MIME, GoogleDriveReadConnector, type DriveReadConnector } from "../connectors/google/drive-read";
import { readGoogleTokens } from "../connectors/google/tokens";
import { evaluateDriveReadAuthority, proposeDriveRead, type DriveReadOperation } from "./drive-read-authority";
import { resolvePendingAuthorization, type PendingAuthorizationReference } from "./pending-authorization";
export const DRIVE_READ_MAX_BYTES = 65_536;
const SYNTAX = "drive.read <provider-file-id> [text]";
const PREFIX = /^drive\.read(?:\s|$)/; const EXACT = /^drive\.read ([A-Za-z0-9_-]+) \[text\]$/;
export type DriveContentPolicy = Readonly<{ mimeType: typeof GOOGLE_DOC_MIME; contentMode: "text"; maxBytes: typeof DRIVE_READ_MAX_BYTES; releaseMode: "complete_verbatim" }>;
export const DRIVE_CONTENT_POLICY: DriveContentPolicy = Object.freeze({ mimeType: GOOGLE_DOC_MIME, contentMode: "text", maxBytes: DRIVE_READ_MAX_BYTES, releaseMode: "complete_verbatim" });
export type ProductionDriveReadDependencies = Readonly<{ loadPolicy: () => Promise<DriveContentPolicy | null>; hasOAuthCapability: () => Promise<boolean>; createConnector: () => DriveReadConnector }>;
export type ProductionDriveReadResult = Readonly<{ handled: boolean; decision?: "ALLOW" | "ASK" | "DENY"; reason?: string; reply?: string; pendingAuthorizationReference?: PendingAuthorizationReference | null }>;
const defaults: ProductionDriveReadDependencies = { loadPolicy: async () => DRIVE_CONTENT_POLICY,
  hasOAuthCapability: async () => new Set((await readGoogleTokens())?.scope.split(/\s+/)).has(DRIVE_READONLY_SCOPE),
  createConnector: () => new GoogleDriveReadConnector() };
export async function resolveProductionDriveRead(input: { readonly currentUserUtterance: string; readonly pendingAuthorizationReference?: unknown }, dependencies: ProductionDriveReadDependencies = defaults): Promise<ProductionDriveReadResult> {
  if (PREFIX.test(input.currentUserUtterance)) {
    const match = input.currentUserUtterance.match(EXACT);
    if (!match) return Object.freeze({ handled: true as const, reason: "invalid_drive_read_syntax", reply: `Invalid drive.read syntax. Use: ${SYNTAX}.` });
    const operation = proposeDriveRead(match[1]); const authority = evaluateDriveReadAuthority(operation, input.currentUserUtterance);
    if (authority.decision !== "ALLOW") return Object.freeze({ handled: true as const, reason: authority.reason, reply: `Invalid drive.read syntax. Use: ${SYNTAX}.` });
    return acquire(operation, authority.reason, dependencies);
  }
  if (Object.hasOwn(input, "pendingAuthorizationReference")) {
    const resolution = resolvePendingAuthorization({ currentUserUtterance: input.currentUserUtterance,
      pendingAuthorizationReference: input.pendingAuthorizationReference, expectedCapability: "drive.read" });
    if (resolution.reason === "pending_authorization_capability_mismatch") return Object.freeze({ handled: false as const });
    const operation = resolution.proposedOperation?.capability === "drive.read" ? resolution.proposedOperation : null;
    if (!operation) return Object.freeze({ handled: true as const, decision: resolution.decision === "ALLOW" ? "ASK" as const : resolution.decision,
      reason: resolution.reason, reply: resolution.decision === "DENY" ? "Understood. I will not read that Drive file." : "Please explicitly confirm that I may read that exact Drive file.",
      pendingAuthorizationReference: resolution.pendingAuthorizationReference });
    return acquire(operation, resolution.reason, dependencies);
  }
  return Object.freeze({ handled: false as const });
}
async function acquire(operation: DriveReadOperation, authorityReason: string, dependencies: ProductionDriveReadDependencies) {
  const policy = await dependencies.loadPolicy();
  if (!policy || policy.mimeType !== GOOGLE_DOC_MIME || policy.contentMode !== operation.contentMode || policy.maxBytes !== DRIVE_READ_MAX_BYTES)
    return Object.freeze({ handled: true as const, decision: "ALLOW" as const, reason: "drive_content_policy_denied", reply: "I can't release that Drive file under the current content policy." });
  if (!await dependencies.hasOAuthCapability()) return Object.freeze({ handled: true as const, decision: "ALLOW" as const, reason: "drive_oauth_scope_unavailable", reply: "Drive content access requires reconnecting Google with the drive.readonly scope." });
  try { const content = await dependencies.createConnector().readGoogleDocText(operation.fileId, policy.maxBytes);
    if (content.fileId !== operation.fileId || content.mimeType !== policy.mimeType) throw new Error("unsupported_drive_mime");
    return Object.freeze({ handled: true as const, decision: "ALLOW" as const, reason: authorityReason, reply: `Drive document (${operation.fileId}):\n${content.text}` });
  } catch (error) { const message = error instanceof Error ? error.message : "";
    const reason = message === "unsupported_drive_mime" ? "drive_content_policy_denied" : message === "drive_content_too_large" ? "drive_content_too_large" : "drive_read_failed";
    const reply = reason === "drive_content_too_large" ? `I can't release that Drive document because it exceeds ${DRIVE_READ_MAX_BYTES} bytes.` : reason === "drive_content_policy_denied" ? "I can't release that Drive file under the current content policy." : "I couldn't retrieve that Drive document right now.";
    return Object.freeze({ handled: true as const, decision: "ALLOW" as const, reason, reply }); }
}
