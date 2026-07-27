import type { CanonicalValue } from "../../intent";
import type { CandidatePlan } from "../candidates";
import type { CandidatePlanEvaluation,CandidatePlanEvaluationFinding } from "../evaluation";
import type { CandidatePlanComparisonDefinition,CandidatePlanComparisonDimensionType,CandidatePlanComparisonInput,CandidatePlanComparisonPolicy,ObservationDraft,PairwiseResultDraft } from "./types";
import { canonical,compareText } from "./validation";

const findings=(e:CandidatePlanEvaluation):readonly CandidatePlanEvaluationFinding[]=>[...e.constraintFindings,...e.dependencyFindings,...e.approvalFindings,...e.assumptionFindings,...e.completionConditionFindings,...e.evidenceFindings];
const refs=(xs:readonly string[])=>[...new Set(xs)].sort(compareText);
const evidence=(c:CandidatePlan)=>refs(c.evidenceReferences.map(x=>`${x.type}:${x.identifier}`));
function extract(input:CandidatePlanComparisonInput,c:CandidatePlan,e:CandidatePlanEvaluation,d:CandidatePlanComparisonDefinition):{value:CanonicalValue;references:string[];presence:ObservationDraft["valuePresence"]}{
 const all=findings(e),key=d.selectorKey;
 switch(d.target){
  case "finding-status":return {value:all.filter(x=>x.status===key).length,references:all.filter(x=>x.status===key).map(x=>x.findingId),presence:"present"};
  case "finding-type":return {value:all.filter(x=>x.findingType===key).length,references:all.filter(x=>x.findingType===key).map(x=>x.findingId),presence:"present"};
  case "finding-policy":return {value:all.filter(x=>x.policyIdentifier===key).length,references:all.filter(x=>x.policyIdentifier===key).map(x=>x.findingId),presence:"present"};
  case "constraint-references":return set(c.constraintReferences);
  case "objective-references":return set(c.objectiveReferences);
  case "evidence-references":return set(evidence(c));
  case "missing-evidence-references":return set(all.flatMap(x=>[...x.missingEvidenceReferences]));
  case "conflicting-evidence-references":return set(all.filter(x=>x.status==="indeterminate").flatMap(x=>[...x.evidenceReferences]));
  case "approval-requirements":return set(c.approvalRequirements.map(x=>x.identifier));
  case "dependencies":return set(c.dependencies.map(x=>x.identifier));
  case "assumptions":return set(c.assumptions.map(x=>x.identifier));
  case "completion-conditions":return set(c.completionConditions.map(x=>x.identifier));
  case "plan-steps":return {value:c.steps.map(x=>({identifier:x.identifier,type:x.type,ordinal:x.ordinal,objectiveReferences:refs(x.objectiveReferences),dependencyReferences:refs(x.dependencyReferences),approvalRequirementReferences:refs(x.approvalRequirementReferences),completionConditionReferences:refs(x.completionConditionReferences)})),references:c.steps.map(x=>x.identifier),presence:"present"};
  case "provenance-references":return set([c.provenance.contextId,c.provenance.intentSetId,c.provenance.constraintSetId,c.provenance.definitionIdentifier,c.provenance.policyIdentifier,...e.provenance.findingIdentifiers]);
  case "temporal-constraint-scope":return scoped(input,c,"temporal",key);
  case "resource-constraint-scope":return scoped(input,c,"resource",key);
  case "candidate-metadata":{const allowed:Record<string,CanonicalValue>={category:c.category,definitionIdentifier:c.definitionIdentifier,definitionVersion:c.definitionVersion,policyIdentifier:c.policyIdentifier,policyVersion:c.policyVersion};return key&&key in allowed?{value:allowed[key],references:[key],presence:"present"}:{value:null,references:[],presence:"unsupported"}}
 }
}
function set(v:readonly string[]){const value=refs(v);return {value,references:value,presence:"present" as const}}
function scoped(input:CandidatePlanComparisonInput,c:CandidatePlan,type:"temporal"|"resource",key?:string){const constraints=input.constraintSet.constraints.filter(x=>x.type===type&&c.constraintReferences.includes(x.identifier));const selected=key?constraints.filter(x=>x.identifier===key):constraints;if(!selected.length)return {value:null,references:[],presence:"absent" as const};const value=selected.map(x=>({identifier:x.identifier,scope:x.scope}));return {value,references:selected.map(x=>x.identifier),presence:"present" as const}}
function relation(left:ObservationDraft|import("./types").CandidatePlanDimensionObservation,right:ObservationDraft|import("./types").CandidatePlanDimensionObservation,d:CandidatePlanComparisonDefinition):PairwiseResultDraft{
 if(left.valuePresence==="conflicting"||right.valuePresence==="conflicting")return result("indeterminate","conflicting","dimension-values-conflicting");
 if(left.valuePresence==="unsupported"||right.valuePresence==="unsupported")return result("not_comparable","unsupported","dimension-values-not-comparable");
 if(left.valuePresence==="absent"&&right.valuePresence==="absent")return result("not_comparable","absent_in_both","dimension-values-not-comparable");
 if(left.valuePresence!==right.valuePresence)return left.valuePresence==="present"?result("only_left","present_only_left",d.dimensionType==="evidence-reference-set"?"evidence-reference-missing-right":"dimension-present-only-left"):result("only_right","present_only_right",d.dimensionType==="evidence-reference-set"?"evidence-reference-missing-left":"dimension-present-only-right");
 const same=canonical(left.value)===canonical(right.value),count=d.valueShape==="count";
 const code=same?(d.dimensionType==="status-count"?"status-counts-equivalent":d.dimensionType==="finding-type-count"?"finding-type-counts-equivalent":d.dimensionType==="constraint-reference-set"?"constraint-reference-sets-equivalent":d.dimensionType==="typed-temporal-value"?"typed-temporal-values-equivalent":"dimension-values-equivalent"):(d.dimensionType==="status-count"?"status-counts-different":d.dimensionType==="finding-type-count"?"finding-type-counts-different":d.dimensionType==="constraint-reference-set"?"constraint-reference-sets-different":d.dimensionType==="typed-resource-value"?"typed-resource-values-different":"dimension-values-different");
 return result(same?"equivalent":"different",same?(count?"same_count":"same_value"):(count?"different_count":"different_value"),code);
 function result(relation:PairwiseResultDraft["relation"],outcome:PairwiseResultDraft["outcome"],reasonCode:PairwiseResultDraft["reasonCode"]):PairwiseResultDraft{return {dimensionType:d.dimensionType,relation,outcome,leftValue:left.value,rightValue:right.value,reasonCode}}
}
function policy(identifier:string,displayName:string,supportedDimensionTypes:readonly CandidatePlanComparisonDimensionType[]):CandidatePlanComparisonPolicy{return {identifier,version:"1",metadata:{identifier,version:"1",displayName,description:`Deterministically observes explicit typed ${displayName.toLowerCase()} without preference semantics.`,supportedDimensionTypes,origin:"sprint-3.21",status:"active"},supportedDimensionTypes,applies(_i,c,_e,d){return supportedDimensionTypes.includes(d.dimensionType)&&(!d.candidateScope||d.candidateScope.includes(c.candidatePlanId))&&(!d.applicability.candidateIdentifiers||d.applicability.candidateIdentifiers.includes(c.candidatePlanId))},observe(i,c,e,d){const x=extract(i,c,e,d);return {dimensionType:d.dimensionType,valueShape:d.valueShape,value:x.value,valuePresence:x.presence,sourceReferences:x.references,reasonCode:x.presence==="present"?"dimension-value-observed":x.presence==="absent"?"dimension-value-absent":"unsupported-dimension-shape"}},compare(l,r,d){return relation(l,r,d)}}}
export const findingStatusCountComparisonPolicy=policy("finding-status-count-comparison","Finding Status Count Comparison",["status-count"]);
export const findingTypeCountComparisonPolicy=policy("finding-type-count-comparison","Finding Type Count Comparison",["finding-type-count","policy-count"]);
export const canonicalReferenceSetComparisonPolicy=policy("canonical-reference-set-comparison","Canonical Reference Set Comparison",["constraint-reference-set","objective-reference-set","evidence-reference-set","missing-evidence-set","conflicting-evidence-set","approval-requirement-set","dependency-set","assumption-set","completion-condition-set"]);
export const typedTemporalValueComparisonPolicy=policy("typed-temporal-value-comparison","Typed Temporal Value Comparison",["typed-temporal-value"]);
export const typedResourceValueComparisonPolicy=policy("typed-resource-value-comparison","Typed Resource Value Comparison",["typed-resource-value"]);
export const planStructureComparisonPolicy=policy("plan-structure-comparison","Plan Structure Comparison",["plan-step-structure"]);
export const provenanceComparisonPolicy=policy("provenance-comparison","Provenance Comparison",["provenance-reference-set"]);
export const explicitMetadataComparisonPolicy=policy("explicit-metadata-comparison","Explicit Metadata Comparison",["configured-metadata-value"]);
export const productionCandidatePlanComparisonPolicies=Object.freeze([findingStatusCountComparisonPolicy,findingTypeCountComparisonPolicy,canonicalReferenceSetComparisonPolicy,typedTemporalValueComparisonPolicy,typedResourceValueComparisonPolicy,planStructureComparisonPolicy,provenanceComparisonPolicy,explicitMetadataComparisonPolicy]);
