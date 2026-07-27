import type { ExecutiveReasoningPolicy,ExecutiveReasoningRegistry } from "./types";
import { clone,compareText,deepFreeze,validatePolicy } from "./validation";
export class DeterministicExecutiveReasoningRegistry implements ExecutiveReasoningRegistry{
 private readonly entries=new Map<string,ExecutiveReasoningPolicy>();
 register(policy:ExecutiveReasoningPolicy):void{validatePolicy(policy);if(this.entries.has(policy.identifier))throw new Error(`duplicate reasoning policy identifier: ${policy.identifier}`);const copy={...policy,metadata:deepFreeze(clone(policy.metadata)),supportedScopes:deepFreeze(clone(policy.supportedScopes)),supportedObservationTypes:deepFreeze(clone(policy.supportedObservationTypes))};this.entries.set(copy.identifier,Object.freeze(copy))}
 policies():readonly ExecutiveReasoningPolicy[]{return Object.freeze([...this.entries.values()].sort((a,b)=>compareText(a.identifier,b.identifier)))}
}
