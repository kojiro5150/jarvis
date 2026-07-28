import type { ProjectionArtifact } from "../situational-awareness/projection";
import type { SituationalAwareness } from "../situational-awareness/model";
import type { SituationalAwarenessSnapshot, SituationalAwarenessChangeSet } from "../situational-awareness/lifecycle";
import type { ExecutiveAttentionQueue } from "../attention";
import type { ExecutiveSituationSet } from "../situations";
import type { SituationAssessmentSet } from "../assessment";
import type { ExecutiveContext } from "../context";
import type { ConstraintConfiguration, ConstraintSet, IntentConfiguration, IntentSet } from "../intent";
import type { CandidatePlanDefinition, CandidatePlanSet } from "../planning/candidates";
import type { CandidatePlanEvaluationDefinition, EvaluatedCandidatePlanSet } from "../planning/evaluation";
import type { CandidatePlanComparisonDefinition, CandidatePlanComparisonSet } from "../planning/comparison";
import type { ExecutiveReasoningDefinition, ExecutiveReasoningRecord } from "../reasoning";
import type { GovernedActionProposalDefinition, GovernedActionProposalSet } from "../proposal";
import type { CapabilityRoutingInput, CapabilityRoutingPlan } from "../executive-capabilities";

export interface ProjectionArtifactSet {
  readonly artifacts: readonly ProjectionArtifact[];
  readonly previousSnapshot: SituationalAwarenessSnapshot;
  readonly snapshotId: string;
  readonly observedAt: string;
}
export interface ExecutiveOperatingSystemConfiguration {
  readonly intent: IntentConfiguration;
  readonly constraints: ConstraintConfiguration;
  readonly candidatePlanDefinitions: readonly CandidatePlanDefinition[];
  readonly evaluationDefinitions: readonly CandidatePlanEvaluationDefinition[];
  readonly comparisonDefinitions: readonly CandidatePlanComparisonDefinition[];
  readonly reasoningDefinitions: readonly ExecutiveReasoningDefinition[];
  readonly proposalDefinitions: readonly GovernedActionProposalDefinition[];
}
export interface ExecutiveOperatingSystemInput { readonly projectionArtifacts: ProjectionArtifactSet; readonly configuration: ExecutiveOperatingSystemConfiguration; readonly capabilityRouting?: CapabilityRoutingInput }
export const EXECUTIVE_OPERATING_SYSTEM_STAGE_ORDER = ["situational_awareness","snapshot_lifecycle","executive_attention","situation_formation","situation_assessment","executive_context","intent_and_constraints","candidate_plan_construction","candidate_plan_evaluation","candidate_plan_comparison","executive_reasoning","governed_action_proposal"] as const;
export type ExecutiveOperatingSystemStageId = typeof EXECUTIVE_OPERATING_SYSTEM_STAGE_ORDER[number];
export type ExecutiveOperatingSystemStageStatus = "completed" | "completed_empty";
export interface ExecutiveOperatingSystemStageTrace { readonly stageId: ExecutiveOperatingSystemStageId; readonly sequence: number; readonly inputArtifactIds: readonly string[]; readonly outputArtifactIds: readonly string[]; readonly status: ExecutiveOperatingSystemStageStatus; readonly validationStatus: "valid" }
export interface ExecutiveOperatingSystemExecutionTrace { readonly stages: readonly ExecutiveOperatingSystemStageTrace[] }
export interface ExecutiveOperatingSystemResult {
  readonly situationalAwareness: SituationalAwareness;
  readonly snapshot: SituationalAwarenessSnapshot;
  readonly changes: SituationalAwarenessChangeSet;
  readonly attention: ExecutiveAttentionQueue;
  readonly situations: ExecutiveSituationSet;
  readonly assessment: SituationAssessmentSet;
  readonly context: ExecutiveContext;
  readonly intent: IntentSet;
  readonly constraints: ConstraintSet;
  readonly candidatePlans: CandidatePlanSet;
  readonly evaluation: EvaluatedCandidatePlanSet;
  readonly comparison: CandidatePlanComparisonSet;
  readonly reasoning: ExecutiveReasoningRecord;
  readonly proposals: GovernedActionProposalSet;
  /** Additive governed invocation candidates only; no capability has executed. */
  readonly capabilityRoutingPlan?: CapabilityRoutingPlan;
  readonly trace: ExecutiveOperatingSystemExecutionTrace;
}
export type ExecutiveOperatingSystemFailureCategory = "validation" | "execution";
export class ExecutiveOperatingSystemRuntimeError extends Error {
  constructor(readonly stage: ExecutiveOperatingSystemStageId, readonly category: ExecutiveOperatingSystemFailureCategory, readonly reasonCode: string, readonly inputArtifactIds: readonly string[], cause?: unknown) {
    super(`EOS ${category} failure at ${stage}: ${reasonCode}`, { cause }); this.name = "ExecutiveOperatingSystemRuntimeError"; Object.freeze(this.inputArtifactIds); Object.freeze(this);
  }
}
