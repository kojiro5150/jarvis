import type { AssessmentRegistryContract, SituationAssessmentPolicy, SituationAssessmentPolicyMetadata } from "./types";
import { compareText, deepFreeze, metadataOf, validatePolicy } from "./validation";

export class AssessmentRegistry implements AssessmentRegistryContract {
  readonly #policies = new Map<string, SituationAssessmentPolicy>();
  constructor(policies: readonly SituationAssessmentPolicy[] = []) { policies.forEach(policy => this.register(policy)); }
  register(policy: SituationAssessmentPolicy): void { validatePolicy(policy); if (this.#policies.has(policy.id)) throw new Error(`duplicate assessment policy identifier: ${policy.id}`); this.#policies.set(policy.id, deepFreeze({ ...metadataOf(policy), applies: policy.applies.bind(policy), observe: policy.observe.bind(policy) })); }
  policies(): readonly SituationAssessmentPolicy[] { return Object.freeze([...this.#policies.values()].sort((a, b) => compareText(a.id, b.id))); }
  metadata(): readonly SituationAssessmentPolicyMetadata[] { return deepFreeze(this.policies().map(metadataOf)); }
}

export { AssessmentRegistry as SituationAssessmentRegistry };
