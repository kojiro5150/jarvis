import { GoogleServiceAuthError } from "../connectors/google/auth-error";
import { GoogleGmailContentConnector } from "../chat-capabilities/google-gmail-content";
import { GmailContentRetrievalAdapter, type GmailContentConnector } from "../content-retrieval";
import { loadContentRetrievalPolicy, type ContentRetrievalPolicy } from "../content-retrieval-policy";
import {
  createPendingAuthorization,
  pendingAuthorizationCapability,
  resolvePendingAuthorization,
  type PendingAuthorizationReference,
} from "./pending-authorization";
import {
  resolveGmailPrivateReleaseReference,
  type GmailPrivateReleaseReference,
} from "./gmail-private-release-reference";
import {
  callGmailInvitationDeclineDraftModel,
  type GmailInvitationDeclineDraftContextSource,
  type GmailInvitationDeclineDraftModelCall,
} from "./gmail-invitation-decline-draft-model";
import {
  GMAIL_INVITATION_DECLINE_AUTHORITY_PROMPT,
  GMAIL_INVITATION_DECLINE_DRAFT_CAPABILITY,
  GMAIL_INVITATION_DECLINE_MAX_EVIDENCE_CODE_UNITS,
  GMAIL_INVITATION_DECLINE_PROCESSING_LIMIT,
  GMAIL_INVITATION_DECLINE_UNAVAILABLE,
} from "./gmail-invitation-decline-draft-contract";

const REQUEST = /^(?:draft|write) (?:a )?reply to (?:(that|the current) email|([\p{L}][\p{L}'’-]*(?:\s+[\p{L}][\p{L}'’-]*){0,2})),? saying (?:thank you|thanks|i appreciate (?:the|your)) (?:for )?(?:the|your)? ?(?:invite|invitation)(?:,| and)? (?:but )?(?:politely )?(decline|pass|cannot accept|can't accept)(?: it)?[.!]?$/iu;
const THANK = /\b(?:thank(?:s| you)?|appreciat(?:e|ion))\b/i;
const DECLINE = /\b(?:declin(?:e|ing)|pass|cannot accept|can't accept|unable to accept|not accepting)\b/i;
const UNSUPPORTED_DETAIL = /\b(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|january|february|march|april|may|june|july|august|september|october|november|december|meeting|appointment|call|lunch|https?:\/\/\S+|www\.\S+|[\w.+-]+@[\w.-]+\.[a-z]{2,}|\d{1,2}:\d{2}|\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?|\$\s?\d|\+?\d[\d ()-]{7,})\b/gi;
const ACTED = /\b(?:sent|queued|saved (?:to|in) gmail)\b/i;

export type GmailInvitationDeclineDraftOperation = Readonly<{
  capability: typeof GMAIL_INVITATION_DECLINE_DRAFT_CAPABILITY;
  resourceId: string;
  requestedFields: readonly ["sender", "subject", "plain_text_body"];
  instruction: string;
  namedAddressee: string | null;
  originatingReleaseReference: GmailPrivateReleaseReference;
}>;

export type GmailInvitationDeclineDraftDependencies = Readonly<{
  createConnector: () => GmailContentConnector;
  loadPolicy: () => Promise<ContentRetrievalPolicy | null>;
  callDraftModel: GmailInvitationDeclineDraftModelCall;
}>;

export type GmailInvitationDeclineDraftResult = Readonly<{
  handled: boolean;
  reply?: string;
  pendingAuthorizationReference?: PendingAuthorizationReference | null;
  status?: "selected" | "declined" | "failed" | "drafted";
  diagnostic?: GmailInvitationDeclineDraftDiagnostic;
  draftRelease?: boolean;
}>;

export type GmailInvitationDeclineDraftDiagnostic =
  | "release_not_eligible"
  | "release_resolution_failed"
  | "gmail_not_connected"
  | "gmail_refresh_required"
  | "retrieval_failed"
  | "policy_denied"
  | "required_fields_missing"
  | "named_addressee_mismatch"
  | "processing_limit"
  | "model_call_failed"
  | "model_response_malformed"
  | "model_sender_mismatch"
  | "model_subject_mismatch"
  | "draft_empty_or_oversized"
  | "draft_missing_thank"
  | "draft_missing_decline"
  | "draft_claimed_action"
  | "draft_unsupported_detail";

const defaults: GmailInvitationDeclineDraftDependencies = {
  createConnector: () => new GoogleGmailContentConnector(),
  loadPolicy: () => loadContentRetrievalPolicy(process.env.CONTENT_RETRIEVAL_POLICY_PATH),
  callDraftModel: callGmailInvitationDeclineDraftModel,
};

function normalizeName(value: string): string {
  return value.normalize("NFKC").toLocaleLowerCase("en-AU").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

function senderDisplayName(sender: string): string {
  const beforeAddress = sender.replace(/\s*<[^>]+>\s*$/, "").replace(/^"|"$/g, "").trim();
  return beforeAddress || sender;
}

function parseRequest(utterance: string): { instruction: string; namedAddressee: string | null } | null {
  const normalized = utterance.trim().replace(/\s+/g, " ");
  const match = normalized.match(REQUEST);
  if (!match) return null;
  return { instruction: normalized, namedAddressee: match[2] ?? null };
}

function parseModelResult(raw: string): { sender: string; subject: string; draft: string } | null {
  const trimmed = raw.trim();
  const candidate = trimmed.startsWith("```")
    ? trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "")
    : trimmed;
  try {
    const value = JSON.parse(candidate) as unknown;
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const keys = Object.keys(value).sort();
    if (keys.join(",") !== "draft,sender,subject") return null;
    const result = value as Record<string, unknown>;
    if (typeof result.sender !== "string" || typeof result.subject !== "string" || typeof result.draft !== "string") return null;
    return { sender: result.sender, subject: result.subject, draft: result.draft };
  } catch {
    return null;
  }
}

function validateDraft(result: ReturnType<typeof parseModelResult>, context: GmailInvitationDeclineDraftContextSource, instruction: string):
  | Readonly<{ draft: string; diagnostic: null }>
  | Readonly<{ draft: null; diagnostic: GmailInvitationDeclineDraftDiagnostic }> {
  if (!result) return { draft: null, diagnostic: "model_response_malformed" };
  if (result.sender !== context.sender) return { draft: null, diagnostic: "model_sender_mismatch" };
  if (result.subject !== context.subject) return { draft: null, diagnostic: "model_subject_mismatch" };
  const draft = result.draft.trim();
  if (!draft || draft.length >= 8_000) return { draft: null, diagnostic: "draft_empty_or_oversized" };
  if (!THANK.test(draft)) return { draft: null, diagnostic: "draft_missing_thank" };
  if (!DECLINE.test(draft)) return { draft: null, diagnostic: "draft_missing_decline" };
  if (ACTED.test(draft)) return { draft: null, diagnostic: "draft_claimed_action" };
  const evidenceAndInstruction = `${context.sender}\n${context.subject}\n${context.plainTextBody}\n${instruction}`.toLocaleLowerCase("en-AU");
  const unsupported = [...draft.matchAll(UNSUPPORTED_DETAIL)].map((match) => match[0]);
  if (unsupported.some((detail) => !evidenceAndInstruction.includes(detail.toLocaleLowerCase("en-AU")))) {
    return { draft: null, diagnostic: "draft_unsupported_detail" };
  }
  return { draft, diagnostic: null };
}

function failureFor(error: unknown): string {
  if (error instanceof GoogleServiceAuthError) {
    return error.reason === "refresh_failed"
      ? "Your Google connection has expired. Disconnect and reconnect Google, then try again."
      : "Gmail is not connected. Connect Google, then try again.";
  }
  return GMAIL_INVITATION_DECLINE_UNAVAILABLE;
}

export async function resolveGmailInvitationDeclineDraft(
  input: Readonly<{
    currentUserUtterance: string;
    gmailPrivateReleaseReference?: unknown;
    pendingAuthorizationReference?: unknown;
  }>,
  dependencies: GmailInvitationDeclineDraftDependencies = defaults,
): Promise<GmailInvitationDeclineDraftResult> {
  const parsed = parseRequest(input.currentUserUtterance);
  if (parsed) {
    const release = resolveGmailPrivateReleaseReference(input.gmailPrivateReleaseReference);
    const requiredFields = ["sender", "subject", "plain_text_body"] as const;
    if (!release || requiredFields.some((field) => !release.requestedFields.includes(field))) {
      return Object.freeze({ handled: true, status: "failed", diagnostic: "release_not_eligible", reply: "That prior Gmail message is no longer eligible. Please search for and read the exact message again." });
    }
    const originatingReleaseReference = input.gmailPrivateReleaseReference as GmailPrivateReleaseReference;
    const operation: GmailInvitationDeclineDraftOperation = Object.freeze({
      capability: GMAIL_INVITATION_DECLINE_DRAFT_CAPABILITY,
      resourceId: release.resourceId,
      requestedFields: Object.freeze(["sender", "subject", "plain_text_body"] as const),
      instruction: parsed.instruction,
      namedAddressee: parsed.namedAddressee,
      originatingReleaseReference,
    });
    return Object.freeze({ handled: true, status: "selected", reply: GMAIL_INVITATION_DECLINE_AUTHORITY_PROMPT,
      pendingAuthorizationReference: createPendingAuthorization(operation) });
  }

  if (input.pendingAuthorizationReference === undefined
    || pendingAuthorizationCapability(input.pendingAuthorizationReference) !== GMAIL_INVITATION_DECLINE_DRAFT_CAPABILITY) {
    return Object.freeze({ handled: false });
  }
  const authority = resolvePendingAuthorization({
    currentUserUtterance: input.currentUserUtterance,
    pendingAuthorizationReference: input.pendingAuthorizationReference,
    expectedCapability: GMAIL_INVITATION_DECLINE_DRAFT_CAPABILITY,
  });
  if (authority.reason === "pending_authorization_capability_mismatch") return Object.freeze({ handled: false });
  if (authority.decision === "DENY") return Object.freeze({ handled: true, status: "declined", reply: "Understood. I won't re-read that Gmail message or prepare a draft.", pendingAuthorizationReference: null });
  if (authority.decision !== "ALLOW" || authority.proposedOperation?.capability !== GMAIL_INVITATION_DECLINE_DRAFT_CAPABILITY) {
    return Object.freeze({ handled: true, status: "selected", reply: GMAIL_INVITATION_DECLINE_AUTHORITY_PROMPT,
      pendingAuthorizationReference: authority.pendingAuthorizationReference });
  }

  const operation = authority.proposedOperation;
  const release = resolveGmailPrivateReleaseReference(operation.originatingReleaseReference);
  if (!release || release.resourceId !== operation.resourceId) return Object.freeze({ handled: true, status: "failed", diagnostic: "release_resolution_failed", reply: GMAIL_INVITATION_DECLINE_UNAVAILABLE, pendingAuthorizationReference: null });

  try {
    const policy = await dependencies.loadPolicy();
    const retrieval = await new GmailContentRetrievalAdapter({ connector: dependencies.createConnector() }).retrieve({
      resource: { resourceId: operation.resourceId, connectorType: "email" },
      requestedFields: operation.requestedFields,
      requestingRuntime: "api-lighter-chat-gmail-invitation-decline-draft",
    }, policy);
    if (retrieval.outcome === "failed" && retrieval.failureReason !== "provider_failure") {
      return Object.freeze({ handled: true, status: "failed", diagnostic: retrieval.failureReason === "refresh_failed" ? "gmail_refresh_required" : "gmail_not_connected", reply: failureFor(new GoogleServiceAuthError(retrieval.failureReason!, "Gmail authentication failed")), pendingAuthorizationReference: null });
    }
    if (retrieval.outcome === "denied") {
      return Object.freeze({ handled: true, status: "failed", diagnostic: "policy_denied", reply: GMAIL_INVITATION_DECLINE_UNAVAILABLE, pendingAuthorizationReference: null });
    }
    if (retrieval.outcome === "failed") {
      return Object.freeze({ handled: true, status: "failed", diagnostic: "retrieval_failed", reply: GMAIL_INVITATION_DECLINE_UNAVAILABLE, pendingAuthorizationReference: null });
    }
    if (!retrieval.content?.sender || !retrieval.content.subject || !retrieval.content.plainTextBody) {
      return Object.freeze({ handled: true, status: "failed", diagnostic: "required_fields_missing", reply: GMAIL_INVITATION_DECLINE_UNAVAILABLE, pendingAuthorizationReference: null });
    }
    const context: GmailInvitationDeclineDraftContextSource = Object.freeze({
      source: "gmail_invitation_decline_draft",
      sender: retrieval.content.sender,
      subject: retrieval.content.subject,
      plainTextBody: retrieval.content.plainTextBody,
    });
    if (operation.namedAddressee && !normalizeName(senderDisplayName(context.sender)).split(" ").includes(normalizeName(operation.namedAddressee))) {
      return Object.freeze({ handled: true, status: "failed", diagnostic: "named_addressee_mismatch", reply: "The named addressee does not match the current Gmail message. Please restate the request against the current email.", pendingAuthorizationReference: null });
    }
    const presentation = JSON.stringify(context);
    if (presentation.length > GMAIL_INVITATION_DECLINE_MAX_EVIDENCE_CODE_UNITS) {
      return Object.freeze({ handled: true, status: "failed", diagnostic: "processing_limit", reply: GMAIL_INVITATION_DECLINE_PROCESSING_LIMIT, pendingAuthorizationReference: null });
    }
    let rawModelResult: string;
    try {
      rawModelResult = await dependencies.callDraftModel(operation.instruction, context);
    } catch {
      return Object.freeze({ handled: true, status: "failed", diagnostic: "model_call_failed", reply: GMAIL_INVITATION_DECLINE_UNAVAILABLE, pendingAuthorizationReference: null });
    }
    const validation = validateDraft(parseModelResult(rawModelResult), context, operation.instruction);
    if (!validation.draft) {
      const diagnostic = validation.diagnostic ?? "model_response_malformed";
      return Object.freeze({ handled: true, status: "failed", diagnostic, reply: GMAIL_INVITATION_DECLINE_UNAVAILABLE, pendingAuthorizationReference: null });
    }
    return Object.freeze({ handled: true, status: "drafted", draftRelease: true, pendingAuthorizationReference: null,
      reply: `Proposed reply to ${senderDisplayName(context.sender)}\nSubject: ${context.subject}\n\n${validation.draft}\n\nDrafted from the freshly authorised exact Gmail message. This message has not been sent.` });
  } catch (error) {
    return Object.freeze({ handled: true, status: "failed", diagnostic: error instanceof GoogleServiceAuthError
      ? error.reason === "refresh_failed" ? "gmail_refresh_required" : "gmail_not_connected"
      : "retrieval_failed", reply: failureFor(error), pendingAuthorizationReference: null });
  }
}
