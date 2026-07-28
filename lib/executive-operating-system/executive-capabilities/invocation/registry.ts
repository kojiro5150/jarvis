import type { ExecutiveCapabilityImplementation } from "./types";
import { canonical,clone,compareText,deepFreeze,validateImplementation } from "./validation";
export class ExecutiveCapabilityImplementationRegistry {
 readonly registryId:string; private readonly published:readonly ExecutiveCapabilityImplementation[];
 constructor(implementations:readonly ExecutiveCapabilityImplementation[]){if(!Array.isArray(implementations))throw new Error("implementations must be an array");const copies=implementations.map(x=>{validateImplementation(x);return {...clone(x),invoke:x.invoke} as ExecutiveCapabilityImplementation});const keys=copies.map(x=>`${x.implementationId}@${x.implementationVersion}`);if(new Set(keys).size!==keys.length)throw new Error("duplicate implementation identity and version");copies.sort((a,b)=>compareText(a.implementationId,b.implementationId)||compareText(a.implementationVersion,b.implementationVersion));this.registryId=`implementation-registry:${canonical(keys.sort(compareText))}`;this.published=deepFreeze(copies);Object.freeze(this)}
 implementations():readonly ExecutiveCapabilityImplementation[]{return this.published}
 forCapability(capabilityId:string):readonly ExecutiveCapabilityImplementation[]{return this.published.filter(x=>x.capabilityId===capabilityId)}
 get(implementationId:string,implementationVersion:string):ExecutiveCapabilityImplementation|undefined{return this.published.find(x=>x.implementationId===implementationId&&x.implementationVersion===implementationVersion)}
}
