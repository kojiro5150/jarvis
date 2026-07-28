import type { ExecutiveDeliberationContext } from "../deliberation";
import type { ConstraintDefinition, ConstraintPolicy, ConstraintType, ExecutiveConstraint, ExecutiveIntent, IntentDefinition, IntentPolicy, IntentType } from "./types";
import { clone, deepFreeze } from "./validation";

const intentPolicy = (id: string, intentType: IntentType, description: string): IntentPolicy => deepFreeze({ id, version: "1.0.0", intentType, description, construct: (_context: ExecutiveDeliberationContext, definitions: readonly IntentDefinition[]): readonly ExecutiveIntent[] => definitions.filter(d => d.type === intentType).map(definition => ({ ...clone(definition), metadata: { policyId: id, policyVersion: "1.0.0" } })) });
const constraintPolicy = (id: string, constraintTypes: readonly ConstraintType[], description: string): ConstraintPolicy => deepFreeze({ id, version: "1.0.0", constraintTypes, description, construct: (_context: ExecutiveDeliberationContext, definitions: readonly ConstraintDefinition[]): readonly ExecutiveConstraint[] => definitions.filter(d => constraintTypes.includes(d.type)).map(definition => ({ ...clone(definition), metadata: { policyId: id, policyVersion: "1.0.0" } })) });

export const operationalObjectivePolicy = intentPolicy("intent.operational-objective", "operational", "Constructs explicitly configured operational objectives.");
export const standingObjectivePolicy = intentPolicy("intent.standing-objective", "standing", "Constructs explicitly configured standing objectives.");
export const governanceConstraintPolicy = constraintPolicy("constraint.governance", ["governance"], "Constructs configured governance obligations.");
export const authorityConstraintPolicy = constraintPolicy("constraint.authority", ["authority"], "Constructs configured decision-authority boundaries.");
export const executionApprovalConstraintPolicy = constraintPolicy("constraint.execution-approval", ["execution", "approval"], "Constructs configured execution prohibitions and human approval requirements.");
export const behaviouralConstitutionConstraintPolicy = constraintPolicy("constraint.behavioural-constitution", ["behavioural"], "Constructs configured behavioural constitution boundaries.");
export const resourceConstraintPolicy = constraintPolicy("constraint.resource", ["resource"], "Constructs configured resource limits.");
export const temporalConstraintPolicy = constraintPolicy("constraint.temporal", ["temporal"], "Constructs configured time boundaries.");
export const INITIAL_INTENT_POLICIES = Object.freeze([operationalObjectivePolicy, standingObjectivePolicy]);
export const INITIAL_CONSTRAINT_POLICIES = Object.freeze([authorityConstraintPolicy, behaviouralConstitutionConstraintPolicy, executionApprovalConstraintPolicy, governanceConstraintPolicy, resourceConstraintPolicy, temporalConstraintPolicy]);
