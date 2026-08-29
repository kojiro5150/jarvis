import {
  type AuthorityEvidence,
  type CompletionProof,
  type GovernedEvidence,
  type GovernedProvenance,
  type PolicyProof,
  type ValidatedOperation,
  type VerificationProof,
} from "./trust-types";
import {
  createModelProposal,
  createModelProposalBatch,
} from "./proposal";

const proposal = createModelProposal({
  capability: "calendar",
  operation: "read",
}, "The user appears to want calendar access.");

const batch = createModelProposalBatch([proposal]);

if (false) {
  // A model proposal is not a validated operation.
  // @ts-expect-error MODEL-TRUST-01: proposal interpretation is not validation.
  const validated: ValidatedOperation<unknown> = proposal;

  // @ts-expect-error MODEL-TRUST-01: proposal interpretation is not authority.
  const authority: AuthorityEvidence = proposal;

  // @ts-expect-error MODEL-TRUST-01: proposal interpretation is not governed evidence.
  const evidence: GovernedEvidence<unknown> = proposal;

  // @ts-expect-error MODEL-TRUST-01: proposal interpretation is not provenance.
  const provenance: GovernedProvenance = proposal;

  // @ts-expect-error MODEL-TRUST-01: proposal interpretation is not policy proof.
  const policy: PolicyProof = proposal;

  // @ts-expect-error MODEL-TRUST-01: proposal interpretation is not verification proof.
  const verification: VerificationProof<unknown> = proposal;

  // @ts-expect-error MODEL-TRUST-01: proposal interpretation is not completion proof.
  const completion: CompletionProof<unknown> = proposal;

  // Compound grouping does not create a trusted operation.
  // @ts-expect-error MODEL-TRUST-01: a proposal batch is not a validated operation.
  const batchAsOperation: ValidatedOperation<unknown> = batch;

  void validated;
  void authority;
  void evidence;
  void provenance;
  void policy;
  void verification;
  void completion;
  void batchAsOperation;
}
