import { createModelProposal } from "./proposal";
import {
  createConversationReference,
  createConversationState,
  type GovernanceState,
} from "./state-boundary";
import {
  type AuthorityEvidence,
  type CompletionProof,
  type GovernedEvidence,
  type GovernedProvenance,
  type PolicyProof,
  type ValidatedOperation,
  type VerificationProof,
} from "./trust-types";

const reference = createConversationReference("result_set", "client-carried-id")!;
const conversationState = createConversationState([reference]);
const proposal = createModelProposal({ capability: "gmail", operation: "read" });

if (false) {
  // A semantic reference is not a validated operation.
  // @ts-expect-error Conversation state preserves meaning; it does not validate an operation.
  const operation: ValidatedOperation<unknown> = reference;

  // @ts-expect-error An opaque conversation reference is not authority evidence.
  const authorityFromReference: AuthorityEvidence = reference;

  // @ts-expect-error Conversation state is not authority evidence.
  const authorityFromState: AuthorityEvidence = conversationState;

  // @ts-expect-error Conversation state is not governed evidence.
  const evidence: GovernedEvidence<unknown> = conversationState;

  // @ts-expect-error Conversation state is not provenance.
  const provenance: GovernedProvenance = conversationState;

  // @ts-expect-error Conversation state is not policy proof.
  const policy: PolicyProof = conversationState;

  // @ts-expect-error Conversation state is not verification proof.
  const verification: VerificationProof<unknown> = conversationState;

  // @ts-expect-error Conversation state is not completion proof.
  const completion: CompletionProof<unknown> = conversationState;

  // @ts-expect-error A model proposal is not server-owned governance state.
  const governanceFromProposal: GovernanceState<unknown> = proposal;

  // @ts-expect-error A client-carried semantic reference is not server-owned governance state.
  const governanceFromReference: GovernanceState<unknown> = reference;

  void operation;
  void authorityFromReference;
  void authorityFromState;
  void evidence;
  void provenance;
  void policy;
  void verification;
  void completion;
  void governanceFromProposal;
  void governanceFromReference;
}
