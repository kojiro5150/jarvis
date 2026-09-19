import { createHash } from "node:crypto";

import {
  AttentionPolicyRegistry,
  INITIAL_ATTENTION_POLICIES,
  constructExecutiveAttentionQueue,
} from "../attention";
import {
  ExecutiveSituationAssessmentEngine,
  INITIAL_SITUATION_ASSESSMENT_POLICIES,
  SituationAssessmentRegistry,
} from "../assessment";
import {
  ExecutiveContextEngine,
  ExecutiveContextRegistry,
  INITIAL_CONTEXT_POLICIES,
} from "../context";
import {
  ExecutiveSituationEngine,
  INITIAL_SITUATION_FORMATION_POLICIES,
  SituationFormationRegistry,
} from "../situations";
import { compareSituationalAwarenessSnapshots } from "../situational-awareness/lifecycle";
import type { SituationalAwarenessChanges } from "../situational-awareness/lifecycle/types";
import {
  ORIENTATION_CHANGE_DOMAINS,
  type ExecutiveOrientation,
  type ExecutiveOrientationInput,
  type OrientationCommunicationDependency,
  type OrientationDomainChangeSummary,
} from "./types";

const compareText = (left: string, right: string): number =>
  left < right ? -1 : left > right ? 1 : 0;

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value as object)
      .sort(compareText)
      .map(key => `${JSON.stringify(key)}:${canonical((value as Record<string, unknown>)[key])}`)
      .join(",")}}`;
  }
  const encoded = JSON.stringify(value);
  if (encoded === undefined) throw new Error("orientation value is not JSON-compatible");
  return encoded;
}

function deepFreeze<T>(value: T, seen = new WeakSet<object>()): Readonly<T> {
  if (!value || typeof value !== "object" || seen.has(value as object)) return value;
  seen.add(value as object);
  Object.values(value as object).forEach(child => deepFreeze(child, seen));
  return Object.freeze(value);
}

function orientationIdentity(input: unknown): string {
  return `executive-orientation:${createHash("sha256")
    .update(canonical(input), "utf8")
    .digest("hex")}`;
}

function domainChanges(
  changes: SituationalAwarenessChanges,
  domain: typeof ORIENTATION_CHANGE_DOMAINS[number],
): readonly { readonly type: "added" | "modified" | "removed" }[] {
  const value = changes[domain];
  if (domain === "identity" || domain === "context") {
    return value ? [value as { readonly type: "added" | "modified" | "removed" }] : [];
  }
  return value as readonly { readonly type: "added" | "modified" | "removed" }[];
}

function summarizeChanges(changes: SituationalAwarenessChanges): readonly OrientationDomainChangeSummary[] {
  return ORIENTATION_CHANGE_DOMAINS.map(domain => {
    const items = domainChanges(changes, domain);
    const added = items.filter(item => item.type === "added").length;
    const modified = items.filter(item => item.type === "modified").length;
    const removed = items.filter(item => item.type === "removed").length;
    return Object.freeze({
      domain,
      added,
      modified,
      removed,
      totalChanged: added + modified + removed,
    });
  });
}

function explicitCommunicationDependencies(
  input: ExecutiveOrientationInput,
): readonly OrientationCommunicationDependency[] {
  const dependencies: OrientationCommunicationDependency[] = [];
  for (const communication of input.currentSnapshot.state.communications) {
    if (communication.inReplyTo) {
      dependencies.push({
        sourceCommunicationId: communication.id,
        relation: "in_reply_to",
        targetProtocolMessageId: communication.inReplyTo,
      });
    }
    for (const reference of communication.references) {
      dependencies.push({
        sourceCommunicationId: communication.id,
        relation: "references",
        targetProtocolMessageId: reference,
      });
    }
  }
  dependencies.sort((left, right) =>
    compareText(left.sourceCommunicationId, right.sourceCommunicationId)
    || compareText(left.relation, right.relation)
    || compareText(left.targetProtocolMessageId, right.targetProtocolMessageId));
  return dependencies;
}

/**
 * Deterministically constructs executive orientation from two already-governed
 * canonical snapshots.
 *
 * This engine does not acquire private evidence, call a model, infer urgency,
 * rank attention, create authority, or propose action. A change enters the
 * "warrants attention" publication only when an existing registered Attention
 * Policy matches the canonical lifecycle change.
 */
export function constructDeterministicExecutiveOrientation(
  input: ExecutiveOrientationInput,
): ExecutiveOrientation {
  const changes = compareSituationalAwarenessSnapshots(
    input.previousSnapshot,
    input.currentSnapshot,
  );
  const attention = constructExecutiveAttentionQueue(
    changes,
    new AttentionPolicyRegistry(INITIAL_ATTENTION_POLICIES),
  );
  const situations = new ExecutiveSituationEngine(
    new SituationFormationRegistry(INITIAL_SITUATION_FORMATION_POLICIES),
  ).form(attention);
  const assessment = new ExecutiveSituationAssessmentEngine(
    new SituationAssessmentRegistry(INITIAL_SITUATION_ASSESSMENT_POLICIES),
  ).assess(situations);
  const context = new ExecutiveContextEngine(
    new ExecutiveContextRegistry(INITIAL_CONTEXT_POLICIES),
  ).construct(assessment);

  const changeSummary = summarizeChanges(changes.changes);
  const attentionItems = attention.records.map(record => Object.freeze({
    attentionId: record.attentionId,
    domain: record.domain,
    changeType: record.changeType,
    ...(record.entityId ? { entityId: record.entityId } : {}),
    policyId: record.policy.id,
    policyVersion: record.policy.version,
    reasonCode: record.reason.code,
    reasonMessage: record.reason.message,
    evidence: Object.freeze(record.reason.evidence.map(item => Object.freeze({ ...item }))),
  }));
  const communicationDependencies = explicitCommunicationDependencies(input);
  const sources = input.currentSnapshot.state.sources
    .map(source => Object.freeze({
      sourceId: source.id,
      kind: source.kind,
      status: source.status,
      ...(source.observedAt ? { observedAt: source.observedAt } : {}),
    }))
    .sort((left, right) => compareText(left.sourceId, right.sourceId));

  const communicationChanges = changeSummary
    .find(item => item.domain === "communications")?.totalChanged ?? 0;
  const summary = Object.freeze({
    totalChanged: changes.summary.totalChanged,
    changedDomains: changeSummary.filter(item => item.totalChanged > 0).length,
    communicationChanges,
    attentionRecords: attention.records.length,
    situations: situations.situations.length,
    observations: assessment.summary.observationCount,
    explicitCommunicationDependencies: communicationDependencies.length,
  });

  const identitySeed = {
    previousSnapshotId: changes.previousSnapshotId,
    currentSnapshotId: changes.currentSnapshotId,
    attentionIds: attentionItems.map(item => item.attentionId),
    situationIds: situations.situations.map(item => item.situationId),
    observationIds: assessment.assessments.flatMap(item =>
      item.observations.map(observation => observation.observationId)),
    communicationDependencies,
    summary,
  };

  return deepFreeze({
    orientationId: orientationIdentity(identitySeed),
    previousSnapshotId: changes.previousSnapshotId,
    currentSnapshotId: changes.currentSnapshotId,
    currentObservedAt: changes.currentObservedAt,
    changes,
    changeSummary,
    attention,
    attentionItems,
    situations,
    assessment,
    context,
    communicationDependencies,
    sources,
    summary,
  }) as ExecutiveOrientation;
}
