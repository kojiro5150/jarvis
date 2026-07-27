import { ATTENTION_DOMAINS } from "./types";
import type { AttentionPolicyMetadata, AttentionReason, ExecutiveAttentionQueue } from "./types";

export const compareText = (a: string, b: string): number => a < b ? -1 : a > b ? 1 : 0;
export function required(value: unknown, path: string): asserts value is string { if (typeof value !== "string" || value.trim() === "") throw new Error(`${path} must be a non-empty string`); }
export function clone<T>(value: T): T { if (Array.isArray(value)) return value.map(clone) as T; if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, clone(v)])) as T; return value; }
export function deepFreeze<T>(value: T): T { if (value && typeof value === "object" && !Object.isFrozen(value)) { Object.values(value).forEach(deepFreeze); Object.freeze(value); } return value; }
export function jsonCompatible(value: unknown, path = "value", ancestors = new Set<object>()): void {
  if (value === null || typeof value === "string" || typeof value === "boolean" || (typeof value === "number" && Number.isFinite(value))) return;
  if (!value || typeof value !== "object" || ancestors.has(value as object) || (!Array.isArray(value) && Object.getPrototypeOf(value) !== Object.prototype)) throw new Error(`${path} must contain only JSON-compatible values`);
  ancestors.add(value as object); for (const [key, child] of Object.entries(value)) jsonCompatible(child, `${path}.${key}`, ancestors); ancestors.delete(value as object);
}
export function validateMetadata(policy: AttentionPolicyMetadata): void {
  if (!policy || typeof policy !== "object") throw new Error("attention policy must be an object");
  required(policy.id, "attention policy id"); required(policy.version, "attention policy version"); required(policy.description, "attention policy description");
  if (!Array.isArray(policy.appliesTo) || policy.appliesTo.length === 0) throw new Error("attention policy appliesTo must be a non-empty array");
  for (const domain of policy.appliesTo) if (!(ATTENTION_DOMAINS as readonly string[]).includes(domain)) throw new Error(`unsupported attention domain: ${String(domain)}`);
  if (new Set(policy.appliesTo).size !== policy.appliesTo.length) throw new Error(`attention policy ${policy.id} contains duplicate domains`);
}
export function validateReason(reason: AttentionReason): void {
  if (!reason || typeof reason !== "object") throw new Error("matched attention policy must return a reason");
  required(reason.code, "attention reason code"); required(reason.message, "attention reason message");
  if (!Array.isArray(reason.evidence)) throw new Error("attention reason evidence must be an array");
  reason.evidence.forEach((item, i) => { if (!item || typeof item !== "object") throw new Error(`attention reason evidence[${i}] must be an object`); required(item.field, `attention reason evidence[${i}].field`); jsonCompatible(item.value, `attention reason evidence[${i}].value`); });
}
export function createExecutiveAttentionQueue(candidate: ExecutiveAttentionQueue): ExecutiveAttentionQueue {
  jsonCompatible(candidate, "attention queue"); required(candidate.queueId, "attention queue id"); required(candidate.previousSnapshotId, "attention queue previousSnapshotId"); required(candidate.currentSnapshotId, "attention queue currentSnapshotId");
  if (!Array.isArray(candidate.policySet) || !Array.isArray(candidate.records) || !candidate.summary) throw new Error("attention queue has invalid structure");
  const policyKeys = new Set<string>(); candidate.policySet.forEach(p => { required(p.id, "attention policy reference id"); required(p.version, "attention policy reference version"); const k = `${p.id}\0${p.version}`; if (policyKeys.has(k)) throw new Error(`duplicate attention policy reference: ${p.id}`); policyKeys.add(k); });
  const ids = new Set<string>(); const elevated = new Set<string>(); const matched = new Set<string>(); candidate.records.forEach(r => { required(r.attentionId, "attention record id"); required(r.previousSnapshotId, "attention record previousSnapshotId"); required(r.currentSnapshotId, "attention record currentSnapshotId"); if (r.previousSnapshotId !== candidate.previousSnapshotId || r.currentSnapshotId !== candidate.currentSnapshotId) throw new Error("attention record snapshot identifiers are inconsistent"); if (!(ATTENTION_DOMAINS as readonly string[]).includes(r.domain) || !["added", "modified", "removed"].includes(r.changeType)) throw new Error("attention record has an invalid canonical change"); if (ids.has(r.attentionId)) throw new Error(`duplicate attention record identifier: ${r.attentionId}`); ids.add(r.attentionId); if (!policyKeys.has(`${r.policy.id}\0${r.policy.version}`)) throw new Error(`attention record references unknown policy: ${r.policy.id}`); validateReason(r.reason); elevated.add(`${r.domain}\0${r.entityId ?? r.domain}\0${r.changeType}`); matched.add(`${r.policy.id}\0${r.policy.version}`); });
  const s = candidate.summary; const byDomain = Object.fromEntries(ATTENTION_DOMAINS.map(domain => [domain, candidate.records.filter(r => r.domain === domain).length])); const byChangeType = Object.fromEntries(["added", "modified", "removed"].map(type => [type, candidate.records.filter(r => r.changeType === type).length]));
  if (!Number.isInteger(s.evaluatedChanges) || s.evaluatedChanges < elevated.size || s.elevatedChanges !== elevated.size || s.attentionRecords !== candidate.records.length || s.matchedPolicies !== matched.size || JSON.stringify(s.byDomain) !== JSON.stringify(byDomain) || JSON.stringify(s.byChangeType) !== JSON.stringify(byChangeType)) throw new Error("attention queue summary is inconsistent");
  return deepFreeze(clone(candidate));
}
