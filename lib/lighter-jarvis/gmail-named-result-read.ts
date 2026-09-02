import { proposeGmailRead } from "./gmail-read-authority";
import {
  resolveGmailMessageListSenderReference,
  type GmailMessageListReference,
} from "./gmail-message-list-reference";
import { createPendingAuthorization, type PendingAuthorizationReference } from "./pending-authorization";

export type GmailNamedResultReadProposalResult = Readonly<{
  handled: boolean;
  reply?: string;
  pendingAuthorizationReference?: PendingAuthorizationReference | null;
  gmailMessageListReference?: GmailMessageListReference | null;
}>;

export function resolveGmailNamedResultReadProposal(input: {
  readonly currentUserUtterance: string;
  readonly gmailMessageListReference?: unknown;
}): GmailNamedResultReadProposalResult {
  if (!Object.hasOwn(input, "gmailMessageListReference")) {
    return Object.freeze({ handled: false });
  }

  const selection = resolveGmailMessageListSenderReference({
    reference: input.gmailMessageListReference,
    currentUserUtterance: input.currentUserUtterance,
  });

  switch (selection.status) {
    case "unsupported":
      return Object.freeze({ handled: false });
    case "invalid":
    case "expired":
      return Object.freeze({
        handled: true,
        reply: "That recent Gmail result is no longer available. Please retrieve the recent messages again.",
        gmailMessageListReference: null,
      });
    case "not_found":
      return Object.freeze({
        handled: true,
        reply: "That sender does not match a message in the bounded recent Gmail result. Please use one of the displayed positions or make a new Gmail search.",
        gmailMessageListReference: selection.reference,
      });
    case "ambiguous":
      return Object.freeze({
        handled: true,
        reply: "More than one message in the bounded recent Gmail result matches that sender. Please select the message by its displayed position.",
        gmailMessageListReference: selection.reference,
      });
    case "matched":
      break;
  }

  const operation = proposeGmailRead(Object.freeze({
    resource: Object.freeze({
      resourceId: selection.resourceId,
      connectorType: "email" as const,
    }),
    requestedFields: Object.freeze(["sender", "subject", "plain_text_body"] as const),
    requestingRuntime: "api-lighter-chat:gmail-named-result-read",
  }));

  return Object.freeze({
    handled: true,
    reply: `I can read the uniquely matched Gmail message from position ${selection.ordinal} in the recent result. Please explicitly confirm that I may read that exact Gmail message.`,
    pendingAuthorizationReference: createPendingAuthorization(operation),
    gmailMessageListReference: selection.reference,
  });
}