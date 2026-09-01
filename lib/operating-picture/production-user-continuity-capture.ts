import {
  buildUserContinuityCaptureCandidate,
  parseExplicitUserContinuityCaptureRequest,
  validateUserContinuityCaptureClassification,
  type ExplicitUserContinuityCaptureRequest,
  type UserContinuityCaptureCandidate,
  type UserContinuityCaptureClass,
} from "./user-continuity-capture-contract";
import {
  classifyExplicitUserContinuityCapture,
  type UserContinuityCaptureClassificationResult,
} from "./user-continuity-capture-classification";
import {
  createRequiredClaudeUserContinuityCaptureClassificationCall,
} from "./claude-user-continuity-capture-classification";
import {
  persistUserContinuityCaptureCandidateToSupabase,
  type UserContinuityCapturePersistenceResult,
} from "./user-continuity-capture-persistence";
import {
  consumeUserContinuityCaptureClarificationReference,
  createUserContinuityCaptureClarificationReference,
  parseUserContinuityCaptureClassClarification,
  type UserContinuityCaptureClarificationReference,
} from "./user-continuity-capture-clarification-reference";

export type ProductionUserContinuityCaptureDependencies = Readonly<{
  clock: () => Date;
  classify: (
    request: ExplicitUserContinuityCaptureRequest,
  ) => Promise<UserContinuityCaptureClassificationResult>;
  persist: (
    candidate: UserContinuityCaptureCandidate,
  ) => Promise<UserContinuityCapturePersistenceResult>;
}>;

export type ProductionUserContinuityCaptureResult = Readonly<{
  handled: boolean;
  status?:
    | "persisted"
    | "clarification_required"
    | "clarification_unrecognised"
    | "classification_unavailable"
    | "persistence_unavailable";
  reply?: string;
  clarificationReference?: UserContinuityCaptureClarificationReference | null;
}>;

const defaults: ProductionUserContinuityCaptureDependencies = Object.freeze({
  clock: () => new Date(),
  classify: (request: ExplicitUserContinuityCaptureRequest) =>
    classifyExplicitUserContinuityCapture({
      request,
      callModel: createRequiredClaudeUserContinuityCaptureClassificationCall(),
    }),
  persist: persistUserContinuityCaptureCandidateToSupabase,
});

const CLARIFICATION_REPLY =
  "I can remember that, but I need the semantic class before I save it. Reply with exactly one of: user assertion, preference, plan, commitment, or decision.";

function classifiedResult(semanticClass: UserContinuityCaptureClass) {
  return validateUserContinuityCaptureClassification({
    responseType: "user_continuity_capture_classification",
    status: "classified",
    semanticClass,
  });
}

async function persistCandidate(
  request: ExplicitUserContinuityCaptureRequest,
  semanticClass: UserContinuityCaptureClass,
  statedAt: string,
  dependencies: ProductionUserContinuityCaptureDependencies,
): Promise<ProductionUserContinuityCaptureResult> {
  const candidate = buildUserContinuityCaptureCandidate(
    request,
    classifiedResult(semanticClass),
    statedAt,
  );
  if (candidate.status !== "ready") {
    return Object.freeze({
      handled: true,
      status: "classification_unavailable",
      reply: "I couldn't safely classify that memory, so I didn't save it.",
      clarificationReference: null,
    });
  }

  const persisted = await dependencies.persist(candidate.candidate);
  if (persisted.status !== "persisted") {
    return Object.freeze({
      handled: true,
      status: "persistence_unavailable",
      reply: "I couldn't safely save that.",
      clarificationReference: null,
    });
  }

  return Object.freeze({
    handled: true,
    status: "persisted",
    reply: "Remembered.",
    clarificationReference: null,
  });
}

export async function resolveProductionUserContinuityCapture(input: Readonly<{
  utterance: string;
  clarificationReference?: unknown;
  dependencies?: Partial<ProductionUserContinuityCaptureDependencies>;
}>): Promise<ProductionUserContinuityCaptureResult> {
  const dependencies: ProductionUserContinuityCaptureDependencies = Object.freeze({
    clock: input.dependencies?.clock ?? defaults.clock,
    classify: input.dependencies?.classify ?? defaults.classify,
    persist: input.dependencies?.persist ?? defaults.persist,
  });

  const parsed = parseExplicitUserContinuityCaptureRequest(input.utterance);
  if (parsed.status === "matched") {
    const statedAt = dependencies.clock().toISOString();
    const classification = await dependencies.classify(parsed.request);

    if (
      classification.status !== "classified"
      || classification.classification.status === "ambiguous"
    ) {
      if (
        classification.status === "classified"
        && classification.classification.status === "ambiguous"
      ) {
        const reference = createUserContinuityCaptureClarificationReference({
          request: parsed.request,
          statedAt,
          now: dependencies.clock(),
        });
        if (reference) {
          return Object.freeze({
            handled: true,
            status: "clarification_required",
            reply: CLARIFICATION_REPLY,
            clarificationReference: reference,
          });
        }
      }

      return Object.freeze({
        handled: true,
        status: "classification_unavailable",
        reply: "I couldn't safely classify that memory, so I didn't save it.",
        clarificationReference: null,
      });
    }

    return persistCandidate(
      parsed.request,
      classification.classification.semanticClass,
      statedAt,
      dependencies,
    );
  }

  if (input.clarificationReference !== undefined) {
    const pending = consumeUserContinuityCaptureClarificationReference({
      reference: input.clarificationReference,
      now: dependencies.clock(),
    });
    if (pending) {
      const semanticClass = parseUserContinuityCaptureClassClarification(input.utterance);
      if (semanticClass) {
        return persistCandidate(
          pending.request,
          semanticClass,
          pending.statedAt,
          dependencies,
        );
      }

      return Object.freeze({
        handled: true,
        status: "clarification_unrecognised",
        reply: "I didn't recognise that as one of the five options, so I didn't save what you asked me to remember.",
        clarificationReference: null,
      });
    }
  }

  return Object.freeze({ handled: false });
}

export const USER_CONTINUITY_CAPTURE_CLARIFICATION_REPLY = CLARIFICATION_REPLY;
