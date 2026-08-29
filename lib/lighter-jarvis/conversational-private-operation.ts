import { proposeGmailSubjectList, type ProposedGmailSearchOperation } from "./gmail-search-authority";
import type { CapabilityRequestIntent } from "./conversational-intent";

export type ConversationalPrivateOperationProposal = ProposedGmailSearchOperation;

/**
 * Materializes a validated conversational intent into an exact server-owned
 * private operation proposal. This creates no authority and performs no
 * acquisition.
 *
 * Sprint 3.180c1 deliberately supports Gmail search only. Gmail reads still
 * require an identified resource; Drive and Calendar remain on their existing
 * governed paths until their exact operation mappings are separately earned.
 */
export function materializeConversationalPrivateOperation(
  intent: CapabilityRequestIntent,
): ConversationalPrivateOperationProposal | null {
  if (intent.capability !== "gmail" || intent.operation !== "search") return null;

  // Existing Gmail search authority admits only 1d / 7d and maxResults=5.
  // A conversational request is therefore bounded to the wider existing
  // search window rather than allowing the model to invent query scope.
  if (intent.temporalConstraint === "tomorrow" || intent.temporalConstraint === "next_week") return null;

  const semanticSubjectTerms = (intent.subjectTerms ?? []).filter(term =>
    !["gmail", "email", "emails", "inbox"].includes(term)
  );
  if (semanticSubjectTerms.length > 0) return null;

  const newerThan = intent.temporalConstraint === "today" ? "1d" : "7d";
  return proposeGmailSubjectList(newerThan);
}
