import { GoogleDriveSearchConnector, type DriveSearchConnector, type DriveSearchMetadata } from "../connectors/google/drive-search";
import { evaluateDriveSearchAuthority, proposeDriveSearch } from "./drive-search-authority";
import { proposeNaturalLanguageDriveSearch } from "./drive-search-proposal";
import { createPendingAuthorization, resolvePendingAuthorization, type PendingAuthorizationReference } from "./pending-authorization";

const PREFIX = /^drive\.search(?:\s|$)/;
const EXACT = /^drive\.search (\S(?:[^\r\n]*\S)?)$/;
const SYNTAX = "drive.search <file name>";

export type ProductionDriveSearchDependencies = Readonly<{ createConnector: () => DriveSearchConnector }>;
export type ProductionDriveSearchResult = Readonly<{ handled: boolean; decision?: "ALLOW" | "ASK" | "DENY"; reason?: string; reply?: string; files?: readonly DriveSearchMetadata[]; pendingAuthorizationReference?: PendingAuthorizationReference | null }>;
const defaults: ProductionDriveSearchDependencies = { createConnector: () => new GoogleDriveSearchConnector() };

/** Exact-command authority plus one bounded proposal form; both execute the same metadata-only operation. */
export async function resolveProductionDriveSearch(input: { readonly currentUserUtterance: string; readonly pendingAuthorizationReference?: unknown }, dependencies: ProductionDriveSearchDependencies = defaults): Promise<ProductionDriveSearchResult> {
  if (PREFIX.test(input.currentUserUtterance)) {
    const match = input.currentUserUtterance.match(EXACT);
    if (!match) return Object.freeze({ handled: true, reason: "invalid_drive_search_syntax", reply: `Invalid drive.search syntax. Use: ${SYNTAX}.` });
    const operation = proposeDriveSearch(match[1]);
    const authority = evaluateDriveSearchAuthority(operation, input.currentUserUtterance);
    if (authority.decision !== "ALLOW") return Object.freeze({ handled: true, reason: authority.reason, reply: `Invalid drive.search syntax. Use: ${SYNTAX}.` });
    return execute(operation, authority.reason, dependencies);
  }
  if (Object.hasOwn(input, "pendingAuthorizationReference")) {
    const resolution = resolvePendingAuthorization({ currentUserUtterance: input.currentUserUtterance,
      pendingAuthorizationReference: input.pendingAuthorizationReference, expectedCapability: "drive.search" });
    if (resolution.reason === "pending_authorization_capability_mismatch") return Object.freeze({ handled: false });
    const operation = resolution.proposedOperation?.capability === "drive.search" ? resolution.proposedOperation : null;
    if (!operation) return Object.freeze({ handled: true, decision: resolution.decision === "ALLOW" ? "ASK" : resolution.decision,
      reason: resolution.reason, reply: resolution.decision === "DENY" ? "Understood. I won't search Drive." : "Please explicitly confirm that I may search Drive.",
      pendingAuthorizationReference: resolution.pendingAuthorizationReference });
    return execute(operation, resolution.reason, dependencies);
  }
  const proposal = proposeNaturalLanguageDriveSearch(input.currentUserUtterance);
  if (!proposal) return Object.freeze({ handled: false });
  return Object.freeze({ handled: true, decision: "ASK", reason: "explicit_drive_search_not_established",
    reply: "Please explicitly confirm that I may search Drive.", pendingAuthorizationReference: createPendingAuthorization(proposal) });
}

async function execute(operation: ReturnType<typeof proposeDriveSearch>, reason: string, dependencies: ProductionDriveSearchDependencies): Promise<ProductionDriveSearchResult> {
  try {
    const files = Object.freeze([...(await dependencies.createConnector().search(operation.name, operation.maxResults))].slice(0, 5));
    const reply = files.length ? `Drive files:\n${files.map(file => `- ${file.name} — ${file.mimeType} — ${file.modifiedTime} — ${file.id}`).join("\n")}` : "No Drive files found.";
    return Object.freeze({ handled: true, decision: "ALLOW", reason, files, reply });
  } catch {
    return Object.freeze({ handled: true, decision: "ALLOW", reason: "drive_search_failed", reply: "I couldn't search Drive right now." });
  }
}
