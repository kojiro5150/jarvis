import type {
  ModelContinuityPresentation,
  ModelContinuityPresentationItem,
} from "./model-continuity-presentation";

export type ModelContinuityRenderResult =
  | Readonly<{
      status: "rendered";
      text: string;
    }>
  | Readonly<{
      status: "not_relevant";
    }>
  | Readonly<{
      status: "rejected";
      reason:
        | "invalid_presentation"
        | "render_scope_exceeded";
    }>;

const MAX_RENDERED_BYTES = 16_384;

const USER_LABELS: Readonly<Record<ModelContinuityPresentationItem["semanticClass"], string>> =
  Object.freeze({
    user_assertion: "You previously stated",
    preference: "You previously stated a preference",
    plan: "You previously stated a plan",
    commitment: "You previously stated a commitment",
    decision: "You previously stated a decision",
    inference: "A prior model inference recorded",
    recommendation: "A prior model recommendation recorded",
    open_question: "A prior model open question recorded",
  });

function validItem(item: ModelContinuityPresentationItem): boolean {
  if (item.continuityType === "remembered_user_continuity") {
    return item.semanticClass === "user_assertion"
      || item.semanticClass === "preference"
      || item.semanticClass === "plan"
      || item.semanticClass === "commitment"
      || item.semanticClass === "decision";
  }

  if (item.continuityType === "prior_model_continuity") {
    return item.semanticClass === "inference"
      || item.semanticClass === "recommendation"
      || item.semanticClass === "open_question";
  }

  return false;
}

function deterministicValue(value: ModelContinuityPresentationItem["value"]): string | null {
  try {
    const serialized = JSON.stringify(value);
    if (typeof serialized !== "string") return null;
    return serialized;
  } catch {
    return null;
  }
}

/**
 * Renders bounded continuity without any model-authored presentation prose.
 *
 * Wording is fixed by semantic class and continuity origin. The renderer never
 * labels remembered continuity as fact, evidence, authority, or fresh source
 * truth and never performs inference over the value.
 */
export function renderModelContinuityPresentation(
  presentation: ModelContinuityPresentation,
): ModelContinuityRenderResult {
  if (
    presentation.responseType !== "continuity_context"
    || (presentation.relevance !== "relevant"
      && presentation.relevance !== "not_relevant")
  ) {
    return Object.freeze({
      status: "rejected",
      reason: "invalid_presentation",
    });
  }

  if (presentation.relevance === "not_relevant") {
    if (presentation.items.length !== 0) {
      return Object.freeze({
        status: "rejected",
        reason: "invalid_presentation",
      });
    }
    return Object.freeze({ status: "not_relevant" });
  }

  if (presentation.items.length === 0) {
    return Object.freeze({
      status: "rejected",
      reason: "invalid_presentation",
    });
  }

  const lines = ["Relevant remembered context:"];

  for (const item of presentation.items) {
    if (!validItem(item)) {
      return Object.freeze({
        status: "rejected",
        reason: "invalid_presentation",
      });
    }

    const value = deterministicValue(item.value);
    if (value === null) {
      return Object.freeze({
        status: "rejected",
        reason: "invalid_presentation",
      });
    }

    lines.push(`- ${USER_LABELS[item.semanticClass]}: ${value}`);
  }

  const text = lines.join("\n");

  if (Buffer.byteLength(text, "utf8") > MAX_RENDERED_BYTES) {
    return Object.freeze({
      status: "rejected",
      reason: "render_scope_exceeded",
    });
  }

  return Object.freeze({
    status: "rendered",
    text,
  });
}
