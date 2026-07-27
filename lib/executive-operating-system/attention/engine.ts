import type { SituationalAwarenessChangeSet } from "../situational-awareness/lifecycle";
import { AttentionPolicyRegistry } from "./registry";
import { ATTENTION_DOMAINS } from "./types";
import type { AttentionChangeDomain, AttentionChangeType, AttentionRecord, CanonicalAttentionChange, ExecutiveAttentionQueue } from "./types";
import { clone, compareText, createExecutiveAttentionQueue, required, validateReason } from "./validation";

const changeTypeOrder: Readonly<Record<AttentionChangeType, number>> = { added: 0, modified: 1, removed: 2 };
const encode = (value: string): string => encodeURIComponent(value);
const changeKey = (c: CanonicalAttentionChange): string => `${c.domain}\0${c.entityId ?? c.domain}\0${c.changeType}`;

function flatten(changeSet: SituationalAwarenessChangeSet): CanonicalAttentionChange[] {
  if (!changeSet || typeof changeSet !== "object" || !changeSet.changes) throw new Error("situational awareness change set is required");
  required(changeSet.previousSnapshotId, "change set previousSnapshotId"); required(changeSet.currentSnapshotId, "change set currentSnapshotId");
  const output: CanonicalAttentionChange[] = [];
  for (const domain of ATTENTION_DOMAINS) {
    const value = changeSet.changes[domain]; const changes = domain === "identity" || domain === "context" ? (value ? [value] : []) : value;
    if (!Array.isArray(changes)) throw new Error(`change set changes.${domain} must be an array or scalar change`);
    for (const raw of changes) {
      const candidate = raw as { readonly type: AttentionChangeType; readonly id?: string; readonly previous?: CanonicalAttentionChange["previous"]; readonly current?: CanonicalAttentionChange["current"] };
      if (!candidate || !["added", "modified", "removed"].includes(candidate.type)) throw new Error(`change set changes.${domain} contains an invalid change`);
      const entityId = domain === "identity" || domain === "context" ? undefined : (candidate as { id?: string }).id;
      if (entityId !== undefined) required(entityId, `change set changes.${domain} entity id`);
      output.push({ domain, changeType: candidate.type, ...(entityId ? { entityId } : {}), ...(candidate.type !== "added" ? { previous: clone(candidate.previous) } : {}), ...(candidate.type !== "removed" ? { current: clone(candidate.current) } : {}), previousSnapshotId: changeSet.previousSnapshotId, currentSnapshotId: changeSet.currentSnapshotId });
    }
  }
  return output.sort((a, b) => ATTENTION_DOMAINS.indexOf(a.domain) - ATTENTION_DOMAINS.indexOf(b.domain) || compareText(a.entityId ?? a.domain, b.entityId ?? b.domain) || changeTypeOrder[a.changeType] - changeTypeOrder[b.changeType]);
}

/** Applies registered binary policies to canonical lifecycle changes without ranking or interpretation. */
export function constructExecutiveAttentionQueue(changeSet: SituationalAwarenessChangeSet, registry: AttentionPolicyRegistry): ExecutiveAttentionQueue {
  if (!(registry instanceof AttentionPolicyRegistry)) throw new Error("attention policy registry is required");
  const changes = flatten(changeSet); const policies = registry.policies(); const records: AttentionRecord[] = []; const unique = new Set<string>();
  for (const change of changes) for (const p of policies) if (p.appliesTo.includes(change.domain)) {
    const result = p.evaluate(clone(change), Object.freeze({ previousSnapshotId: change.previousSnapshotId, currentSnapshotId: change.currentSnapshotId }));
    if (!result || typeof result !== "object" || typeof result.matched !== "boolean") throw new Error(`attention policy ${p.id} returned an invalid result`);
    if (!result.matched) continue; validateReason(result.reason);
    const id = `attention:${encode(change.currentSnapshotId)}:${encode(change.domain)}:${encode(change.entityId ?? change.domain)}:${change.changeType}:${encode(p.id)}:${encode(p.version)}`;
    if (unique.has(id)) throw new Error(`duplicate attention policy match: ${id}`); unique.add(id);
    records.push({ attentionId: id, policy: { id: p.id, version: p.version }, ...clone(change), reason: clone(result.reason) });
  }
  records.sort((a, b) => ATTENTION_DOMAINS.indexOf(a.domain) - ATTENTION_DOMAINS.indexOf(b.domain) || compareText(a.entityId ?? a.domain, b.entityId ?? b.domain) || changeTypeOrder[a.changeType] - changeTypeOrder[b.changeType] || compareText(a.policy.id, b.policy.id) || compareText(a.policy.version, b.policy.version));
  const policySet = policies.map(({ id, version }) => ({ id, version }));
  const byDomain = Object.fromEntries(ATTENTION_DOMAINS.map(domain => [domain, records.filter(r => r.domain === domain).length])) as Record<AttentionChangeDomain, number>;
  const byChangeType = Object.fromEntries((["added", "modified", "removed"] as const).map(type => [type, records.filter(r => r.changeType === type).length])) as Record<AttentionChangeType, number>;
  const matched = new Set(records.map(r => r.policy.id)); const elevated = new Set(records.map(changeKey));
  const queueId = `attention-queue:${encode(changeSet.previousSnapshotId)}:${encode(changeSet.currentSnapshotId)}:${policySet.map(p => `${encode(p.id)}@${encode(p.version)}`).join(",") || "none"}`;
  return createExecutiveAttentionQueue({ queueId, previousSnapshotId: changeSet.previousSnapshotId, currentSnapshotId: changeSet.currentSnapshotId, policySet, records, summary: { evaluatedChanges: changes.length, elevatedChanges: elevated.size, attentionRecords: records.length, matchedPolicies: matched.size, byDomain, byChangeType } });
}
