import { GoogleDriveSearchConnector, type DriveSearchConnector, type DriveSearchMetadata } from "../connectors/google/drive-search";
import { evaluateDriveSearchAuthority, proposeDriveSearch } from "./drive-search-authority";

const PREFIX = /^drive\.search(?:\s|$)/;
const EXACT = /^drive\.search (\S(?:[^\r\n]*\S)?)$/;
const SYNTAX = "drive.search <file name>";

export type ProductionDriveSearchDependencies = Readonly<{ createConnector: () => DriveSearchConnector }>;
export type ProductionDriveSearchResult = Readonly<{ handled: boolean; decision?: "ALLOW"; reason?: string; reply?: string; files?: readonly DriveSearchMetadata[] }>;
const defaults: ProductionDriveSearchDependencies = { createConnector: () => new GoogleDriveSearchConnector() };

/** Exact-command-only authority and deterministic metadata release; there is no proposal/ASK path. */
export async function resolveProductionDriveSearch(input: { readonly currentUserUtterance: string }, dependencies: ProductionDriveSearchDependencies = defaults): Promise<ProductionDriveSearchResult> {
  if (!PREFIX.test(input.currentUserUtterance)) return Object.freeze({ handled: false });
  const match = input.currentUserUtterance.match(EXACT);
  if (!match) return Object.freeze({ handled: true, reason: "invalid_drive_search_syntax", reply: `Invalid drive.search syntax. Use: ${SYNTAX}.` });
  const operation = proposeDriveSearch(match[1]);
  const authority = evaluateDriveSearchAuthority(operation, input.currentUserUtterance);
  if (authority.decision !== "ALLOW") return Object.freeze({ handled: true, reason: authority.reason, reply: `Invalid drive.search syntax. Use: ${SYNTAX}.` });
  try {
    const files = Object.freeze([...(await dependencies.createConnector().search(operation.name, operation.maxResults))].slice(0, 5));
    const reply = files.length ? `Drive files:\n${files.map(file => `- ${file.name} — ${file.mimeType} — ${file.modifiedTime} — ${file.id}`).join("\n")}` : "No Drive files found.";
    return Object.freeze({ handled: true, decision: "ALLOW", reason: authority.reason, files, reply });
  } catch {
    return Object.freeze({ handled: true, decision: "ALLOW", reason: "drive_search_failed", reply: "I couldn't search Drive right now." });
  }
}
