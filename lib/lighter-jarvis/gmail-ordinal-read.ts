import { proposeGmailRead } from "./gmail-read-authority";
import {
  resolveGmailMessageListReference,
  type GmailMessageListReference,
} from "./gmail-message-list-reference";
import { createPendingAuthorization, type PendingAuthorizationReference } from "./pending-authorization";

export type GmailOrdinalReadProposalResult = Readonly<{
  handled: boolean;
  reply?: string;
  pendingAuthorizationReference?: PendingAuthorizationReference | null;
  gmailMessageListReference?: GmailMessageListReference | null;
}>;

export function resolveGmailOrdinalReadProposal(input: {
  readonly currentUserUtterance: string;
  readonly gmailMessageListReference?: unknown;
}): GmailOrdinalReadProposalResult {
  if (!Object.hasOwn(input, "gmailMessageListReference")) return Object.freeze({ handled: false });

  const selection = resolveGmailMessageListReference({
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
    case "out_of_range":
      return Object.freeze({
        handled: true,
        reply: "That position is outside the bounded recent Gmail result.",
        gmailMessageListReference: selection.reference,
      });
    case "matched":
      break;
  }

  const operation = proposeGmailRead(Object.freeze({
    resource: Object.freeze({ resourceId: selection.resourceId, connectorType: "email" as const }),
    requestedFields: Object.freeze(["sender", "subject", "plain_text_body"] as const),
    requestingRuntime: "api-lighter-chat:gmail-ordinal-read",
  }));
  return Object.freeze({
    handled: true,
    reply: `I can read message ${selection.ordinal} from the recent Gmail result. Please explicitly confirm that I may read that exact Gmail message.`,
    pendingAuthorizationReference: createPendingAuthorization(operation),
    gmailMessageListReference: selection.reference,
  });
}
