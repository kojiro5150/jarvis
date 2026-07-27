import type { ContextPolicy, ContextPolicyMetadata, ContextRegistry as RegistryContract } from "./types";
import { compareText, deepFreeze, policyMetadata, validatePolicy } from "./validation";

export class ExecutiveContextRegistry implements RegistryContract {
  readonly #policies = new Map<string, ContextPolicy>();
  constructor(policies: readonly ContextPolicy[] = []) { policies.forEach(policy => this.register(policy)); }
  register(policy: ContextPolicy): void { validatePolicy(policy); if (this.#policies.has(policy.id)) throw new Error(`duplicate context policy identifier: ${policy.id}`); this.#policies.set(policy.id, deepFreeze({ ...policyMetadata(policy), construct: policy.construct.bind(policy) })); }
  policies(): readonly ContextPolicy[] { return Object.freeze([...this.#policies.values()].sort((a, b) => compareText(a.id, b.id))); }
  metadata(): readonly ContextPolicyMetadata[] { return deepFreeze(this.policies().map(policyMetadata)); }
}
