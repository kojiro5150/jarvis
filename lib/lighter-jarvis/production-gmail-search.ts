import { GoogleGmailSearchConnector, type GmailSearchConnector } from "../connectors/google/gmail-search";
import { GoogleGmailSubjectMetadataConnector } from "../connectors/google/gmail-subject-metadata";
import { GmailContentRetrievalAdapter, type GmailContentConnector } from "../content-retrieval";
import { loadContentRetrievalPolicy, type ContentRetrievalPolicy } from "../content-retrieval-policy";
import { evaluateGmailSearchAuthority, proposeGmailSearch, type GmailSearchWindow, type ProposedGmailSearchOperation } from "./gmail-search-authority";
import { proposeNaturalLanguageGmailSearch } from "./gmail-search-proposal";
import { createPendingAuthorization, resolvePendingAuthorization, type PendingAuthorizationReference } from "./pending-authorization";

const PREFIX = /^gmail\.search(?:\s|$)/;
const EXACT = /^gmail\.search \[newer_than:(1d|7d)\]$/;
const SYNTAX = "gmail.search [newer_than:1d] or gmail.search [newer_than:7d]";

export type ProductionGmailSearchDependencies = Readonly<{
  createConnector: () => GmailSearchConnector;
  createSubjectConnector?: () => GmailContentConnector;
  loadPolicy?: () => Promise<ContentRetrievalPolicy | null>;
}>;
export type ProductionGmailSearchResult = Readonly<{ handled: boolean; decision?: "ALLOW" | "ASK" | "DENY"; reason?: string; reply?: string; messageIds?: readonly string[]; pendingAuthorizationReference?: PendingAuthorizationReference | null }>;
const defaults: Required<ProductionGmailSearchDependencies> = {
  createConnector: () => new GoogleGmailSearchConnector(),
  createSubjectConnector: () => new GoogleGmailSubjectMetadataConnector(),
  loadPolicy: () => loadContentRetrievalPolicy(process.env.CONTENT_RETRIEVAL_POLICY_PATH),
};

/** Handles bounded Gmail discovery and deterministic factual completion without model-visible Gmail evidence. */
export async function resolveProductionGmailSearch(input: { readonly currentUserUtterance: string; readonly pendingAuthorizationReference?: unknown }, dependencies: ProductionGmailSearchDependencies = defaults): Promise<ProductionGmailSearchResult> {
  if (Object.hasOwn(input, "pendingAuthorizationReference")) {
    const resolution = resolvePendingAuthorization({ currentUserUtterance: input.currentUserUtterance,
      pendingAuthorizationReference: input.pendingAuthorizationReference, expectedCapability: "gmail.search" });
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

async function execute(operation: ProposedGmailSearchOperation, reason: string, dependencies: ProductionGmailSearchDependencies): Promise<ProductionGmailSearchResult> {
  let ids: readonly string[];
  try {
    ids = Object.freeze([...(await dependencies.createConnector().search(operation.newerThan, operation.maxResults))].slice(0, operation.maxResults));
  } catch {
    return Object.freeze({ handled: true, decision: "ALLOW", reason: "gmail_search_failed", reply: "I couldn't search Gmail right now." });
  }

  if (operation.resultMode !== "subject_list") {
    return Object.freeze({ handled: true, decision: "ALLOW", reason, messageIds: ids,
      reply: ids.length ? `Gmail message IDs:\n${ids.map(id => `- ${id}`).join("\n")}` : "No Gmail message IDs found." });
  }

  if (ids.length === 0) {
    return Object.freeze({ handled: true, decision: "ALLOW", reason, messageIds: ids, reply: "No recent Gmail messages found." });
  }

  const createSubjectConnector = dependencies.createSubjectConnector ?? defaults.createSubjectConnector;
  const loadPolicy = dependencies.loadPolicy ?? defaults.loadPolicy;
  let policy: ContentRetrievalPolicy | null;
  try {
    policy = await loadPolicy();
  } catch {
    return Object.freeze({ handled: true, decision: "ALLOW", reason: "gmail_subject_list_policy_failed", messageIds: ids,
      reply: "I found recent Gmail messages, but I couldn't safely evaluate the policy required to release their subjects." });
  }

  const adapter = new GmailContentRetrievalAdapter({ connector: createSubjectConnector() });
  const subjects: string[] = [];
  for (const id of ids) {
    const retrieval = await adapter.retrieve(Object.freeze({
      resource: Object.freeze({ resourceId: id, connectorType: "email" as const }),
      requestedFields: Object.freeze(["subject"] as const),
      requestingRuntime: "api-lighter-chat:gmail-subject-list",
    }), policy);
    if (retrieval.outcome === "denied") {
      return Object.freeze({ handled: true, decision: "ALLOW", reason: "gmail_subject_list_policy_denied", messageIds: ids,
        reply: "I found recent Gmail messages, but I can't release their subjects under the current resource policy." });
    }
    if (retrieval.outcome !== "permitted" || !retrieval.content) {
      return Object.freeze({ handled: true, decision: "ALLOW", reason: "gmail_subject_list_retrieval_failed", messageIds: ids,
        reply: "I found recent Gmail messages, but I couldn't safely retrieve their subjects." });
    }
    subjects.push(retrieval.content.subject ?? "(no subject)");
  }

  return Object.freeze({
    handled: true,
    decision: "ALLOW",
    reason,
    messageIds: ids,
    reply: `Recent Gmail messages:\n${subjects.map(subject => `- ${subject}`).join("\n")}`,
  });
}
