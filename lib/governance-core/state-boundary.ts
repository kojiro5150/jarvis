/**
 * Governance Core conversation/governance state boundary.
 *
 * Conversation state preserves semantic continuity only. It may carry opaque
 * references such as "the first one" or "that meeting", but it cannot create
 * authority, evidence, provenance, policy proof, verification, or completion.
 *
 * Governance state remains server-owned. This module deliberately exposes no
 * generic constructor for GovernanceState<T>; later migration work must create
 * it only at real trusted server boundaries.
 */

declare const CONVERSATION_REFERENCE: unique symbol;
declare const CONVERSATION_STATE: unique symbol;
declare const GOVERNANCE_STATE: unique symbol;

export type ConversationReferenceKind =
  | "result_set"
  | "resource_selection"
  | "clarification"
  | "pending_operation"
  | "other";

export type ConversationReference<
  TKind extends ConversationReferenceKind = ConversationReferenceKind,
> = Readonly<{
  readonly kind: TKind;
  readonly referenceId: string;
  [CONVERSATION_REFERENCE]: "conversation_reference";
}>;

export type ConversationState = Readonly<{
  readonly references: readonly ConversationReference[];
  [CONVERSATION_STATE]: "conversation_state";
}>;

/**
 * A server-owned governance state value.
 *
 * There is intentionally no exported generic constructor for this type.
 * An opaque client-carried reference must be resolved by a real server-owned
 * state boundary before a value may inhabit GovernanceState<T>.
 */
export type GovernanceState<T> = Readonly<{
  readonly value: T;
  [GOVERNANCE_STATE]: "governance_state";
}>;

function validReferenceId(referenceId: string): boolean {
  const normalized = referenceId.normalize("NFKC").trim();
  return normalized.length > 0 && normalized.length <= 256;
}

/**
 * Creates low-trust semantic continuity only.
 *
 * The reference identifier may point at server-owned state, but possession of
 * this object proves nothing about whether that state exists or what authority
 * it carries.
 */
export function createConversationReference<
  TKind extends ConversationReferenceKind,
>(
  kind: TKind,
  referenceId: string,
): ConversationReference<TKind> | null {
  if (!validReferenceId(referenceId)) return null;
  return Object.freeze({
    kind,
    referenceId: referenceId.normalize("NFKC").trim(),
  }) as ConversationReference<TKind>;
}

export function createConversationState(
  references: readonly ConversationReference[],
): ConversationState {
  return Object.freeze({
    references: Object.freeze([...references]),
  }) as ConversationState;
}
