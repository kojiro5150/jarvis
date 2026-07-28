import type { ExecutiveCapabilityDefinition,ExecutiveCapabilityPolicy,ExecutiveCapabilityRoutingRule,ExecutiveCapabilityScenario } from "./types";
const required=(x:string,label:string)=>{if(typeof x!=="string"||!x.trim())throw new ExecutiveCapabilityRegistryError("INVALID_CAPABILITY_REGISTRY",`${label} must be a non-empty string`)};
const unique=(xs:readonly string[],label:string)=>{if(!Array.isArray(xs)||new Set(xs).size!==xs.length)throw new ExecutiveCapabilityRegistryError("DUPLICATE_CAPABILITY_ID",`${label} must be unique`);xs.forEach(x=>required(x,label))};
export class ExecutiveCapabilityRegistryError extends Error { constructor(readonly code:"INVALID_CAPABILITY_REGISTRY"|"DUPLICATE_CAPABILITY_ID"|"INVALID_CAPABILITY_MATRIX_ENTRY",message:string){super(message);this.name="ExecutiveCapabilityRegistryError"} }
export class ExecutiveCapabilityRegistry {
 private readonly byId:ReadonlyMap<string,ExecutiveCapabilityDefinition>;
 constructor(readonly capabilities:readonly ExecutiveCapabilityDefinition[],readonly scenarios:readonly ExecutiveCapabilityScenario[],readonly policies:readonly ExecutiveCapabilityPolicy[],readonly routingRules:readonly ExecutiveCapabilityRoutingRule[]){
  unique(capabilities.map(x=>x.capabilityId),"capability ids"); capabilities.forEach(x=>{required(x.capabilityVersion,"capability version");if(!["active","inactive"].includes(x.status)||!Array.isArray(x.supportedActionClasses)||new Set(x.supportedActionClasses).size!==x.supportedActionClasses.length)throw new ExecutiveCapabilityRegistryError("INVALID_CAPABILITY_REGISTRY",`invalid capability: ${x.capabilityId}`);unique(x.dependencyCapabilityIds,`dependencies for ${x.capabilityId}`)});this.byId=new Map(capabilities.map(x=>[x.capabilityId,x]));
  const refs=(xs:readonly string[],owner:string)=>{unique(xs,owner);xs.forEach(x=>{if(!this.byId.has(x))throw new ExecutiveCapabilityRegistryError("INVALID_CAPABILITY_REGISTRY",`${owner} references unknown capability id: ${x}`)})};
  unique(scenarios.map(x=>x.scenarioId),"scenario ids");scenarios.forEach(x=>refs(x.capabilityIds,`scenario ${x.scenarioId}`));unique(policies.map(x=>x.policyId),"policy ids");policies.forEach(x=>{required(x.policyVersion,"policy version");refs(x.eligibleCapabilityIds,`policy ${x.policyId}`)});unique(routingRules.map(x=>x.routingRuleId),"routing rule ids");routingRules.forEach(x=>{if(!this.byId.has(x.capabilityId)||!x.actionClasses.length||new Set(x.actionClasses).size!==x.actionClasses.length)throw new ExecutiveCapabilityRegistryError("INVALID_CAPABILITY_MATRIX_ENTRY",`invalid routing rule: ${x.routingRuleId}`)});
  Object.freeze(capabilities);Object.freeze(scenarios);Object.freeze(policies);Object.freeze(routingRules);Object.freeze(this);
 }
 capability(id:string){return this.byId.get(id)}
}
