import type { ExecutiveStateSnapshot, CanonicalEntityKind } from "../executive-operating-system/situational-awareness/assembly";
import { compareCodeUnits } from "./identity";
import type { CountMeasure, EntitySummary, ExecutiveContextMeasures, RelationshipGroup, SourceSummary } from "./types";

const entityCollections = [
  ["role", "roles"], ["project", "projects"], ["commitment", "commitments"],
  ["waiting_item", "waitingItems"], ["priority", "priorities"], ["active_work", "activeWork"],
] as const;
const temporalStatus = (timestamp: string | undefined, reference: number): "past" | "current" | "future" | undefined => timestamp === undefined ? undefined : Date.parse(timestamp) < reference ? "past" : Date.parse(timestamp) > reference ? "future" : "current";

export function deriveEntitySummary(source: ExecutiveStateSnapshot): EntitySummary {
  const countsByKind = Object.fromEntries(entityCollections.map(([kind, collection]) => [kind, source.state[collection].length])) as Record<CanonicalEntityKind, number>;
  const lifecycle: { kind: CanonicalEntityKind; lifecycle: string; count: number }[] = [];
  for (const [kind, collection] of entityCollections) {
    const counts = new Map<string, number>();
    for (const entity of source.state[collection]) if ("status" in entity) counts.set(entity.status, (counts.get(entity.status) ?? 0) + 1);
    for (const [status, count] of counts) lifecycle.push({ kind, lifecycle: status, count });
  }
  lifecycle.sort((a, b) => compareCodeUnits(`${a.kind}:${a.lifecycle}`, `${b.kind}:${b.lifecycle}`));
  return { countsByKind, countsByLifecycle: lifecycle };
}

export function deriveMeasures(source: ExecutiveStateSnapshot, referenceTime: string): { measures: ExecutiveContextMeasures; evidence: CountMeasure[] } {
  const times: (string | undefined)[] = [...source.state.commitments.map((x) => x.startsAt ?? x.dueAt), ...source.state.projects.map((x) => x.targetDate), ...source.state.waitingItems.map((x) => x.expectedBy), ...source.state.activeWork.map((x) => x.lastUpdatedAt ?? x.startedAt)];
  const groups = times.map((x) => temporalStatus(x, Date.parse(referenceTime)));
  const complete = source.artifacts.filter(({ artifact }) => artifact.provenance.sourceId && artifact.provenance.adapterId && artifact.provenance.projectedAt).length;
  const measures: ExecutiveContextMeasures = {
    totalArtifactCount: source.artifacts.length, commitmentCount: source.state.commitments.length,
    projectCount: source.state.projects.length, roleCount: source.state.roles.length,
    sourceCount: new Set(source.provenance.map((x) => x.sourceId)).size, conflictCount: source.conflicts.length,
    gapCount: source.gaps.length, unknownValueCount: source.gaps.filter((x) => x.type === "explicit_unknown").length,
    relationshipCount: source.relationships.length, pastItemCount: groups.filter((x) => x === "past").length,
    currentItemCount: groups.filter((x) => x === "current").length, futureItemCount: groups.filter((x) => x === "future").length,
    provenanceCoverage: source.artifacts.length === 0 ? 1 : complete / source.artifacts.length,
  };
  const identities: Record<string, readonly string[]> = { totalArtifactCount: source.artifacts.map((x) => x.artifactId), relationshipCount: source.relationships.map((x) => x.relationshipId), conflictCount: source.conflicts.map((x) => x.conflictId), gapCount: source.gaps.map((x) => x.gapId) };
  const evidence = Object.entries(measures).map(([measureId, value]) => ({ measureId, ruleId: `context.measure.${measureId}.v1`, value, inputIdentities: [...(identities[measureId] ?? [source.snapshotId])].sort(compareCodeUnits) })).sort((a, b) => compareCodeUnits(a.measureId, b.measureId));
  return { measures, evidence };
}

export function deriveRelationshipGroups(source: ExecutiveStateSnapshot): readonly RelationshipGroup[] {
  const map = new Map<string, typeof source.relationships[number][]>();
  for (const relationship of source.relationships) { const key = `${relationship.targetKind}:${relationship.targetId}`; map.set(key, [...(map.get(key) ?? []), relationship]); }
  return [...map.entries()].sort(([a], [b]) => compareCodeUnits(a, b)).map(([, values]) => ({ targetKind: values[0].targetKind, targetId: values[0].targetId, relationshipIds: values.map((x) => x.relationshipId).sort(compareCodeUnits), memberIds: [...new Set(values.map((x) => x.sourceId))].sort(compareCodeUnits) }));
}

export function deriveSourceContext(source: ExecutiveStateSnapshot): readonly SourceSummary[] {
  const map = new Map<string, { count: number; adapters: Set<string> }>();
  for (const { artifact } of source.artifacts) { const item = map.get(artifact.provenance.sourceId) ?? { count: 0, adapters: new Set<string>() }; item.count++; item.adapters.add(artifact.provenance.adapterId); map.set(artifact.provenance.sourceId, item); }
  return [...map].sort(([a], [b]) => compareCodeUnits(a, b)).map(([sourceId, x]) => ({ sourceId, artifactCount: x.count, adapterIds: [...x.adapters].sort(compareCodeUnits) }));
}
