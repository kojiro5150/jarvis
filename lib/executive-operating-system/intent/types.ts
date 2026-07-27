import type { ExecutiveContext } from "../context";

export type IntentType = "operational" | "strategic" | "standing" | "session" | "mission";
export type ConstraintType = "authority" | "temporal" | "resource" | "governance" | "behavioural" | "privacy" | "execution" | "approval";
export type ActivationStatus = "active" | "inactive";
export type BindingStatus = "binding" | "non-binding";
export type CanonicalValue = null | boolean | number | string | readonly CanonicalValue[] | { readonly [key: string]: CanonicalValue };
export type CanonicalScope = Readonly<Record<string, CanonicalValue>>;

export interface IntentMetadata { readonly policyId: string; readonly policyVersion: string }
export interface ConstraintMetadata { readonly policyId: string; readonly policyVersion: string }
export interface ExecutiveIntent { readonly identifier: string; readonly type: IntentType; readonly description: string; readonly origin: string; readonly activationStatus: ActivationStatus; readonly scope: CanonicalScope; readonly metadata: IntentMetadata }
export interface ExecutiveConstraint { readonly identifier: string; readonly type: ConstraintType; readonly origin: string; readonly scope: CanonicalScope; readonly bindingStatus: BindingStatus; readonly metadata: ConstraintMetadata }

export interface IntentDefinition { readonly identifier: string; readonly type: IntentType; readonly description: string; readonly origin: string; readonly activationStatus: ActivationStatus; readonly scope: CanonicalScope }
export interface ConstraintDefinition { readonly identifier: string; readonly type: ConstraintType; readonly origin: string; readonly scope: CanonicalScope; readonly bindingStatus: BindingStatus }
export interface IntentConfiguration { readonly objectives: readonly IntentDefinition[] }
export interface ConstraintConfiguration { readonly constraints: readonly ConstraintDefinition[] }

export interface IntentPolicy { readonly id: string; readonly version: string; readonly description: string; readonly intentType: IntentType; construct(context: ExecutiveContext, definitions: readonly IntentDefinition[]): readonly ExecutiveIntent[] }
export interface ConstraintPolicy { readonly id: string; readonly version: string; readonly description: string; readonly constraintTypes: readonly ConstraintType[]; construct(context: ExecutiveContext, definitions: readonly ConstraintDefinition[]): readonly ExecutiveConstraint[] }
export interface IntentSummary { readonly objectiveCount: number; readonly activeCount: number; readonly inactiveCount: number; readonly byType: Readonly<Record<IntentType, number>> }
export interface ConstraintSummary { readonly constraintCount: number; readonly bindingCount: number; readonly nonBindingCount: number; readonly byType: Readonly<Record<ConstraintType, number>> }
export interface IntentSet { readonly intentSetId: string; readonly contextId: string; readonly objectives: readonly ExecutiveIntent[]; readonly summary: IntentSummary; readonly provenance: Readonly<{ contextId: string; policies: readonly IntentMetadata[] }> }
export interface ConstraintSet { readonly constraintSetId: string; readonly contextId: string; readonly constraints: readonly ExecutiveConstraint[]; readonly summary: ConstraintSummary; readonly provenance: Readonly<{ contextId: string; policies: readonly ConstraintMetadata[] }> }
export interface IntentRegistry { register(policy: IntentPolicy): void; policies(): readonly IntentPolicy[] }
export interface ConstraintRegistry { register(policy: ConstraintPolicy): void; policies(): readonly ConstraintPolicy[] }
export interface IntentEngine { construct(context: ExecutiveContext, configuration: IntentConfiguration): IntentSet }
export interface ConstraintEngine { construct(context: ExecutiveContext, configuration: ConstraintConfiguration): ConstraintSet }
