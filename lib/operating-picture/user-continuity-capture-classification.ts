import type { ChatMessage } from "../agents/types";
import {
  validateUserContinuityCaptureClassification,
  type ExplicitUserContinuityCaptureRequest,
  type UserContinuityCaptureClassification,
} from "./user-continuity-capture-contract";

export type UserContinuityCaptureClassificationModelCall = (
  systemPrompt: string,
  messages: ChatMessage[],
) => Promise<string | Readonly<{ text: string }>>;

export type UserContinuityCaptureClassificationResult =
  | Readonly<{
      status: "classified";
      classification: UserContinuityCaptureClassification;
    }>
  | Readonly<{
      status: "invalid_input";
    }>
  | Readonly<{
      status: "model_invalid";
    }>
  | Readonly<{
      status: "model_failed";
    }>;

const MAX_CAPTURE_STATEMENT_BYTES = 8_192;

const PROMPT = [
  "You are a bounded semantic classifier for an explicit user-authored continuity capture request.",
  "The user has already explicitly authorised capture through a deterministic remember/retain command boundary. You do not decide whether capture is authorised.",
  "The supplied statement is user-authored text. Do not rewrite, paraphrase, summarize, complete, correct, or restate it.",
  "Your only task is to classify the statement as exactly one of: user_assertion, preference, plan, commitment, decision; or return ambiguous when exactly one class cannot be established safely.",
  "Do not infer fact status, evidence, provenance, authority, verification, completion, or source truth.",
  "When wording could reasonably fit more than one class, return ambiguous rather than choosing the nearest class.",
  "Return only the closed classification contract. Do not add rationale, confidence, explanation, or prose.",
].join("\n");

function validRequest(request: ExplicitUserContinuityCaptureRequest): boolean {
  return request.intent === "explicit_user_continuity_capture"
    && request.statement.trim().length > 0
    && Buffer.byteLength(request.statement, "utf8") <= MAX_CAPTURE_STATEMENT_BYTES;
}

export async function classifyExplicitUserContinuityCapture(input: Readonly<{
  request: ExplicitUserContinuityCaptureRequest;
  callModel: UserContinuityCaptureClassificationModelCall;
}>): Promise<UserContinuityCaptureClassificationResult> {
  if (!validRequest(input.request)) {
    return Object.freeze({ status: "invalid_input" });
  }

  const message: ChatMessage = Object.freeze({
    role: "user",
    content: JSON.stringify({
      statement: input.request.statement,
    }),
  });

  try {
    const raw = await input.callModel(PROMPT, [message]);
    const text = typeof raw === "string" ? raw : raw.text;

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      return Object.freeze({ status: "model_invalid" });
    }

    const validation = validateUserContinuityCaptureClassification(parsed);
    if (validation.status !== "valid") {
      return Object.freeze({ status: "model_invalid" });
    }

    return Object.freeze({
      status: "classified",
      classification: validation.classification,
    });
  } catch {
    return Object.freeze({ status: "model_failed" });
  }
}

export const USER_CONTINUITY_CAPTURE_CLASSIFICATION_PROMPT = PROMPT;
