import {
  buildModelContinuityContext,
  MODEL_CONTINUITY_PURPOSE,
} from "./model-continuity-contract";
import { assessModelContinuityRelevance, type ModelContinuityAssessmentModelCall } from "./model-continuity-assessment";
import { createRequiredClaudeContinuityModelCall } from "./claude-continuity-relevance";
import {
  projectModelContinuityPresentation,
  resolveModelContinuityAssessment,
} from "./model-continuity-presentation";
import { renderModelContinuityPresentation } from "./model-continuity-rendering";
import { retrieveDurableOperatingPictureForPurpose } from "./purpose-projection-retrieval";
import {
  createSupabaseOperatingPicturePersistence,
  loadSupabaseOperatingPictureConfig,
} from "./supabase-persistence";
import type { DurablePurposeProjectionResult } from "./purpose-projection-retrieval";

export type ProductionModelContinuityDependencies = Readonly<{
  retrieveProjection?: () => Promise<DurablePurposeProjectionResult>;
  createContinuityModelCall?: (
    allowedContinuityIds: readonly import("./model-continuity-contract").ModelContinuityId[],
  ) => ModelContinuityAssessmentModelCall;
}>;

export type ProductionModelContinuityUnavailableDiagnostic =
  | "projection_exception"
  | "context_projection_not_available"
  | "context_wrong_purpose"
  | "context_projection_integrity_failure"
  | "context_scope_exceeded"
  | "assessment_invalid_input"
  | "assessment_model_invalid"
  | "assessment_model_failed"
  | "resolution_context_not_ready"
  | "resolution_binding_integrity_failure"
  | "resolution_assessment_invalid"
  | "render_invalid_presentation"
  | "render_scope_exceeded";

export type ProductionModelContinuityRecallResult =
  | Readonly<{
      handled: false;
      status: "unsupported";
    }>
  | Readonly<{
      handled: true;
      status: "rendered" | "not_relevant";
      reply: string;
    }>
  | Readonly<{
      handled: true;
      status: "unavailable";
      reply: string;
      diagnostic: ProductionModelContinuityUnavailableDiagnostic;
    }>;

const NO_RELEVANT_CONTINUITY_REPLY =
  "I don't have relevant durable continuity for that request.";

const CONTINUITY_UNAVAILABLE_REPLY =
  "I can't safely retrieve durable continuity for that request right now.";

const RECALL_PATTERNS = [
  /^what do you remember about\s+(.+)$/i,
  /^what have i told you about\s+(.+)$/i,
  /^show me what you remember about\s+(.+)$/i,
  /^do you remember what i said about\s+(.+)$/i,
] as const;

function contextDiagnostic(
  reason: Extract<ReturnType<typeof buildModelContinuityContext>, { status: "rejected" }>["reason"],
): ProductionModelContinuityUnavailableDiagnostic {
  switch (reason) {
    case "projection_not_available": return "context_projection_not_available";
    case "wrong_purpose": return "context_wrong_purpose";
    case "projection_integrity_failure": return "context_projection_integrity_failure";
    case "context_scope_exceeded": return "context_scope_exceeded";
  }
}

function assessmentDiagnostic(
  status: Exclude<Awaited<ReturnType<typeof assessModelContinuityRelevance>>["status"], "assessed">,
): ProductionModelContinuityUnavailableDiagnostic {
  switch (status) {
    case "invalid_input": return "assessment_invalid_input";
    case "model_invalid": return "assessment_model_invalid";
    case "model_failed": return "assessment_model_failed";
  }
}

function resolutionDiagnostic(
  reason: Extract<ReturnType<typeof resolveModelContinuityAssessment>, { status: "rejected" }>["reason"],
): ProductionModelContinuityUnavailableDiagnostic {
  switch (reason) {
    case "context_not_ready": return "resolution_context_not_ready";
    case "binding_integrity_failure": return "resolution_binding_integrity_failure";
    case "assessment_invalid": return "resolution_assessment_invalid";
  }
}

function renderDiagnostic(
  reason: Extract<ReturnType<typeof renderModelContinuityPresentation>, { status: "rejected" }>["reason"],
): ProductionModelContinuityUnavailableDiagnostic {
  switch (reason) {
    case "invalid_presentation": return "render_invalid_presentation";
    case "render_scope_exceeded": return "render_scope_exceeded";
  }
}

function normalizedRecallUtterance(value: string): string {
  return value
    .normalize("NFKC")
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function isDurableContinuityRecallRequest(utterance: string): boolean {
  const normalized = normalizedRecallUtterance(utterance);
  return RECALL_PATTERNS.some(pattern => {
    const match = normalized.match(pattern);
    return typeof match?.[1] === "string" && match[1].trim().length > 0;
  });
}

async function defaultProjection(): Promise<DurablePurposeProjectionResult> {
  const config = loadSupabaseOperatingPictureConfig();
  if (!config) {
    return Object.freeze({
      status: "rejected",
      purpose: MODEL_CONTINUITY_PURPOSE,
      reason: "persistence_unavailable",
    });
  }

  const { durableStore } = createSupabaseOperatingPicturePersistence(config);
  return retrieveDurableOperatingPictureForPurpose(
    durableStore,
    MODEL_CONTINUITY_PURPOSE,
  );
}

export async function resolveProductionModelContinuityRecall(input: Readonly<{
  utterance: string;
  dependencies?: ProductionModelContinuityDependencies;
}>): Promise<ProductionModelContinuityRecallResult> {
  if (!isDurableContinuityRecallRequest(input.utterance)) {
    return Object.freeze({
      handled: false,
      status: "unsupported",
    });
  }

  let projection: DurablePurposeProjectionResult;
  try {
    projection = await (input.dependencies?.retrieveProjection ?? defaultProjection)();
  } catch {
    return Object.freeze({
      handled: true,
      status: "unavailable",
      reply: CONTINUITY_UNAVAILABLE_REPLY,
      diagnostic: "projection_exception",
    });
  }

  const contextBuild = buildModelContinuityContext(projection);

  if (contextBuild.status === "empty") {
    return Object.freeze({
      handled: true,
      status: "not_relevant",
      reply: NO_RELEVANT_CONTINUITY_REPLY,
    });
  }

  if (contextBuild.status !== "ready") {
    return Object.freeze({
      handled: true,
      status: "unavailable",
      reply: CONTINUITY_UNAVAILABLE_REPLY,
      diagnostic: contextDiagnostic(contextBuild.reason),
    });
  }

  const allowedContinuityIds = Object.freeze(
    contextBuild.context.items.map(item => item.continuityId),
  );
  const createContinuityModelCall = input.dependencies?.createContinuityModelCall
    ?? createRequiredClaudeContinuityModelCall;
  const reasoning = await assessModelContinuityRelevance({
    question: input.utterance,
    context: contextBuild.context,
    callModel: createContinuityModelCall(allowedContinuityIds),
  });

  if (reasoning.status !== "assessed") {
    return Object.freeze({
      handled: true,
      status: "unavailable",
      reply: CONTINUITY_UNAVAILABLE_REPLY,
      diagnostic: assessmentDiagnostic(reasoning.status),
    });
  }

  const resolution = resolveModelContinuityAssessment({
    contextBuild,
    assessment: reasoning.assessment,
  });
  if (resolution.status === "rejected") {
    return Object.freeze({
      handled: true,
      status: "unavailable",
      reply: CONTINUITY_UNAVAILABLE_REPLY,
      diagnostic: resolutionDiagnostic(resolution.reason),
    });
  }
  const presentation = projectModelContinuityPresentation(resolution);
  if (!presentation) {
    return Object.freeze({
      handled: true,
      status: "unavailable",
      reply: CONTINUITY_UNAVAILABLE_REPLY,
      diagnostic: "resolution_context_not_ready",
    });
  }

  const rendered = renderModelContinuityPresentation(presentation);

  if (rendered.status === "not_relevant") {
    return Object.freeze({
      handled: true,
      status: "not_relevant",
      reply: NO_RELEVANT_CONTINUITY_REPLY,
    });
  }

  if (rendered.status !== "rendered") {
    return Object.freeze({
      handled: true,
      status: "unavailable",
      reply: CONTINUITY_UNAVAILABLE_REPLY,
      diagnostic: renderDiagnostic(rendered.reason),
    });
  }

  return Object.freeze({
    handled: true,
    status: "rendered",
    reply: rendered.text,
  });
}

export const MODEL_CONTINUITY_NO_RELEVANT_REPLY = NO_RELEVANT_CONTINUITY_REPLY;
export const MODEL_CONTINUITY_UNAVAILABLE_REPLY = CONTINUITY_UNAVAILABLE_REPLY;
