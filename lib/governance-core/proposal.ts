import { markModelText, type ModelText } from "./trust-types";

declare const MODEL_PROPOSAL: unique symbol;
declare const MODEL_PROPOSAL_BATCH: unique symbol;

/**
 * A model proposal is deliberately low-trust.
 *
 * It records JARVIS's interpretation of a request. It is not a validated
 * operation, policy decision, evidence, provenance, authority, execution
 * instruction, or proof of completion.
 */
export type ModelProposal<TCandidate = unknown> = Readonly<{
  readonly kind: "model_proposal";
  readonly candidate: Readonly<TCandidate>;
  readonly rationale?: ModelText;
  [MODEL_PROPOSAL]: "model_proposal";
}>;

/**
 * Compound requests are represented as multiple independent low-trust
 * proposals. Grouping does not create shared authority between siblings.
 */
export type ModelProposalBatch = Readonly<{
  readonly kind: "model_proposal_batch";
  readonly proposals: readonly ModelProposal<unknown>[];
  [MODEL_PROPOSAL_BATCH]: "model_proposal_batch";
}>;

function freezeCandidate<T>(candidate: T): Readonly<T> {
  if (typeof candidate === "object" && candidate !== null) {
    return Object.freeze({ ...(candidate as Record<string, unknown>) }) as Readonly<T>;
  }
  return candidate as Readonly<T>;
}

export function createModelProposal<TCandidate>(
  candidate: TCandidate,
  rationale?: string,
): ModelProposal<TCandidate> {
  return Object.freeze({
    kind: "model_proposal" as const,
    candidate: freezeCandidate(candidate),
    ...(rationale === undefined ? {} : { rationale: markModelText(rationale) }),
  }) as ModelProposal<TCandidate>;
}

export function createModelProposalBatch(
  proposals: readonly ModelProposal<unknown>[],
): ModelProposalBatch | null {
  if (proposals.length === 0 || proposals.length > 8) return null;
  return Object.freeze({
    kind: "model_proposal_batch" as const,
    proposals: Object.freeze([...proposals]),
  }) as ModelProposalBatch;
}
