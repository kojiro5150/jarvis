import { type PendingAuthorizationReference } from "../lighter-jarvis/pending-authorization";
import {
  createDurablePendingAuthorization,
  resolveDurablePendingAuthorization,
} from "../lighter-jarvis/durable-pending-authorization";
import { evaluateGmailReadAuthority, proposeGmailRead, type ProposedGmailReadOperation } from "../lighter-jarvis/gmail-read-authority";
import type { GovernedGmailCapabilityRequest } from "./types";

export type GmailCapabilityAuthorityResult = Readonly<{
  decision: "ALLOW" | "ASK" | "DENY";
  reason: string;
  operation: ProposedGmailReadOperation | null;
  authorityEvidence: readonly unknown[];
  pendingAuthorizationReference: PendingAuthorizationReference | null;
}>;

/** Resolves trusted authority without constructing or calling a Gmail connector. */
export async function authorizeGmailCapability(input: {
  readonly capability: GovernedGmailCapabilityRequest;
  readonly currentUserUtterance: string;
}): Promise<GmailCapabilityAuthorityResult> {
  if (input.capability.pendingAuthorizationReference !== undefined) {
    const resolution = await resolveDurablePendingAuthorization({
      currentUserUtterance: input.currentUserUtterance,
      pendingAuthorizationReference: input.capability.pendingAuthorizationReference,
      expectedCapability: "gmail.read",
    });
    const operation = resolution.proposedOperation?.capability === "gmail.read" ? resolution.proposedOperation : null;
    return Object.freeze({ decision: operation ? "ALLOW" : resolution.decision === "ALLOW" ? "ASK" : resolution.decision, reason: resolution.reason,
      operation, authorityEvidence: resolution.authorityEvidence,
      pendingAuthorizationReference: resolution.pendingAuthorizationReference });
  }
  const operation = proposeGmailRead(input.capability.request);
  const authority = evaluateGmailReadAuthority(operation, input.currentUserUtterance);
  if (authority.decision === "ALLOW") return Object.freeze({ decision: "ALLOW", reason: authority.reason,
    operation, authorityEvidence: authority.authorityEvidence, pendingAuthorizationReference: null });
  const pendingAuthorizationReference = await createDurablePendingAuthorization(operation);
  return Object.freeze({
    decision: "ASK",
    reason: pendingAuthorizationReference
      ? authority.reason
      : "pending_authorization_persistence_unavailable",
    operation: null,
    authorityEvidence: authority.authorityEvidence,
    pendingAuthorizationReference,
  });
}
