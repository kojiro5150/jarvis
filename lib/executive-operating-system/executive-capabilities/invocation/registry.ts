import type { ExecutiveCapabilityImplementation } from "./types";
import { canonical,compareText,deepFreeze,validateImplementation } from "./validation";

export class ExecutiveCapabilityImplementationRegistry {
 readonly registryId:string;
 private readonly entries:readonly ExecutiveCapabilityImplementation[];
 constructor(implementations:readonly ExecutiveCapabilityImplementation[]){
  if(!Array.isArray(implementations))throw new Error("INVALID_IMPLEMENTATION_REGISTRY");
  const ids=new Set<string>();
  for(const implementation of implementations){validateImplementation(implementation);if(ids.has(implementation.implementationId))throw new Error("DUPLICATE_IMPLEMENTATION_IDENTITY");ids.add(implementation.implementationId)}
  this.entries=deepFreeze([...implementations].sort((a,b)=>compareText(a.implementationId,b.implementationId)).map(x=>deepFreeze({...x,capabilityIds:[...x.capabilityIds],actionClasses:[...x.actionClasses],authorityRequirements:[...x.authorityRequirements]})));
  this.registryId=`implementation-registry:${canonical(this.entries.map(x=>[x.implementationId,x.implementationVersion,...x.capabilityIds].join("|")))}`;Object.freeze(this);
 }
 implementations(){return this.entries}
 forCapability(capabilityId:string){return this.entries.filter(x=>x.capabilityIds.includes(capabilityId))}
}
