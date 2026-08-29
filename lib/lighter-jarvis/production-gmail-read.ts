import { authorizeGmailCapability } from "../chat-capabilities/gmail-authority";
import { GoogleGmailContentConnector } from "../chat-capabilities/google-gmail-content";
import { GmailContentRetrievalAdapter, GMAIL_CONTENT_FIELDS, type GmailContentConnector, type GmailContentField, type GmailReleasedContent } from "../content-retrieval";
import { loadContentRetrievalPolicy, type ContentRetrievalPolicy } from "../content-retrieval-policy";

const SYNTAX = "gmail.read <message-id> [sender|subject|snippet|plain_text_body|attachment_filenames|attachment_mime_metadata]";
const COMMAND_PREFIX = /^gmail\.read(?:\s|$)/;
const EXACT_COMMAND = /^gmail\.read ([^\s\[\],<>]+) \[([^\]]+)\]$/;

export type ProductionGmailDependencies = Readonly<{
  createConnector: () => GmailContentConnector;
  loadPolicy: () => Promise<ContentRetrievalPolicy | null>;
}>;

export type ProductionGmailReadResult = Readonly<{
  handled: boolean;
  decision?: "ALLOW" | "ASK" | "DENY";
  reason?: string;
  reply?: string;
  pendingAuthorizationReference?: import("./pending-authorization").PendingAuthorizationReference | null;
}>;

const defaults: ProductionGmailDependencies = {
  createConnector: () => new GoogleGmailContentConnector(),
  loadPolicy: () => loadContentRetrievalPolicy(process.env.CONTENT_RETRIEVAL_POLICY_PATH),
};

function syntaxReply(): string {
  return `Invalid gmail.read syntax. Use: ${SYNTAX}. Separate multiple fields with commas.`;
}

function present(content: GmailReleasedContent, requestedFields: readonly GmailContentField[]): string {
  return requestedFields.map((field) => {
    switch (field) {
      case "sender": return `From: ${content.sender ?? "(unavailable)"}`;
      case "subject": return `Subject: ${content.subject ?? "(unavailable)"}`;
      case "snippet": return `Snippet: ${content.snippet ?? "(unavailable)"}`;
      case "plain_text_body": return `Plain text body: ${content.plainTextBody ?? "(unavailable)"}`;
      case "attachment_filenames": return `Attachment filenames: ${content.attachmentFilenames?.join(", ") || "(none)"}`;
      case "attachment_mime_metadata": return `Attachment MIME metadata: ${content.attachmentMimeMetadata?.map(({ filename, mimeType }) => `${filename} (${mimeType})`).join(", ") || "(none)"}`;
    }
  }).join("\n");
}

/** Intercepts only the closed, identified-message grammar. It never searches or interprets Gmail. */
export async function resolveProductionGmailRead(
  input: { readonly currentUserUtterance: string; readonly pendingAuthorizationReference?: unknown },
  dependencies: ProductionGmailDependencies = defaults,
): Promise<ProductionGmailReadResult> {
  const currentUserUtterance = input.currentUserUtterance;
  const utterance = currentUserUtterance.trim();
  const hasPendingReference = input.pendingAuthorizationReference !== undefined;
  if (!hasPendingReference && !COMMAND_PREFIX.test(utterance)) return Object.freeze({ handled: false });

  if (hasPendingReference) {
    const placeholderRequest = Object.freeze({ resource: Object.freeze({ resourceId: "pending-server-operation", connectorType: "email" as const }),
      requestedFields: Object.freeze(["subject"] as GmailContentField[]), requestingRuntime: "api-lighter-chat" });
    const authority = authorizeGmailCapability({ currentUserUtterance, capability: Object.freeze({
      operation: "governed_gmail_retrieval", request: placeholderRequest,
      pendingAuthorizationReference: input.pendingAuthorizationReference,
    }) });
    if (authority.reason === "pending_authorization_capability_mismatch") return Object.freeze({ handled: false });
    if (authority.decision !== "ALLOW" || !authority.operation) {
      const reply = authority.decision === "DENY"
        ? "Understood. I won't read that Gmail message."
        : "Please explicitly confirm that I may read that Gmail message.";
      return Object.freeze({ handled: true, decision: authority.decision, reason: authority.reason, reply,
        pendingAuthorizationReference: authority.pendingAuthorizationReference });
    }
    return retrieveAuthorized(authority.operation, authority.reason, dependencies);
  }

  const match = utterance.match(EXACT_COMMAND);
  if (!match) return Object.freeze({ handled: true, reason: "invalid_gmail_read_syntax", reply: syntaxReply() });
  const requestedFields = match[2].split(",");
  if (requestedFields.length === 0 || new Set(requestedFields).size !== requestedFields.length ||
      requestedFields.some((field) => !GMAIL_CONTENT_FIELDS.includes(field as GmailContentField))) {
    return Object.freeze({ handled: true, reason: "invalid_gmail_read_syntax", reply: syntaxReply() });
  }

  const request = Object.freeze({
    resource: Object.freeze({ resourceId: match[1], connectorType: "email" as const }),
    requestedFields: Object.freeze(requestedFields as GmailContentField[]),
    requestingRuntime: "api-lighter-chat",
  });
  const authority = authorizeGmailCapability({
    capability: Object.freeze({ operation: "governed_gmail_retrieval", request }),
    currentUserUtterance,
  });
  if (authority.decision !== "ALLOW" || !authority.operation) {
    return Object.freeze({ handled: true, reason: authority.reason, reply: syntaxReply() });
  }

  return retrieveAuthorized(authority.operation, authority.reason, dependencies);
}

async function retrieveAuthorized(operation: NonNullable<ReturnType<typeof authorizeGmailCapability>["operation"]>, reason: string,
  dependencies: ProductionGmailDependencies): Promise<ProductionGmailReadResult> {
  // Both dependency calls deliberately occur after the exact authority ALLOW.
  let retrieval;
  try {
    const policy = await dependencies.loadPolicy();
    const adapter = new GmailContentRetrievalAdapter({ connector: dependencies.createConnector() });
    retrieval = await adapter.retrieve(operation.request, policy);
  } catch {
    return Object.freeze({ handled: true, decision: "ALLOW", reason: "gmail_retrieval_failed", reply: "I couldn't retrieve that Gmail message right now." });
  }
  if (retrieval.outcome === "denied") return Object.freeze({ handled: true, decision: "ALLOW", reason: "resource_policy_denied", reply: "I can't release that Gmail message under the current resource policy." });
  if (retrieval.outcome === "failed" || !retrieval.content) return Object.freeze({ handled: true, decision: "ALLOW", reason: "gmail_retrieval_failed", reply: "I couldn't retrieve that Gmail message right now." });
  return Object.freeze({ handled: true, decision: "ALLOW", reason,
    reply: present(retrieval.content, operation.requestedFields) });
}
