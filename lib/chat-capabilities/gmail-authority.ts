import { createPendingAuthorization, resolvePendingAuthorization, type PendingAuthorizationReference } from "../lighter-jarvis/pending-authorization";
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
export function authorizeGmailCapability(input: GovernedGmailCapabilityRequest): GmailCapabilityAuthorityResult {
  if (input.pendingAuthorizationReference !== undefined) {
    const resolution = resolvePendingAuthorization(input);
    const operation = resolution.proposedOperation?.capability === "gmail.read" ? resolution.proposedOperation : null;
    return Object.freeze({ decision: operation ? "ALLOW" : resolution.decision === "ALLOW" ? "ASK" : resolution.decision, reason: resolution.reason,
      operation, authorityEvidence: resolution.authorityEvidence,
      pendingAuthorizationReference: resolution.pendingAuthorizationReference });
  }
  const operation = proposeGmailRead(input.request);
  const authority = evaluateGmailReadAuthority(operation, input.currentUserUtterance);
  if (authority.decision === "ALLOW") return Object.freeze({ decision: "ALLOW", reason: authority.reason,
    operation, authorityEvidence: authority.authorityEvidence, pendingAuthorizationReference: null });
  return Object.freeze({ decision: "ASK", reason: authority.reason, operation: null,
    authorityEvidence: authority.authorityEvidence, pendingAuthorizationReference: createPendingAuthorization(operation) });
}
