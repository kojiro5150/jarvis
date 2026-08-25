import { GoogleGmailSearchConnector, type GmailSearchConnector } from "../connectors/google/gmail-search";
import { evaluateGmailSearchAuthority, proposeGmailSearch, type GmailSearchWindow } from "./gmail-search-authority";

const PREFIX = /^gmail\.search(?:\s|$)/;
const EXACT = /^gmail\.search \[newer_than:(1d|7d)\]$/;
const SYNTAX = "gmail.search [newer_than:1d] or gmail.search [newer_than:7d]";

export type ProductionGmailSearchDependencies = Readonly<{ createConnector: () => GmailSearchConnector }>;
export type ProductionGmailSearchResult = Readonly<{ handled: boolean; decision?: "ALLOW"; reason?: string; reply?: string; messageIds?: readonly string[] }>;
const defaults: ProductionGmailSearchDependencies = { createConnector: () => new GoogleGmailSearchConnector() };

/** Handles the closed search grammar without content retrieval, models, or read chaining. */
export async function resolveProductionGmailSearch(input: { readonly currentUserUtterance: string }, dependencies: ProductionGmailSearchDependencies = defaults): Promise<ProductionGmailSearchResult> {
  if (!PREFIX.test(input.currentUserUtterance)) return Object.freeze({ handled: false });
  const match = input.currentUserUtterance.match(EXACT);
  if (!match) return Object.freeze({ handled: true, reason: "invalid_gmail_search_syntax", reply: `Invalid gmail.search syntax. Use: ${SYNTAX}.` });
  const operation = proposeGmailSearch(match[1] as GmailSearchWindow);
  const authority = evaluateGmailSearchAuthority(operation, input.currentUserUtterance);
  if (authority.decision !== "ALLOW") return Object.freeze({ handled: true, reason: authority.reason, reply: `Invalid gmail.search syntax. Use: ${SYNTAX}.` });
  try {
    const ids = Object.freeze([...(await dependencies.createConnector().search(operation.newerThan, operation.maxResults))].slice(0, operation.maxResults));
    return Object.freeze({ handled: true, decision: "ALLOW", reason: authority.reason, messageIds: ids,
      reply: ids.length ? `Gmail message IDs:\n${ids.map(id => `- ${id}`).join("\n")}` : "No Gmail message IDs found." });
  } catch {
    return Object.freeze({ handled: true, decision: "ALLOW", reason: "gmail_search_failed", reply: "I couldn't search Gmail right now." });
  }
}
