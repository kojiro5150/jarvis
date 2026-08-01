import type { EmailMessage } from "../connectors/email-message";
import type { ClaimStatusConditions } from "./evidence-status";
import type { CommunicationClaimType, GovernedConflict } from "./types";

export const SYNTHETIC_EVALUATION_NOTICE =
  "SYNTHETIC_CONVERSATIONAL_PARALLEL_EVALUATION_NOT_OPERATIONAL_EVIDENCE" as const;

export interface EvaluationClaimFixture {
  readonly claimId: string;
  readonly claimType: CommunicationClaimType;
  readonly question: string;
  readonly material: boolean;
  readonly conditions: ClaimStatusConditions;
  readonly factualValues: readonly unknown[];
  readonly legacyRelevantFields: readonly (keyof EmailMessage)[];
  readonly conflicts?: readonly GovernedConflict[];
}

export interface ConversationalEvaluationScenario {
  readonly scenarioId: string;
  readonly title: string;
  readonly question: string;
  readonly auditReference: string;
  readonly messages: readonly EmailMessage[];
  readonly claims: readonly EvaluationClaimFixture[];
  readonly conversationHistory?: readonly { turnId: string; classification: "operator_provided" | "assistant_prior_output" | "retrieval_reference"; content: string }[];
  readonly legacyComparisonPossible?: boolean;
  readonly contractBoundaryDocumented?: boolean;
  readonly syntheticEvidenceNotice: typeof SYNTHETIC_EVALUATION_NOTICE;
}

const observedAt = "2026-07-15T12:00:00.000Z";
const message = (overrides: Partial<EmailMessage> = {}): EmailMessage => ({
  id: "message-1", subject: "Proposal update", from: "Cassie <cassie@example.invalid>",
  snippet: "I reviewed the proposal and will send more detail...", receivedAt: observedAt,
  unread: true, needsReply: true, important: true, source: "google", sourceLabel: "Main Gmail", ...overrides,
});
const sufficient: ClaimStatusConditions = { supported: true, sourceAvailable: true, governedEvidence: true, identitySufficient: true, provenanceSufficient: true, scopeComplete: true, fieldCoverage: true, fresh: true, conflictFree: true, contentComplete: true };
const claim = (claimId: string, claimType: CommunicationClaimType, question: string, conditions: ClaimStatusConditions, legacyRelevantFields: readonly (keyof EmailMessage)[], factualValues: readonly unknown[] = []): EvaluationClaimFixture => ({ claimId, claimType, question, material: true, conditions, factualValues, legacyRelevantFields });
const audit = (finding: string) => `Sprint 3.75 — ${finding}`;
const scenario = (value: Omit<ConversationalEvaluationScenario, "syntheticEvidenceNotice">): ConversationalEvaluationScenario => ({ ...value, syntheticEvidenceNotice: SYNTHETIC_EVALUATION_NOTICE });

const governedRef = { sourceId: "synthetic:gmail", resourceId: "message-1", field: "recipients", observedAt };
const recipientConflict: GovernedConflict = { conflictId: "recipient-conflict", claimId: "recipient", governedReference: governedRef, compatibilityContextId: "legacy:message-1", description: "Legacy display text conflicts with governed recipient observation." };

export const conversationalEvaluationScenarios: readonly ConversationalEvaluationScenario[] = [
  scenario({ scenarioId: "cassie-contact-and-importance", title: "Cassie contact and importance", question: "What's Cassie's email? Anything important?", auditReference: audit("Operator case: Cassie answer combined an address with heuristic significance"), messages: [message()], claims: [
    claim("contact", "contact_address_lookup", "What is Cassie's email?", sufficient, ["from"], ["cassie@example.invalid"]),
    claim("importance", "message_importance", "Is anything important?", { ...sufficient, supported: false }, ["subject", "from", "snippet", "unread", "important", "needsReply", "sourceLabel"]),
  ] }),
  scenario({ scenarioId: "subject-only-content", title: "Subject-only communication", question: "What does the email say?", auditReference: audit("Communication Context Inventory: subject supplied without content-completeness status"), messages: [message({ snippet: "" })], claims: [claim("content", "message_full_content", "What does the email say?", { ...sufficient, fieldCoverage: false, contentComplete: false }, ["subject"])] }),
  scenario({ scenarioId: "snippet-only-agreement", title: "Snippet-only content", question: "Did Cassie agree to the proposal?", auditReference: audit("Communication Context Inventory: snippet supplied without content-completeness status"), messages: [message()], claims: [claim("agreement", "message_full_content", "Did Cassie agree?", { ...sufficient, scopeComplete: false, contentComplete: false }, ["snippet", "subject", "from"])] }),
  scenario({ scenarioId: "ambiguous-alex", title: "Ambiguous person identity", question: "What is Alex's email?", auditReference: audit("Sender display text does not establish resolved person identity"), messages: [message({ id: "alex-1", from: "Alex <one@example.invalid>" }), message({ id: "alex-2", from: "Alex <two@example.invalid>" })], claims: [claim("alex-contact", "contact_address_lookup", "What is Alex's email?", { ...sufficient, identitySufficient: false }, ["from"])] }),
  scenario({ scenarioId: "recipient-conflict", title: "Governed and legacy recipient conflict", question: "Who received this?", auditReference: audit("Governed Gmail evidence must control recipient claims over legacy display data"), messages: [message({ from: "Legacy Recipient <old@example.invalid>" })], claims: [{ ...claim("recipient", "recipient_membership", "Who received this?", { ...sufficient, conflictFree: false }, ["from"]), conflicts: [recipientConflict] }] }),
  scenario({ scenarioId: "unavailable-with-fallback", title: "Unavailable Gmail with compatibility fallback", question: "What new emails do I have?", auditReference: audit("Fallback communications can appear without live connector availability in prompt context"), messages: [message({ source: "local", sourceLabel: "Local" })], claims: [claim("new-mail", "message_excerpt", "What new emails do I have?", { ...sufficient, sourceAvailable: false, governedEvidence: false, compatibilityFallback: true }, ["subject", "from", "snippet", "unread", "sourceLabel"])] }),
  scenario({ scenarioId: "missing-recipient", title: "No recipient evidence", question: "Who was this sent to?", auditReference: audit("Legacy query membership and mailbox delivery do not prove recipients"), messages: [message()], claims: [claim("recipient", "recipient_membership", "Who was this sent to?", { ...sufficient, fieldCoverage: false, identitySufficient: false }, ["from", "sourceLabel"])] }),
  scenario({ scenarioId: "heuristic-importance", title: "Importance from Gmail heuristics", question: "Is this important?", auditReference: audit("Unread, important, needsReply, source labels, ranking, and attention counts are heuristic"), messages: [message()], claims: [claim("importance", "message_importance", "Is this important?", { ...sufficient, supported: false }, ["subject", "unread", "important", "needsReply", "sourceLabel"])] }),
  scenario({ scenarioId: "unsupported-actionability", title: "Urgency or actionability", question: "Do I need to act on this now?", auditReference: audit("No governed urgency or workflow-actionability owner exists"), messages: [message()], claims: [claim("action", "message_actionability", "Do I need to act now?", { ...sufficient, supported: false }, ["subject", "snippet", "unread", "needsReply"])] }),
  scenario({ scenarioId: "negative-absence", title: "Negative absence claim", question: "There are no emails from Cassie, right?", auditReference: audit("Bounded prompt results do not establish complete negative scope"), messages: [], claims: [claim("absence", "message_absence", "There are no emails from Cassie, right?", { ...sufficient, scopeComplete: false, fieldCoverage: false, contentComplete: false }, [])] }),
  scenario({ scenarioId: "prior-assistant-address", title: "Prior assistant output as evidence", question: "Remind me of Cassie's address.", auditReference: audit("Prior assistant prose is untrusted conversation history, not operational evidence"), messages: [], conversationHistory: [{ turnId: "assistant-1", classification: "assistant_prior_output", content: "Cassie's address is guessed@example.invalid" }], claims: [claim("contact", "contact_address_lookup", "What is Cassie's address?", { ...sufficient, governedEvidence: false, identitySufficient: false, provenanceSufficient: false, fieldCoverage: false }, [])] }),
  scenario({ scenarioId: "sufficient-cassie-address", title: "Genuinely sufficient recipient/contact evidence", question: "What email address is shown for Cassie in this message?", auditReference: audit("Governed recipient evidence is authoritative when identity, provenance, source, and coverage are sufficient"), messages: [message()], claims: [claim("contact", "contact_address_lookup", "What address is shown for Cassie?", sufficient, ["from"], ["cassie@example.invalid"])] }),
];
