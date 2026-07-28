import type { ExecutiveDeliberationContext, ExecutiveDeliberationContextEngine, ExecutiveDeliberationContextInput } from "./types";
import { clone, compareText, createExecutiveDeliberationContext, deliberationContextIdentity, lifecycleComparisonIdentity, validateInput } from "./validation";

const sorted = (values: readonly string[]) => [...new Set(values)].sort(compareText);

export class DeterministicExecutiveDeliberationContextEngine implements ExecutiveDeliberationContextEngine {
  construct(raw: ExecutiveDeliberationContextInput): ExecutiveDeliberationContext {
    validateInput(raw);
    const input = clone(raw);
    const configuration = input.configuration ?? {};
    const assessments = [...input.assessmentSet.assessments].sort((a, b) => compareText(a.assessmentId, b.assessmentId));
    const concerns = assessments.map((assessment, index) => ({
      assessmentId: assessment.assessmentId,
      situationId: assessment.metadata.situationId,
      priority: index + 1,
      observationIds: sorted(assessment.observations.map(item => item.observationId)),
    }));
    const uncertainty = assessments.flatMap(assessment => assessment.observations
      .filter(observation => observation.observationType.toLowerCase().includes("uncertain") || JSON.stringify(observation.supportingEvidence).toLowerCase().includes("unknown"))
      .map(observation => ({ observationId: observation.observationId, evidence: observation.supportingEvidence })))
      .sort((a, b) => compareText(a.observationId, b.observationId));
    const constraints = sorted(configuration.reasoningConstraints ?? []);
    const assumptions = sorted(configuration.assumptions ?? []);
    const decisions = sorted(configuration.requiredDecisions ?? []);
    const lifecycleId = lifecycleComparisonIdentity(input);
    const stateId = input.executiveContextSnapshot.sourceStateIdentity.snapshotId;
    const executiveContextId = input.executiveContextSnapshot.contextId;
    const assessmentId = input.assessmentSet.situationSetId;
    const deliberationContextId = deliberationContextIdentity(stateId, executiveContextId, assessmentId, lifecycleId, { reasoningConstraints: constraints, assumptions, requiredDecisions: decisions });

    return createExecutiveDeliberationContext({
      deliberationContextId,
      // contextId is the established downstream lineage slot; it now carries the deliberation identity.
      contextId: deliberationContextId,
      snapshotId: input.assessmentSet.currentSnapshotId,
      assessmentSetId: assessmentId,
      sections: [], statistics: [],
      summary: { sectionCount: 0, statisticCount: 0, situationCount: 0, assessmentCount: 0, attentionRecordCount: 0, observationCount: 0 },
      canonicalProvenance: { snapshotId: input.assessmentSet.currentSnapshotId, assessmentSetId: assessmentId, situationSetId: assessmentId, policies: [] },
      executiveStateId: stateId,
      executiveContextId,
      situationAssessmentSetId: assessmentId,
      lifecycleComparisonId: lifecycleId,
      deliberativeScope: { situationIds: sorted(assessments.map(item => item.metadata.situationId)), observationBoundary: input.assessmentSet.currentSnapshotId },
      activeExecutiveConcerns: concerns,
      assessedPriorities: concerns.map(item => ({ assessmentId: item.assessmentId, priority: item.priority })),
      executiveReasoningConstraints: constraints,
      executiveAssumptions: assumptions,
      unresolvedUncertainty: uncertainty,
      requiredExecutiveDecisions: decisions,
      deliberativeMetadata: { contractVersion: "executive-deliberation-context-v1", engineVersion: "1.0.0", assessmentIds: assessments.map(item => item.assessmentId), policyVersion: "1.0.0" },
    });
  }
}
