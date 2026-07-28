import type { ExecutiveDeliberationContext, ExecutiveDeliberationContextInput } from "./types";

export const compareText = (a:string,b:string):number => a < b ? -1 : a > b ? 1 : 0;
export function clone<T>(value:T):T { return JSON.parse(JSON.stringify(value)) as T }
export function deepFreeze<T>(value:T):T { if(value&&typeof value==="object"&&!Object.isFrozen(value)){Object.values(value).forEach(deepFreeze);Object.freeze(value)}return value }
const required: (value: unknown, label: string) => asserts value is string = (value,label) =>{if(typeof value!=="string"||!value)throw new Error(`${label} is required`)};
const encode=(value:string)=>encodeURIComponent(value);
export const lifecycleComparisonIdentity=(input:ExecutiveDeliberationContextInput):string=>`lifecycle-comparison:${encode(input.lifecycleComparison.previousSnapshotId)}:${encode(input.lifecycleComparison.currentSnapshotId)}`;
export const deliberationContextIdentity=(stateId:string,contextId:string,assessmentId:string,lifecycleId:string,configuration:unknown):string=>`executive-deliberation-context:${[stateId,contextId,assessmentId,lifecycleId,JSON.stringify(configuration)].map(encode).join(":")}`;

export function validateInput(input:ExecutiveDeliberationContextInput):void {
 if(!input||typeof input!=="object")throw new Error("deliberation context input is required");
 const context=input.executiveContextSnapshot,assessment=input.assessmentSet,comparison=input.lifecycleComparison;
 if(!context)throw new Error("executive context snapshot is required");
 if(!assessment)throw new Error("situation assessment set is required");
 if(!comparison)throw new Error("lifecycle comparison is required");
 required(context.contextId,"executive context identity");required(context.sourceStateIdentity?.snapshotId,"executive state identity");required(assessment.situationSetId,"assessment set identity");
 if(!Array.isArray(assessment.assessments))throw new Error("situation assessments are required");
 if(context.lifecycle.lifecycleSnapshotId!==assessment.currentSnapshotId||comparison.currentSnapshotId!==assessment.currentSnapshotId||context.sourceStateIdentity.snapshotId==="")throw new Error("broken identity continuity");
 if(new Set(assessment.assessments.map(x=>x.assessmentId)).size!==assessment.assessments.length)throw new Error("duplicate situation assessment identity");
 for(const item of assessment.assessments)if(item.metadata.currentSnapshotId!==assessment.currentSnapshotId||item.metadata.situationId==="")throw new Error("inconsistent assessment lineage");
 const c=input.configuration??{};for(const [key,value] of Object.entries(c))if(!Array.isArray(value)||value.some(x=>typeof x!=="string"||!x))throw new Error(`invalid deliberation configuration: ${key}`);
}
export function createExecutiveDeliberationContext(value:ExecutiveDeliberationContext):ExecutiveDeliberationContext {
 required(value.deliberationContextId,"deliberation context identity");
 if(value.deliberationContextId!==deliberationContextIdentity(value.executiveStateId!,value.executiveContextId!,value.situationAssessmentSetId!,value.lifecycleComparisonId!,{reasoningConstraints:value.executiveReasoningConstraints!,assumptions:value.executiveAssumptions!,requiredDecisions:value.requiredExecutiveDecisions!}))throw new Error("invalid deliberation context identity");
 return deepFreeze(clone(value));
}
