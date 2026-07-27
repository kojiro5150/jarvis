import type { CandidatePlanConstructionPolicy, CandidatePlanRegistry } from "./types";
import { compareText, deepFreeze, validatePolicy } from "./validation";
export class DeterministicCandidatePlanRegistry implements CandidatePlanRegistry {
  readonly #policies=new Map<string,CandidatePlanConstructionPolicy>();
  constructor(policies:readonly CandidatePlanConstructionPolicy[]=[]){policies.forEach(p=>this.register(p));}
  register(policy:CandidatePlanConstructionPolicy):void { validatePolicy(policy);if(this.#policies.has(policy.identifier))throw new Error(`duplicate candidate plan policy identifier: ${policy.identifier}`);const metadata=deepFreeze({...policy.metadata});const categories=deepFreeze([...policy.supportedCategories]);this.#policies.set(policy.identifier,Object.freeze({...policy,metadata,supportedCategories:categories,evaluate:policy.evaluate.bind(policy),construct:policy.construct.bind(policy)})); }
  policies():readonly CandidatePlanConstructionPolicy[]{return Object.freeze([...this.#policies.values()].sort((a,b)=>compareText(a.identifier,b.identifier)));}
}
