import { createProjectionArtifact } from "../situational-awareness/projection";
import type { ExecutiveOperatingSystemInput, ExecutiveOperatingSystemExecutionTrace } from "./types";
import { EXECUTIVE_OPERATING_SYSTEM_STAGE_ORDER } from "./types";
export function deepFreeze<T>(value:T):T { if(value&&typeof value==="object"&&!Object.isFrozen(value)){Object.values(value).forEach(deepFreeze);Object.freeze(value)} return value }
export function clone<T>(value:T):T { return JSON.parse(JSON.stringify(value)) as T }
export function validateRuntimeInput(input:unknown): asserts input is ExecutiveOperatingSystemInput {
  if(!input||typeof input!=="object") throw new Error("runtime input must be an object");
  const candidate=input as ExecutiveOperatingSystemInput, set=candidate.projectionArtifacts;
  if(!set||!Array.isArray(set.artifacts)||set.artifacts.length===0) throw new Error("projectionArtifacts.artifacts must be a non-empty array");
  set.artifacts.forEach(createProjectionArtifact);
  if(typeof set.snapshotId!=="string"||!set.snapshotId||typeof set.observedAt!=="string"||!set.observedAt) throw new Error("snapshot boundary is required");
  if(typeof candidate.referenceTime!=="string"||!candidate.referenceTime) throw new Error("explicit referenceTime is required");
  if(!set.previousSnapshot||!candidate.configuration) throw new Error("previous snapshot and deterministic configuration are required");
  for(const key of ["candidatePlanDefinitions","evaluationDefinitions","comparisonDefinitions","reasoningDefinitions","proposalDefinitions"] as const) if(!Array.isArray(candidate.configuration[key])) throw new Error(`configuration.${key} must be an array`);
  for(const key of ["capabilities","capabilityScenarios","capabilityPolicies","capabilityRoutingRules"] as const) if(candidate.configuration[key]!==undefined&&!Array.isArray(candidate.configuration[key])) throw new Error(`configuration.${key} must be an array`);
  if(candidate.configuration.capabilityInvocationHandoffPolicy!==undefined&&typeof candidate.configuration.capabilityInvocationHandoffPolicy!=="object")throw new Error("configuration.capabilityInvocationHandoffPolicy must be an object");
  if(candidate.configuration.capabilityInvocationEnvelopePolicy!==undefined&&typeof candidate.configuration.capabilityInvocationEnvelopePolicy!=="object")throw new Error("configuration.capabilityInvocationEnvelopePolicy must be an object");
  if(candidate.configuration.capabilityInvocationPolicy!==undefined&&typeof candidate.configuration.capabilityInvocationPolicy!=="object")throw new Error("configuration.capabilityInvocationPolicy must be an object");
  if(!Array.isArray(candidate.configuration.intent?.objectives)||!Array.isArray(candidate.configuration.constraints?.constraints)) throw new Error("intent and constraint configuration are required");
}
export function validateTrace(trace:ExecutiveOperatingSystemExecutionTrace):void { if(trace.stages.length!==EXECUTIVE_OPERATING_SYSTEM_STAGE_ORDER.length||trace.stages.some((x,i)=>x.stageId!==EXECUTIVE_OPERATING_SYSTEM_STAGE_ORDER[i]||x.sequence!==i+1)) throw new Error("runtime trace does not match canonical stage order") }
