import type { CandidatePlanEvaluationPolicy,CandidatePlanEvaluationRegistry } from "./types";
import { clone,compareText,deepFreeze,validatePolicy } from "./validation";
export class DeterministicCandidatePlanEvaluationRegistry implements CandidatePlanEvaluationRegistry {
 readonly #policies=new Map<string,CandidatePlanEvaluationPolicy>();
 constructor(policies:readonly CandidatePlanEvaluationPolicy[]=[]){policies.forEach(p=>this.register(p));}
 register(policy:CandidatePlanEvaluationPolicy):void{validatePolicy(policy);if(this.#policies.has(policy.identifier))throw new Error(`duplicate candidate plan evaluation policy identifier: ${policy.identifier}`);const metadata=deepFreeze(clone(policy.metadata));const supportedFindingTypes=deepFreeze([...policy.supportedFindingTypes]);this.#policies.set(policy.identifier,Object.freeze({...policy,metadata,supportedFindingTypes,applies:policy.applies.bind(policy),evaluate:policy.evaluate.bind(policy)}));}
 policies():readonly CandidatePlanEvaluationPolicy[]{return Object.freeze([...this.#policies.values()].sort((a,b)=>compareText(a.identifier,b.identifier)));}
}
