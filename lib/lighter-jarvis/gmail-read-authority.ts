import { proveExplicitGmailRead } from "@/lib/governance-core/explicit-command-authority";
import { GMAIL_CONTENT_FIELDS, type GmailContentField, type GmailContentRetrievalRequest } from "../content-retrieval";

export const GMAIL_READ_CAPABILITY = "gmail.read" as const;

/** The complete operation authorized by a user: neither resource nor field scope may be substituted. */
export type ProposedGmailReadOperation = Readonly<{
  capability: typeof GMAIL_READ_CAPABILITY;
  resourceId: string;
  requestedFields: readonly GmailContentField[];
  request: GmailContentRetrievalRequest;
}>;

export type GmailReadAuthorityDecision = Readonly<{
  capability: typeof GMAIL_READ_CAPABILITY;
  decision: "ALLOW" | "ASK";
  reason: "explicit_gmail_read" | "explicit_gmail_read_not_established";
  authorityEvidence: readonly Readonly<{ source: "current_user_utterance"; utterance: string; basis: "explicit_gmail_read" }>[];
}>;

/**
 * The deliberately exact user grammar is:
 * `gmail.read <resourceId> [field,field]`. It makes every authorized parameter
 * visible in the trusted current utterance rather than inferring scope from chat history.
 */
export function evaluateGmailReadAuthority(operation: ProposedGmailReadOperation, currentUserUtterance: string): GmailReadAuthorityDecision {
  const authorityEvidence = proveExplicitGmailRead(operation, currentUserUtterance);
  const allowed = authorityEvidence.length === 1;
  return Object.freeze({
    capability: GMAIL_READ_CAPABILITY,
    decision: allowed ? "ALLOW" : "ASK",
    reason: allowed ? "explicit_gmail_read" : "explicit_gmail_read_not_established",
    authorityEvidence,
  });
}

export function proposeGmailRead(request: GmailContentRetrievalRequest): ProposedGmailReadOperation {
  if (!request.resource.resourceId || request.requestedFields.length === 0 ||
      new Set(request.requestedFields).size !== request.requestedFields.length ||
      request.requestedFields.some((field) => !GMAIL_CONTENT_FIELDS.includes(field))) {
    throw new Error("gmail.read requires one resourceId and an exact non-empty requested-field set");
  }
  const requestedFields = Object.freeze([...request.requestedFields]);
  const exactRequest = Object.freeze({ ...request, resource: Object.freeze({ ...request.resource }), requestedFields });
  return Object.freeze({ capability: GMAIL_READ_CAPABILITY, resourceId: request.resource.resourceId, requestedFields, request: exactRequest });
}
