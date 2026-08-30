import {
  validateModelContinuityAssessment,
  type ModelContinuityAssessment,
  type ModelContinuityBinding,
  type ModelContinuityContext,
  type ModelContinuityContextBuildResult,
  type ModelContinuityContextItem,
  type ModelContinuityId,
} from "./model-continuity-contract";

export type ResolvedModelContinuityItem = Readonly<{
  continuityId: ModelContinuityId;
  recordId: string;
  versionId: string;
  semanticClass: ModelContinuityContextItem["semanticClass"];
  recoveryDisposition: ModelContinuityContextItem["recoveryDisposition"];
  value: ModelContinuityContextItem["value"];
}>;

export type ModelContinuityResolutionResult =
  | Readonly<{
      status: "resolved";
      items: readonly ResolvedModelContinuityItem[];
    }>
  | Readonly<{
      status: "not_relevant";
      items: readonly [];
    }>
  | Readonly<{
      status: "rejected";
      reason:
        | "context_not_ready"
        | "binding_integrity_failure"
        | "assessment_invalid";
    }>;

export type ModelContinuityPresentationItem = Readonly<{
  continuityType:
    | "remembered_user_continuity"
    | "prior_model_continuity";
  semanticClass: ModelContinuityContextItem["semanticClass"];
  value: ModelContinuityContextItem["value"];
}>;

export type ModelContinuityPresentation = Readonly<{
  responseType: "continuity_context";
  relevance: "relevant" | "not_relevant";
  items: readonly ModelContinuityPresentationItem[];
}>;

function bindingIntegrity(
  context: ModelContinuityContext,
  bindings: readonly ModelContinuityBinding[],
): boolean {
  if (context.items.length !== bindings.length) return false;

  const seenContinuityIds = new Set<string>();
  const seenDurableIdentities = new Set<string>();

  for (const [index, item] of context.items.entries()) {
    const binding = bindings[index];
    if (!binding) return false;

    if (
      item.continuityId !== binding.continuityId
      || seenContinuityIds.has(binding.continuityId)
      || binding.recordId.length === 0
      || binding.versionId.length === 0
    ) {
      return false;
    }

    const durableIdentity = `${binding.recordId}\u0000${binding.versionId}`;
    if (seenDurableIdentities.has(durableIdentity)) return false;

    seenContinuityIds.add(binding.continuityId);
    seenDurableIdentities.add(durableIdentity);
  }

  return true;
}

function resolvedItem(
  item: ModelContinuityContextItem,
  binding: ModelContinuityBinding,
): ResolvedModelContinuityItem {
  return Object.freeze({
    continuityId: item.continuityId,
    recordId: binding.recordId,
    versionId: binding.versionId,
    semanticClass: item.semanticClass,
    recoveryDisposition: item.recoveryDisposition,
    value: item.value,
  });
}

/**
 * Resolves a validated relevance assessment back to the exact server-side
 * bindings that were created alongside the already-admitted model context.
 *
 * This function performs no durable-store read and does not create fresh trust.
 */
export function resolveModelContinuityAssessment(input: Readonly<{
  contextBuild: ModelContinuityContextBuildResult;
  assessment: ModelContinuityAssessment;
}>): ModelContinuityResolutionResult {
  if (input.contextBuild.status !== "ready") {
    return Object.freeze({
      status: "rejected",
      reason: "context_not_ready",
    });
  }

  const { context, bindings } = input.contextBuild;

  if (!bindingIntegrity(context, bindings)) {
    return Object.freeze({
      status: "rejected",
      reason: "binding_integrity_failure",
    });
  }

  const allowedIds = Object.freeze(
    context.items.map(item => item.continuityId),
  );

  const validation = validateModelContinuityAssessment(
    input.assessment,
    allowedIds,
  );
  if (validation.status !== "valid") {
    return Object.freeze({
      status: "rejected",
      reason: "assessment_invalid",
    });
  }

  if (validation.assessment.relevance === "not_relevant") {
    return Object.freeze({
      status: "not_relevant",
      items: Object.freeze([]) as readonly [],
    });
  }

  const itemById = new Map(
    context.items.map(item => [item.continuityId, item] as const),
  );
  const bindingById = new Map(
    bindings.map(binding => [binding.continuityId, binding] as const),
  );

  const resolved: ResolvedModelContinuityItem[] = [];

  for (const continuityId of validation.assessment.relevantItemIds) {
    const item = itemById.get(continuityId);
    const binding = bindingById.get(continuityId);

    if (!item || !binding) {
      return Object.freeze({
        status: "rejected",
        reason: "binding_integrity_failure",
      });
    }

    resolved.push(resolvedItem(item, binding));
  }

  return Object.freeze({
    status: "resolved",
    items: Object.freeze(resolved),
  });
}

/**
 * Projects resolved continuity into a bounded displayable contract.
 *
 * Durable record/version identity is deliberately removed. The presentation
 * identifies whether the material is remembered user continuity or prior
 * model continuity; it never labels either as fact or evidence.
 */
export function projectModelContinuityPresentation(
  resolution: ModelContinuityResolutionResult,
): ModelContinuityPresentation | null {
  if (resolution.status === "rejected") return null;

  if (resolution.status === "not_relevant") {
    return Object.freeze({
      responseType: "continuity_context",
      relevance: "not_relevant",
      items: Object.freeze([]),
    });
  }

  const items = resolution.items.map(item => Object.freeze({
    continuityType: item.recoveryDisposition === "recoverable_user_continuity"
      ? "remembered_user_continuity" as const
      : "prior_model_continuity" as const,
    semanticClass: item.semanticClass,
    value: item.value,
  }));

  return Object.freeze({
    responseType: "continuity_context",
    relevance: "relevant",
    items: Object.freeze(items),
  });
}
