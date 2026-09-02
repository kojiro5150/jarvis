import { GoogleGmailSearchConnector, type GmailSearchConnector } from "../connectors/google/gmail-search";
import { GoogleGmailSenderSearchConnector, type GmailSenderSearchConnector } from "../connectors/google/gmail-sender-search";
import { GoogleGmailSubjectMetadataConnector } from "../connectors/google/gmail-subject-metadata";
import { GmailContentRetrievalAdapter, type GmailContentConnector } from "../content-retrieval";
import { loadContentRetrievalPolicy, type ContentRetrievalPolicy } from "../content-retrieval-policy";
import {
  evaluateGmailSearchAuthority,
  proposeGmailSearch,
  type GmailSearchWindow,
  type ProposedGmailSearchOperation,
  type ProposedGmailSenderSearchOperation,
  type ProposedGmailWindowSearchOperation,
} from "./gmail-search-authority";
import { proposeNaturalLanguageGmailSearch } from "./gmail-search-proposal";
import {
  parseGmailFromHeader,
  renderGmailSenderIdentity,
  resolveGmailSenderIdentity,
  type GmailSenderIdentity,
} from "./gmail-sender-identity";
import {
  createGmailSenderDisambiguationReference,
  renderGmailSenderDisambiguationCandidates,
  resolveGmailSenderDisambiguationReference,
  type GmailSenderDisambiguationReference,
} from "./gmail-sender-disambiguation-reference";
import { createPendingAuthorization, resolvePendingAuthorization, type PendingAuthorizationReference } from "./pending-authorization";
import { createGmailMessageListReference, type GmailMessageListReference } from "./gmail-message-list-reference";

const PREFIX = /^gmail\.search(?:\s|$)/;
const EXACT = /^gmail\.search \[newer_than:(1d|7d)\]$/;
const SYNTAX = "gmail.search [newer_than:1d] or gmail.search [newer_than:7d]";

export type ProductionGmailSearchDependencies = Readonly<{
  createConnector: () => GmailSearchConnector;
  createSenderConnector?: () => GmailSenderSearchConnector;
  createSubjectConnector?: () => GmailContentConnector;
  loadPolicy?: () => Promise<ContentRetrievalPolicy | null>;
}>;
export type ProductionGmailSearchResult = Readonly<{
  handled: boolean;
  decision?: "ALLOW" | "ASK" | "DENY";
  reason?: string;
  reply?: string;
  messageIds?: readonly string[];
  pendingAuthorizationReference?: PendingAuthorizationReference | null;
  gmailSenderDisambiguationReference?: GmailSenderDisambiguationReference | null;
  gmailMessageListReference?: GmailMessageListReference | null;
}>;
const defaults = {
  createConnector: () => new GoogleGmailSearchConnector(),
  createSenderConnector: () => new GoogleGmailSenderSearchConnector(),
  createSubjectConnector: () => new GoogleGmailSubjectMetadataConnector(),
  loadPolicy: () => loadContentRetrievalPolicy(process.env.CONTENT_RETRIEVAL_POLICY_PATH),
} satisfies Required<ProductionGmailSearchDependencies>;

/** Handles bounded Gmail discovery and deterministic factual completion without model-visible Gmail evidence. */
export async function resolveProductionGmailSearch(
  input: {
    readonly currentUserUtterance: string;
    readonly pendingAuthorizationReference?: unknown;
    readonly gmailSenderDisambiguationReference?: unknown;
  },
  dependencies: ProductionGmailSearchDependencies = defaults,
): Promise<ProductionGmailSearchResult> {
  const isExplicitSearchCommand = PREFIX.test(input.currentUserUtterance);
  const freshNaturalProposal = isExplicitSearchCommand
    ? null
    : proposeNaturalLanguageGmailSearch(input.currentUserUtterance);

  if (Object.hasOwn(input, "gmailSenderDisambiguationReference")
      && input.gmailSenderDisambiguationReference !== null
      && input.gmailSenderDisambiguationReference !== undefined
      && !isExplicitSearchCommand
      && freshNaturalProposal === null) {
    const refinement = resolveGmailSenderDisambiguationReference({
      reference: input.gmailSenderDisambiguationReference,
      currentUserUtterance: input.currentUserUtterance,
    });
    if (refinement.status === "matched") {
      return executeResolvedSenderSearch(
        refinement.identity,
        refinement.maxResults,
        "gmail_sender_disambiguation_resolved",
        dependencies,
      );
    }
    if (refinement.status === "ambiguous" || refinement.status === "not_found") {
      return Object.freeze({
        handled: true,
        decision: "ALLOW",
        reason: `gmail_sender_disambiguation_${refinement.status}`,
        reply: [
          refinement.status === "ambiguous"
            ? "That still matches more than one of the real Gmail sender candidates:"
            : "That does not uniquely match one of the real Gmail sender candidates:",
          renderGmailSenderDisambiguationCandidates(refinement.identities),
          "Please use the sender's exact displayed name or address.",
        ].join("\n"),
        gmailSenderDisambiguationReference: refinement.reference,
      });
    }
    return Object.freeze({
      handled: true,
      decision: "ASK",
      reason: `gmail_sender_disambiguation_${refinement.status}`,
      reply: "That sender disambiguation is no longer active. Please start a new Gmail sender search.",
      gmailSenderDisambiguationReference: null,
    });
  }

  if (Object.hasOwn(input, "pendingAuthorizationReference")) {
    const resolution = resolvePendingAuthorization({
      currentUserUtterance: input.currentUserUtterance,
      pendingAuthorizationReference: input.pendingAuthorizationReference,
      expectedCapability: "gmail.search",
    });
    if (resolution.reason === "pending_authorization_capability_mismatch") return Object.freeze({ handled: false });
    const operation = resolution.proposedOperation?.capability === "gmail.search" ? resolution.proposedOperation : null;
    if (!operation) {
      return Object.freeze({
        handled: true,
        decision: resolution.decision === "ALLOW" ? "ASK" : resolution.decision,
        reason: resolution.reason,
        reply: resolution.decision === "DENY"
          ? "Understood. I won't search Gmail."
          : "Please explicitly confirm that I may search Gmail.",
        pendingAuthorizationReference: resolution.pendingAuthorizationReference,
      });
    }
    return execute(operation, resolution.reason, dependencies);
  }

  if (!isExplicitSearchCommand) {
    const proposal = freshNaturalProposal;
    if (!proposal) return Object.freeze({ handled: false });
    return Object.freeze({
      handled: true,
      decision: "ASK",
      reason: "explicit_gmail_search_not_established",
      reply: "Please explicitly confirm that I may search Gmail.",
      pendingAuthorizationReference: createPendingAuthorization(proposal),
      ...(Object.hasOwn(input, "gmailSenderDisambiguationReference")
        ? { gmailSenderDisambiguationReference: null }
        : {}),
    });
  }

  const match = input.currentUserUtterance.match(EXACT);
  if (!match) {
    return Object.freeze({
      handled: true,
      reason: "invalid_gmail_search_syntax",
      reply: `Invalid gmail.search syntax. Use: ${SYNTAX}.`,
    });
  }
  const operation = proposeGmailSearch(match[1] as GmailSearchWindow);
  const authority = evaluateGmailSearchAuthority(operation, input.currentUserUtterance);
  if (authority.decision !== "ALLOW") {
    return Object.freeze({
      handled: true,
      reason: authority.reason,
      reply: `Invalid gmail.search syntax. Use: ${SYNTAX}.`,
    });
  }
  return execute(operation, authority.reason, dependencies);
}

async function execute(
  operation: ProposedGmailSearchOperation,
  reason: string,
  dependencies: ProductionGmailSearchDependencies,
): Promise<ProductionGmailSearchResult> {
  return operation.resultMode === "sender_match"
    ? executeSenderSearch(operation, reason, dependencies)
    : executeWindowSearch(operation, reason, dependencies);
}

async function executeWindowSearch(
  operation: ProposedGmailWindowSearchOperation,
  reason: string,
  dependencies: ProductionGmailSearchDependencies,
): Promise<ProductionGmailSearchResult> {
  let ids: readonly string[];
  try {
    ids = Object.freeze([
      ...(await dependencies.createConnector().search(operation.newerThan, operation.maxResults)),
    ].slice(0, operation.maxResults));
  } catch {
    return Object.freeze({
      handled: true,
      decision: "ALLOW",
      reason: "gmail_search_failed",
      reply: "I couldn't search Gmail right now.",
    });
  }

  if (operation.resultMode !== "subject_list") {
    return Object.freeze({
      handled: true,
      decision: "ALLOW",
      reason,
      messageIds: ids,
      reply: ids.length
        ? `Gmail message IDs:\n${ids.map(id => `- ${id}`).join("\n")}`
        : "No Gmail message IDs found.",
    });
  }

  if (ids.length === 0) {
    return Object.freeze({
      handled: true,
      decision: "ALLOW",
      reason,
      messageIds: ids,
      reply: "No recent Gmail messages found.",
    });
  }

  return releaseMetadata({
    ids,
    reason,
    intro: "Recent Gmail messages:",
    requestingRuntime: "api-lighter-chat:gmail-subject-list",
    policyFailureReply: "I found recent Gmail messages, but I couldn't safely evaluate the policy required to release their subjects.",
    policyDeniedReply: "I found recent Gmail messages, but I can't release their subjects under the current resource policy.",
    retrievalFailureReply: "I found recent Gmail messages, but I couldn't safely retrieve their sender and subject metadata.",
    includeSender: true,
  }, dependencies);
}

async function executeSenderSearch(
  operation: ProposedGmailSenderSearchOperation,
  reason: string,
  dependencies: ProductionGmailSearchDependencies,
): Promise<ProductionGmailSearchResult> {
  const senderConnector = dependencies.createSenderConnector?.() ?? defaults.createSenderConnector();
  let scan;
  try {
    scan = await senderConnector.discoverSenderIdentities(operation.senderTerms, operation.identityScanLimit);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.warn(`[gmail-sender-search] sender identity discovery failed: ${detail}`);
    return Object.freeze({
      handled: true,
      decision: "ALLOW",
      reason: "gmail_sender_identity_search_failed",
      reply: "I couldn't safely resolve that sender in Gmail right now.",
    });
  }

  if (!scan.complete) {
    return Object.freeze({
      handled: true,
      decision: "ALLOW",
      reason: scan.incompleteReason === "metadata_incomplete"
        ? "gmail_sender_identity_metadata_incomplete"
        : "gmail_sender_identity_scope_incomplete",
      reply: scan.incompleteReason === "metadata_incomplete"
        ? "I couldn't safely verify all matching sender identities in Gmail right now."
        : "That sender reference matches too many mailbox messages for me to prove the identity is unique. Please use more of the sender's name or address.",
    });
  }

  const resolution = resolveGmailSenderIdentity(operation.senderTerms, scan.identities);
  if (resolution.status === "not_found") {
    return Object.freeze({
      handled: true,
      decision: "ALLOW",
      reason: "gmail_sender_identity_not_found",
      reply: "I couldn't find a real Gmail sender matching that reference.",
    });
  }

  if (resolution.status === "ambiguous") {
    const reference = createGmailSenderDisambiguationReference({
      identities: resolution.identities,
      maxResults: operation.maxResults,
    });
    return Object.freeze({
      handled: true,
      decision: "ALLOW",
      reason: "gmail_sender_identity_ambiguous",
      reply: [
        "I found more than one real Gmail sender matching that reference:",
        ...resolution.identities.map(identity => `- ${renderGmailSenderIdentity(identity)}`),
        "Please be more specific.",
      ].join("\n"),
      gmailSenderDisambiguationReference: reference,
    });
  }

  return executeResolvedSenderSearch(resolution.identity, operation.maxResults, reason, dependencies);
}

async function executeResolvedSenderSearch(
  sender: GmailSenderIdentity,
  maxResults: 5,
  reason: string,
  dependencies: ProductionGmailSearchDependencies,
): Promise<ProductionGmailSearchResult> {
  const senderConnector = dependencies.createSenderConnector?.() ?? defaults.createSenderConnector();
  let ids: readonly string[];
  try {
    ids = Object.freeze([
      ...(await senderConnector.searchByAddress(sender.address, maxResults)),
    ].slice(0, maxResults));
  } catch {
    return Object.freeze({
      handled: true,
      decision: "ALLOW",
      reason: "gmail_sender_search_failed",
      reply: "I resolved the sender, but I couldn't search Gmail for their messages right now.",
      gmailSenderDisambiguationReference: null,
    });
  }

  const senderLabel = renderGmailSenderIdentity(sender);
  if (ids.length === 0) {
    return Object.freeze({
      handled: true,
      decision: "ALLOW",
      reason,
      messageIds: ids,
      reply: `No Gmail messages found from ${senderLabel}.`,
      gmailSenderDisambiguationReference: null,
    });
  }

  const released = await releaseMetadata({
    ids,
    reason,
    intro: `Gmail messages from ${senderLabel}:`,
    requestingRuntime: "api-lighter-chat:gmail-sender-search",
    policyFailureReply: `I found Gmail messages from ${senderLabel}, but I couldn't safely evaluate the policy required to release their subjects.`,
    policyDeniedReply: `I found Gmail messages from ${senderLabel}, but I can't release their subjects under the current resource policy.`,
    retrievalFailureReply: `I found Gmail messages from ${senderLabel}, but I couldn't safely retrieve their subjects.`,
    includeSender: false,
    resolvedSenderIdentity: sender,
  }, dependencies);
  return Object.freeze({ ...released, gmailSenderDisambiguationReference: null });
}

async function releaseMetadata(
  input: Readonly<{
    ids: readonly string[];
    reason: string;
    intro: string;
    requestingRuntime: string;
    policyFailureReply: string;
    policyDeniedReply: string;
    retrievalFailureReply: string;
    includeSender: boolean;
    resolvedSenderIdentity?: GmailSenderIdentity;
  }>,
  dependencies: ProductionGmailSearchDependencies,
): Promise<ProductionGmailSearchResult> {
  const createSubjectConnector = dependencies.createSubjectConnector ?? defaults.createSubjectConnector;
  const loadPolicy = dependencies.loadPolicy ?? defaults.loadPolicy;
  let policy: ContentRetrievalPolicy | null;
  try {
    policy = await loadPolicy();
  } catch {
    return Object.freeze({
      handled: true,
      decision: "ALLOW",
      reason: "gmail_subject_list_policy_failed",
      messageIds: input.ids,
      reply: input.policyFailureReply,
    });
  }

  const adapter = new GmailContentRetrievalAdapter({ connector: createSubjectConnector() });
  const messages: { sender: string; subject: string; senderIdentity: GmailSenderIdentity | null }[] = [];
  for (const id of input.ids) {
    const retrieval = await adapter.retrieve(Object.freeze({
      resource: Object.freeze({ resourceId: id, connectorType: "email" as const }),
      requestedFields: input.includeSender
        ? Object.freeze(["sender", "subject"] as const)
        : Object.freeze(["subject"] as const),
      requestingRuntime: input.requestingRuntime,
    }), policy);
    if (retrieval.outcome === "denied") {
      return Object.freeze({
        handled: true,
        decision: "ALLOW",
        reason: "gmail_subject_list_policy_denied",
        messageIds: input.ids,
        reply: input.policyDeniedReply,
      });
    }
    if (retrieval.outcome !== "permitted" || !retrieval.content) {
      return Object.freeze({
        handled: true,
        decision: "ALLOW",
        reason: "gmail_subject_list_retrieval_failed",
        messageIds: input.ids,
        reply: input.retrievalFailureReply,
      });
    }
    const sender = input.includeSender ? (retrieval.content.sender ?? "(sender unavailable)") : "";
    messages.push({
      sender,
      subject: retrieval.content.subject ?? "(no subject)",
      senderIdentity: input.includeSender ? parseGmailFromHeader(sender) : null,
    });
  }

  return Object.freeze({
    handled: true,
    decision: "ALLOW",
    reason: input.reason,
    messageIds: input.ids,
    ...(input.includeSender || input.resolvedSenderIdentity
      ? {
          gmailMessageListReference: createGmailMessageListReference({
            messageIds: input.ids,
            senderIdentities: input.resolvedSenderIdentity
              ? input.ids.map(() => input.resolvedSenderIdentity!)
              : messages.map(message => message.senderIdentity),
          }),
        }
      : {}),
    reply: input.includeSender
      ? `${input.intro}\n${messages.map(({ sender, subject }, index) => `${index + 1}. From: ${sender}\n   Subject: ${subject}`).join("\n")}`
      : `${input.intro}\n${messages.map(({ subject }) => `- ${subject}`).join("\n")}`,
  });
}
