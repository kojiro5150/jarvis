import { GoogleGmailSearchConnector, type GmailSearchConnector } from "../connectors/google/gmail-search";
import { evaluateGmailSearchAuthority, proposeGmailSearch, type GmailSearchWindow } from "./gmail-search-authority";
import { proposeNaturalLanguageGmailSearch } from "./gmail-search-proposal";
import { createPendingAuthorization, resolvePendingAuthorization, type PendingAuthorizationReference } from "./pending-authorization";

const PREFIX = /^gmail\.search(?:\s|$)/;
const EXACT = /^gmail\.search \[newer_than:(1d|7d)\]$/;
const SYNTAX = "gmail.search [newer_than:1d] or gmail.search [newer_than:7d]";

export type ProductionGmailSearchDependencies = Readonly<{ createConnector: () => GmailSearchConnector }>;
export type ProductionGmailSearchResult = Readonly<{ handled: boolean; decision?: "ALLOW" | "ASK" | "DENY"; reason?: string; reply?: string; messageIds?: readonly string[]; pendingAuthorizationReference?: PendingAuthorizationReference | null }>;
const defaults: ProductionGmailSearchDependencies = { createConnector: () => new GoogleGmailSearchConnector() };

/** Handles the closed search grammar without content retrieval, models, or read chaining. */
export async function resolveProductionGmailSearch(input: { readonly currentUserUtterance: string; readonly pendingAuthorizationReference?: unknown }, dependencies: ProductionGmailSearchDependencies = defaults): Promise<ProductionGmailSearchResult> {
  if (Object.hasOwn(input, "pendingAuthorizationReference")) {
    const resolution = resolvePendingAuthorization({ currentUserUtterance: input.currentUserUtterance,
      pendingAuthorizationReference: input.pendingAuthorizationReference, expectedCapability: "gmail.search" });
    // A pending reference for another capability belongs to that capability's
    // resolver; search must not consume or mask it.
    if (resolution.reason === "pending_authorization_capability_mismatch") return Object.freeze({ handled: false });
    const operation = resolution.proposedOperation?.capability === "gmail.search" ? resolution.proposedOperation : null;
    if (!operation) return Object.freeze({ handled: true, decision: resolution.decision === "ALLOW" ? "ASK" : resolution.decision,
      reason: resolution.reason, reply: resolution.decision === "DENY" ? "Understood. I won't search Gmail." : "Please explicitly confirm that I may search Gmail.",
      pendingAuthorizationReference: resolution.pendingAuthorizationReference });
    return execute(operation, resolution.reason, dependencies);
  }
  if (!PREFIX.test(input.currentUserUtterance)) {
    const proposal = proposeNaturalLanguageGmailSearch(input.currentUserUtterance);
    if (!proposal) return Object.freeze({ handled: false });
    return Object.freeze({ handled: true, decision: "ASK", reason: "explicit_gmail_search_not_established",
      reply: "Please explicitly confirm that I may search Gmail.", pendingAuthorizationReference: createPendingAuthorization(proposal) });
  }
  const match = input.currentUserUtterance.match(EXACT);
  if (!match) return Object.freeze({ handled: true, reason: "invalid_gmail_search_syntax", reply: `Invalid gmail.search syntax. Use: ${SYNTAX}.` });
  const operation = proposeGmailSearch(match[1] as GmailSearchWindow);
  const authority = evaluateGmailSearchAuthority(operation, input.currentUserUtterance);
  if (authority.decision !== "ALLOW") return Object.freeze({ handled: true, reason: authority.reason, reply: `Invalid gmail.search syntax. Use: ${SYNTAX}.` });
  return execute(operation, authority.reason, dependencies);
}

async function execute(operation: ReturnType<typeof proposeGmailSearch>, reason: string, dependencies: ProductionGmailSearchDependencies): Promise<ProductionGmailSearchResult> {
  try {
    const ids = Object.freeze([...(await dependencies.createConnector().search(operation.newerThan, operation.maxResults))].slice(0, operation.maxResults));
    return Object.freeze({ handled: true, decision: "ALLOW", reason, messageIds: ids,
      reply: ids.length ? `Gmail message IDs:\n${ids.map(id => `- ${id}`).join("\n")}` : "No Gmail message IDs found." });
  } catch {
    return Object.freeze({ handled: true, decision: "ALLOW", reason: "gmail_search_failed", reply: "I couldn't search Gmail right now." });
  }
}
