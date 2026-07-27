import type { SituationFormationPolicy, SituationFormationPolicyMetadata } from "./types";
import { compareText, deepFreeze, metadataOf, validatePolicy } from "./validation";

export class SituationFormationRegistry {
  readonly #policies = new Map<string, SituationFormationPolicy>();
  constructor(policies: readonly SituationFormationPolicy[] = []) { policies.forEach(policy => this.register(policy)); }
  register(policy: SituationFormationPolicy): void { validatePolicy(policy); if (this.#policies.has(policy.id)) throw new Error(`duplicate situation formation policy identifier: ${policy.id}`); this.#policies.set(policy.id, Object.freeze({ ...metadataOf(policy), form: policy.form.bind(policy) })); }
  policies(): readonly SituationFormationPolicy[] { return Object.freeze([...this.#policies.values()].sort((a, b) => compareText(a.id, b.id))); }
  metadata(): readonly SituationFormationPolicyMetadata[] { return deepFreeze(this.policies().map(metadataOf)); }
}
