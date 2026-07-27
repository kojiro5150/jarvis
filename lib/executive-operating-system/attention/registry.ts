import type { AttentionPolicy, AttentionPolicyMetadata } from "./types";
import { clone, compareText, deepFreeze, validateMetadata } from "./validation";

export class AttentionPolicyRegistry {
  readonly #policies = new Map<string, AttentionPolicy>();
  constructor(policies: readonly AttentionPolicy[] = []) { policies.forEach(policy => this.register(policy)); }
  register(policy: AttentionPolicy): void { validateMetadata(policy); if (typeof policy.evaluate !== "function") throw new Error("attention policy must implement evaluate()"); if (this.#policies.has(policy.id)) throw new Error(`duplicate attention policy identifier: ${policy.id}`); const canonical = Object.freeze({ id: policy.id, version: policy.version, description: policy.description, appliesTo: Object.freeze([...policy.appliesTo]), evaluate: policy.evaluate.bind(policy) }); this.#policies.set(policy.id, canonical); }
  policies(): readonly AttentionPolicy[] { return Object.freeze([...this.#policies.values()].sort((a, b) => compareText(a.id, b.id))); }
  metadata(): readonly AttentionPolicyMetadata[] { return deepFreeze(this.policies().map(({ id, version, description, appliesTo }) => clone({ id, version, description, appliesTo: [...appliesTo] }))); }
}
