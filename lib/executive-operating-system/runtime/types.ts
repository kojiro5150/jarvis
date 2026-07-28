import type { ProjectionArtifact } from "../situational-awareness/projection";
import type { SituationalAwareness } from "../situational-awareness/model";
import type { SituationalAwarenessSnapshot, SituationalAwarenessChangeSet } from "../situational-awareness/lifecycle";
import type { ExecutiveAttentionQueue } from "../attention";
import type { ExecutiveSituationSet } from "../situations";
import type { SituationAssessmentSet } from "../assessment";
import type { DeliberationConfiguration, ExecutiveDeliberationContext } from "../deliberation";
import type { ConstraintConfiguration, ConstraintSet, IntentConfiguration, IntentSet } from "../intent";
import type { CandidatePlanDefinition, CandidatePlanSet } from "../planning/candidates";
import type { CandidatePlanEvaluationDefinition, EvaluatedCandidatePlanSet } from "../planning/evaluation";
import type { CandidatePlanComparisonDefinition, CandidatePlanComparisonSet } from "../planning/comparison";
import type { ExecutiveReasoningDefinition, ExecutiveReasoningRecord } from "../reasoning";
import type { GovernedActionProposalDefinition, GovernedActionProposalSet } from "../proposal";
import type { ExecutiveCapabilityDefinition, ExecutiveCapabilityPolicy, ExecutiveCapabilityRoutingPlan, ExecutiveCapabilityRoutingRule, ExecutiveCapabilityScenario } from "../executive-capabilities";
import type { ExecutiveContextSnapshot } from "../../executive-context";
import type { ExecutiveStateSnapshot } from "../situational-awareness/assembly";

export interface ProjectionArtifactSet {
  readonly artifacts: readonly ProjectionArtifact[];
  readonly previousSnapshot: SituationalAwarenessSnapshot;
  readonly snapshotId: string;
  readonly observedAt: string;
}
export interface ExecutiveOperatingSystemConfiguration {
  readonly deliberation?: DeliberationConfiguration;
  readonly intent: IntentConfiguration;
  readonly constraints: ConstraintConfiguration;
  readonly candidatePlanDefinitions: readonly CandidatePlanDefinition[];
  readonly evaluationDefinitions: readonly CandidatePlanEvaluationDefinition[];
  readonly comparisonDefinitions: readonly CandidatePlanComparisonDefinition[];
  readonly reasoningDefinitions: readonly ExecutiveReasoningDefinition[];
  readonly proposalDefinitions: readonly GovernedActionProposalDefinition[];
  readonly capabilities?: readonly ExecutiveCapabilityDefinition[];
  readonly capabilityScenarios?: readonly ExecutiveCapabilityScenario[];
  readonly capabilityPolicies?: readonly ExecutiveCapabilityPolicy[];
  readonly capabilityRoutingRules?: readonly ExecutiveCapabilityRoutingRule[];
  readonly capabilityScenarioId?: string;
  readonly capabilityPolicyId?: string;
}
export interface ExecutiveOperatingSystemInput { readonly projectionArtifacts: ProjectionArtifactSet; readonly referenceTime: string; readonly configuration: ExecutiveOperatingSystemConfiguration }
export const EXECUTIVE_OPERATING_SYSTEM_STAGE_ORDER = ["state_assembly","executive_context_derivation","snapshot_lifecycle","executive_attention","situation_formation","situation_assessment","executive_deliberation_context","intent_and_constraints","candidate_plan_construction","candidate_plan_evaluation","candidate_plan_comparison","executive_reasoning","governed_action_proposal","capability_routing"] as const;
export type ExecutiveOperatingSystemStageId = typeof EXECUTIVE_OPERATING_SYSTEM_STAGE_ORDER[number];
export type ExecutiveOperatingSystemStageStatus = "completed" | "completed_empty";
export interface ExecutiveOperatingSystemStageTrace { readonly stageId: ExecutiveOperatingSystemStageId; readonly sequence: number; readonly inputArtifactIds: readonly string[]; readonly outputArtifactIds: readonly string[]; readonly status: ExecutiveOperatingSystemStageStatus; readonly validationStatus: "valid" }
export interface ExecutiveOperatingSystemExecutionTrace { readonly stages: readonly ExecutiveOperatingSystemStageTrace[] }
export interface ExecutiveOperatingSystemResult {
  readonly executiveState: ExecutiveStateSnapshot;
  readonly executiveContextSnapshot: ExecutiveContextSnapshot;
  readonly situationalAwareness: SituationalAwareness;
  readonly snapshot: SituationalAwarenessSnapshot;
  readonly changes: SituationalAwarenessChangeSet;
  readonly attention: ExecutiveAttentionQueue;
  readonly situations: ExecutiveSituationSet;
  readonly assessment: SituationAssessmentSet;
  readonly executiveDeliberationContext: ExecutiveDeliberationContext;
  readonly intent: IntentSet;
  readonly constraints: ConstraintSet;
  readonly candidatePlans: CandidatePlanSet;
  readonly evaluation: EvaluatedCandidatePlanSet;
  readonly comparison: CandidatePlanComparisonSet;
  readonly reasoning: ExecutiveReasoningRecord;
  readonly proposals: GovernedActionProposalSet;
  readonly capabilityRoutingPlan: ExecutiveCapabilityRoutingPlan;
  readonly trace: ExecutiveOperatingSystemExecutionTrace;
}
export type ExecutiveOperatingSystemFailureCategory = "validation" | "execution";
export class ExecutiveOperatingSystemRuntimeError extends Error {
  constructor(readonly stage: ExecutiveOperatingSystemStageId, readonly category: ExecutiveOperatingSystemFailureCategory, readonly reasonCode: string, readonly inputArtifactIds: readonly string[], cause?: unknown) {
    super(`EOS ${category} failure at ${stage}: ${reasonCode}`, { cause }); this.name = "ExecutiveOperatingSystemRuntimeError"; Object.freeze(this.inputArtifactIds); Object.freeze(this);
  }
}
