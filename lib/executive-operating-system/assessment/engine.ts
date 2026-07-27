import type { ExecutiveSituationSet } from "../situations";
import { AssessmentRegistry } from "./registry";
import type { AssessmentEngine as EngineContract, SituationAssessment, SituationAssessmentObservation, SituationAssessmentSet } from "./types";
import { assessmentIdentity, clone, compareAssessment, compareObservation, compareText, createSituationAssessmentSet, observationIdentity, situationSetIdentity, validateObservation } from "./validation";

export class ExecutiveSituationAssessmentEngine implements EngineContract {
  constructor(private readonly registry: AssessmentRegistry) { if (!(registry instanceof AssessmentRegistry)) throw new Error("assessment registry is required"); }
  assess(situationSet: ExecutiveSituationSet): SituationAssessmentSet {
    if (!situationSet || typeof situationSet !== "object" || !Array.isArray(situationSet.situations)) throw new Error("executive situation set is required");
    const policies = this.registry.policies();
    const policySet = policies.map(policy => ({ id: policy.id, version: policy.version }));
    const assessments: SituationAssessment[] = situationSet.situations.map(situation => {
      const observations: SituationAssessmentObservation[] = [];
      for (const policy of policies) {
        const input = clone(situation);
        const applicable = policy.applies(input);
        if (typeof applicable !== "boolean") throw new Error(`assessment policy ${policy.id} returned invalid applicability`);
        if (!applicable) continue;
        const generated = policy.observe(clone(situation));
        if (!Array.isArray(generated) || generated.length === 0) throw new Error(`applicable assessment policy ${policy.id} returned no observations`);
        for (const raw of generated) {
          if (!raw || typeof raw !== "object") throw new Error(`assessment policy ${policy.id} returned an invalid observation`);
          const evidence = clone(raw.supportingEvidence);
          const attentionIds = [...raw.originatingAttentionRecordIds].sort(compareText);
          const observation: SituationAssessmentObservation = { observationId: observationIdentity(situation.situationId, policy.id, policy.observationType, attentionIds, evidence), policyId: policy.id, policyVersion: policy.version, observationType: policy.observationType, supportingEvidence: evidence, originatingAttentionRecordIds: attentionIds, originatingSituationId: situation.situationId };
          validateObservation(observation, situation);
          observations.push(observation);
        }
      }
      observations.sort(compareObservation);
      if (new Set(observations.map(o => o.observationId)).size !== observations.length) throw new Error(`duplicate observations for situation: ${situation.situationId}`);
      const metadata = { situationId: situation.situationId, currentSnapshotId: situation.currentSnapshotId, policySet: clone(policySet) };
      return { assessmentId: assessmentIdentity(situation.situationId, observations.map(o => o.observationId), policySet.map(p => p.id)), metadata, observations };
    });
    assessments.sort(compareAssessment);
    const observations = assessments.flatMap(a => a.observations); const byPolicy: Record<string, number> = {}; const byType: Record<string, number> = {};
    for (const observation of observations) { byPolicy[observation.policyId] = (byPolicy[observation.policyId] ?? 0) + 1; byType[observation.observationType] = (byType[observation.observationType] ?? 0) + 1; }
    const ordered = (value: Record<string, number>) => Object.fromEntries(Object.entries(value).sort(([a], [b]) => compareText(a, b)));
    return createSituationAssessmentSet({ currentSnapshotId: situationSet.currentSnapshotId, situationSetId: situationSetIdentity(situationSet.currentSnapshotId, situationSet.situations.map(s => s.situationId)), assessments, summary: { situations: situationSet.situations.length, assessments: assessments.length, observationCount: observations.length, observationsByPolicy: ordered(byPolicy), observationsByType: ordered(byType) } });
  }
}
