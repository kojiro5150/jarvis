import { authorizeGmailCapability } from "../chat-capabilities/gmail-authority";
import { GoogleGmailContentConnector } from "../chat-capabilities/google-gmail-content";
import { GmailContentRetrievalAdapter, GMAIL_CONTENT_FIELDS, type GmailContentConnector, type GmailContentField, type GmailReleasedContent } from "../content-retrieval";
import { loadContentRetrievalPolicy, type ContentRetrievalPolicy } from "../content-retrieval-policy";

const SYNTAX = "gmail.read <message-id> [subject|snippet|plain_text_body|attachment_filenames|attachment_mime_metadata]";
const COMMAND_PREFIX = /^gmail\.read(?:\s|$)/;
const EXACT_COMMAND = /^gmail\.read ([^\s\[\],]+) \[([^\]]+)\]$/;

export type ProductionGmailDependencies = Readonly<{
  createConnector: () => GmailContentConnector;
  loadPolicy: () => Promise<ContentRetrievalPolicy | null>;
}>;

export type ProductionGmailReadResult = Readonly<{
  handled: boolean;
  decision?: "ALLOW";
  reason?: string;
  reply?: string;
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
  currentUserUtterance: string,
  dependencies: ProductionGmailDependencies = defaults,
): Promise<ProductionGmailReadResult> {
  const utterance = currentUserUtterance.trim();
  if (!COMMAND_PREFIX.test(utterance)) return Object.freeze({ handled: false });

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

  // Both dependency calls deliberately occur after the exact authority ALLOW.
  let retrieval;
  try {
    const policy = await dependencies.loadPolicy();
    const adapter = new GmailContentRetrievalAdapter({ connector: dependencies.createConnector() });
    retrieval = await adapter.retrieve(authority.operation.request, policy);
  } catch {
    return Object.freeze({ handled: true, decision: "ALLOW", reason: "gmail_retrieval_failed", reply: "I couldn't retrieve that Gmail message right now." });
  }
  if (retrieval.outcome === "denied") return Object.freeze({ handled: true, decision: "ALLOW", reason: "resource_policy_denied", reply: "I can't release that Gmail message under the current resource policy." });
  if (retrieval.outcome === "failed" || !retrieval.content) return Object.freeze({ handled: true, decision: "ALLOW", reason: "gmail_retrieval_failed", reply: "I couldn't retrieve that Gmail message right now." });
  return Object.freeze({ handled: true, decision: "ALLOW", reason: authority.reason,
    reply: present(retrieval.content, authority.operation.requestedFields) });
}
