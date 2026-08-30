import type { ChatMessage } from "../agents/types";
import {
  buildModelContinuityContext,
  MODEL_CONTINUITY_PURPOSE,
} from "./model-continuity-contract";
import {
  assessModelContinuityRelevance,
  type ModelContinuityAssessmentModelCall,
} from "./model-continuity-assessment";
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
}>;

export type ProductionModelContinuityRecallResult =
  | Readonly<{
      handled: false;
      status: "unsupported";
    }>
  | Readonly<{
      handled: true;
      status: "rendered" | "not_relevant" | "unavailable";
      reply: string;
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

function modelCallAdapter(
  callModel: (
    systemPrompt: string,
    messages: ChatMessage[],
  ) => ReturnType<ModelContinuityAssessmentModelCall>,
): ModelContinuityAssessmentModelCall {
  return async (systemPrompt, messages) => callModel(systemPrompt, messages);
}

export async function resolveProductionModelContinuityRecall(input: Readonly<{
  utterance: string;
  callModel: (
    systemPrompt: string,
    messages: ChatMessage[],
  ) => ReturnType<ModelContinuityAssessmentModelCall>;
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
    });
  }

  const reasoning = await assessModelContinuityRelevance({
    question: input.utterance,
    context: contextBuild.context,
    callModel: modelCallAdapter(input.callModel),
  });

  if (reasoning.status !== "assessed") {
    return Object.freeze({
      handled: true,
      status: "unavailable",
      reply: CONTINUITY_UNAVAILABLE_REPLY,
    });
  }

  const resolution = resolveModelContinuityAssessment({
    contextBuild,
    assessment: reasoning.assessment,
  });
  const presentation = projectModelContinuityPresentation(resolution);
  if (!presentation) {
    return Object.freeze({
      handled: true,
      status: "unavailable",
      reply: CONTINUITY_UNAVAILABLE_REPLY,
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
