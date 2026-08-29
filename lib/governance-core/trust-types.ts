/**
 * JARVIS Governance Core trust-bearing types.
 *
 * MODEL-TRUST-01:
 * Model-authored values are descriptive only. They may not inhabit
 * evidence-, authority-, provenance-, policy-proof-, verification-,
 * or completion-proof-bearing types.
 *
 * These brands are intentionally module-private so callers cannot reproduce
 * them structurally. Runtime construction of high-trust values is deliberately
 * not exposed in this first extraction PR; later migration work must introduce
 * source-specific trusted boundaries rather than a generic "promote" escape hatch.
 */

declare const MODEL_TEXT: unique symbol;
declare const VALIDATED_OPERATION: unique symbol;
declare const AUTHORITY_EVIDENCE: unique symbol;
declare const GOVERNED_EVIDENCE: unique symbol;
declare const GOVERNED_PROVENANCE: unique symbol;
declare const POLICY_PROOF: unique symbol;
declare const VERIFICATION_PROOF: unique symbol;
declare const COMPLETION_PROOF: unique symbol;

export type ModelText = string & Readonly<{
  [MODEL_TEXT]: "model_text";
}>;

export type ValidatedOperation<T> = Readonly<{
  readonly value: T;
  [VALIDATED_OPERATION]: "validated_operation";
}>;

export type AuthorityEvidence<T = unknown> = Readonly<{
  readonly operation: ValidatedOperation<T>;
  [AUTHORITY_EVIDENCE]: "authority_evidence";
}>;

export type GovernedEvidence<T> = Readonly<{
  readonly value: T;
  [GOVERNED_EVIDENCE]: "governed_evidence";
}>;

export type GovernedProvenance = Readonly<{
  readonly source: string;
  readonly observedAt: string;
  [GOVERNED_PROVENANCE]: "governed_provenance";
}>;

export type PolicyProof<T = unknown> = Readonly<{
  readonly operation: ValidatedOperation<T>;
  readonly decision: "allow" | "deny";
  [POLICY_PROOF]: "policy_proof";
}>;

export type VerificationProof<T> = Readonly<{
  readonly value: T;
  [VERIFICATION_PROOF]: "verification_proof";
}>;

export type CompletionProof<T> = Readonly<{
  readonly verification: VerificationProof<T>;
  [COMPLETION_PROOF]: "completion_proof";
}>;

/**
 * Low-trust construction is safe: this function only marks text as model-authored.
 * It can never promote text into a trust-bearing type.
 */
export function markModelText(value: string): ModelText {
  return value as ModelText;
}

/**
 * Operation validation is intentionally separate from authority/evidence.
 * The validator must be deterministic application code; a model-authored
 * rationale cannot satisfy this function's contract by itself.
 */
export function validateOperation<T>(
  value: T,
  validator: (candidate: T) => boolean,
): ValidatedOperation<T> | null {
  if (!validator(value)) return null;
  return Object.freeze({ value }) as ValidatedOperation<T>;
}
