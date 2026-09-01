import {
  buildModelContinuityContext,
  MODEL_CONTINUITY_PURPOSE,
  type ModelContinuityContextBuildResult,
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

const MAX_MODEL_CONTINUITY_CHUNKS = 8;
const MAX_COMBINED_RENDERED_BYTES = 65_536;

type ReadyModelContinuityContextBuild = Extract<
  ModelContinuityContextBuildResult,
  { status: "ready" }
>;

type ModelContinuityContextPartitionResult =
  | Readonly<{ status: "ready"; chunks: readonly ReadyModelContinuityContextBuild[] }>
  | Readonly<{ status: "empty" }>
  | Readonly<{ status: "rejected"; diagnostic: ProductionModelContinuityUnavailableDiagnostic }>;

function projectedSlice(
  projection: Extract<DurablePurposeProjectionResult, { status: "projected" }>,
  items: Extract<DurablePurposeProjectionResult, { status: "projected" }>["items"],
): DurablePurposeProjectionResult {
  return Object.freeze({
    status: "projected",
    purpose: projection.purpose,
    items: Object.freeze([...items]),
    decisions: Object.freeze([]),
  });
}

function partitionModelContinuityContext(
  projection: DurablePurposeProjectionResult,
): ModelContinuityContextPartitionResult {
  if (projection.status !== "projected") {
    const partition = partitionModelContinuityContext(projection);

  if (partition.status === "empty") {
    return Object.freeze({
      handled: true,
      status: "not_relevant",
      reply: NO_RELEVANT_CONTINUITY_REPLY,
    });
  }

  if (partition.status === "rejected") {
    return Object.freeze({
      handled: true,
      status: "unavailable",
      reply: CONTINUITY_UNAVAILABLE_REPLY,
      diagnostic: partition.diagnostic,
    });
  }

  const createContinuityModelCall = input.dependencies?.createContinuityModelCall
    ?? createRequiredClaudeContinuityModelCall;
  const renderedLines: string[] = [];

  for (const contextBuild of partition.chunks) {
    const allowedContinuityIds = Object.freeze(
      contextBuild.context.items.map(item => item.continuityId),
    );
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
      continue;
    }

    if (rendered.status !== "rendered") {
      return Object.freeze({
        handled: true,
        status: "unavailable",
        reply: CONTINUITY_UNAVAILABLE_REPLY,
        diagnostic: renderDiagnostic(rendered.reason),
      });
    }

    const lines = rendered.text.split("\n");
    renderedLines.push(...lines.slice(1));
  }

  if (renderedLines.length === 0) {
    return Object.freeze({
      handled: true,
      status: "not_relevant",
      reply: NO_RELEVANT_CONTINUITY_REPLY,
    });
  }

  const reply = ["Relevant remembered context:", ...renderedLines].join("\n");
  if (Buffer.byteLength(reply, "utf8") > MAX_COMBINED_RENDERED_BYTES) {
    return Object.freeze({
      handled: true,
      status: "unavailable",
      reply: CONTINUITY_UNAVAILABLE_REPLY,
      diagnostic: "render_scope_exceeded",
    });
  }

  return Object.freeze({
    handled: true,
    status: "rendered",
    reply,
  });
}

export const MODEL_CONTINUITY_NO_RELEVANT_REPLY = NO_RELEVANT_CONTINUITY_REPLY;
export const MODEL_CONTINUITY_UNAVAILABLE_REPLY = CONTINUITY_UNAVAILABLE_REPLY;
