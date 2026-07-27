import type { AttentionPolicy, CanonicalAttentionChange } from "./types";

const evidence = (field: string, value: string | null) => ({ field, value });
const policy = (metadata: Omit<AttentionPolicy, "evaluate">, evaluate: AttentionPolicy["evaluate"]): AttentionPolicy => Object.freeze({ ...metadata, appliesTo: Object.freeze([...metadata.appliesTo]), evaluate });
type Commitment = { readonly status: "scheduled" | "in_progress" | "completed" | "cancelled"; readonly startsAt?: string };
type Source = { readonly status: "available" | "unavailable" | "stale" | "not_configured" };
const commitment = (change: CanonicalAttentionChange) => change as CanonicalAttentionChange & { previous?: Commitment; current?: Commitment };
const source = (change: CanonicalAttentionChange) => change as CanonicalAttentionChange & { previous?: Source; current?: Source };

export const commitmentCancellationPolicy = policy({ id: "attention.commitment.cancelled", version: "1.0.0", description: "Selects explicit commitment transitions to cancelled.", appliesTo: ["commitments"] }, change => {
  const c = commitment(change); if (c.changeType !== "modified" || !c.previous || !c.current || c.previous.status === "cancelled" || c.current.status !== "cancelled") return { matched: false };
  return { matched: true, reason: { code: "commitment.status.changed-to-cancelled", message: "The commitment status changed to cancelled.", evidence: [evidence("commitment.id", c.entityId ?? null), evidence("previous.status", c.previous.status), evidence("current.status", c.current.status)] } };
});
export const commitmentStartTimeChangePolicy = policy({ id: "attention.commitment.start-time-changed", version: "1.0.0", description: "Selects structural changes to commitment start timestamps.", appliesTo: ["commitments"] }, change => {
  const c = commitment(change); if (c.changeType !== "modified" || !c.previous || !c.current || c.previous.startsAt === c.current.startsAt) return { matched: false };
  return { matched: true, reason: { code: "commitment.start-time.changed", message: "The commitment start time changed.", evidence: [evidence("commitment.id", c.entityId ?? null), evidence("previous.startsAt", c.previous.startsAt ?? null), evidence("current.startsAt", c.current.startsAt ?? null)] } };
});
export const commitmentRemovalPolicy = policy({ id: "attention.commitment.removed", version: "1.0.0", description: "Selects commitments present previously and absent currently.", appliesTo: ["commitments"] }, change => {
  const c = commitment(change); if (c.changeType !== "removed" || !c.previous || c.current !== undefined) return { matched: false };
  return { matched: true, reason: { code: "commitment.absent-from-current-snapshot", message: "The commitment was present in the previous snapshot and is absent from the current snapshot.", evidence: [evidence("commitment.id", c.entityId ?? null), evidence("previous.status", c.previous.status), evidence("previous.startsAt", c.previous.startsAt ?? null)] } };
});
export const sourceBecameUnavailablePolicy = policy({ id: "attention.source.became-unavailable", version: "1.0.0", description: "Selects source availability transitions from available to unavailable.", appliesTo: ["sources"] }, change => {
  const c = source(change); if (c.changeType !== "modified" || !c.previous || !c.current || c.previous.status !== "available" || c.current.status !== "unavailable") return { matched: false };
  return { matched: true, reason: { code: "source.availability.changed-to-unavailable", message: "The source availability changed from available to unavailable.", evidence: [evidence("source.id", c.entityId ?? null), evidence("previous.status", c.previous.status), evidence("current.status", c.current.status)] } };
});
export const INITIAL_ATTENTION_POLICIES = Object.freeze([commitmentCancellationPolicy, commitmentRemovalPolicy, commitmentStartTimeChangePolicy, sourceBecameUnavailablePolicy]);
