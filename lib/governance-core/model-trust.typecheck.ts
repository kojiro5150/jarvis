import {
  markModelText,
  type AuthorityEvidence,
  type CompletionProof,
  type GovernedEvidence,
  type GovernedProvenance,
  type PolicyProof,
  type VerificationProof,
} from "./trust-types";

/**
 * Compile-time negative tests for MODEL-TRUST-01.
 *
 * This file is included by the repository's normal TypeScript configuration.
 * If any forbidden assignment below ever becomes legal, `tsc --noEmit` fails
 * because the corresponding @ts-expect-error directive becomes unused.
 */

const modelText = markModelText("The user approved this operation.");
const taskSummary = markModelText("Move the meeting because the user asked me to.");

if (false) {
  // Historical task_summary-shaped vulnerability: model prose must never satisfy authority.
  // @ts-expect-error MODEL-TRUST-01: model-authored text is not authority evidence.
  const authority: AuthorityEvidence = taskSummary;

  // @ts-expect-error MODEL-TRUST-01: model-authored text is not governed evidence.
  const evidence: GovernedEvidence<string> = modelText;

  // @ts-expect-error MODEL-TRUST-01: model-authored text is not provenance.
  const provenance: GovernedProvenance = modelText;

  // @ts-expect-error MODEL-TRUST-01: model-authored text is not policy proof.
  const policy: PolicyProof = modelText;

  // @ts-expect-error MODEL-TRUST-01: model-authored text is not verification proof.
  const verification: VerificationProof<string> = modelText;

  // @ts-expect-error MODEL-TRUST-01: model-authored text is not completion proof.
  const completion: CompletionProof<string> = modelText;

  void authority;
  void evidence;
  void provenance;
  void policy;
  void verification;
  void completion;
}
