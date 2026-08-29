import type { ChatMessage } from "../agents/types";
import {
  validateConversationalIntentCandidate,
  type ConversationalIntentCandidate,
} from "./conversational-intent";

export type ConversationalCapabilitySelectorModelCall = (
  systemPrompt: string,
  messages: ChatMessage[],
) => Promise<string | Readonly<{ text: string }>>;

const SELECTOR_PROMPT = [
  "You are a bounded conversational capability selector.",
  "You receive only the user's current utterance. You receive no private data, no conversation history, no authority state, and no connector results.",
  "Return JSON only.",
  'Allowed kinds: "capability_request", "ordinary_conversation", or "unsupported".',
  'Allowed capabilities: "calendar", "gmail", "drive", "public_information".',
  'Allowed operations: calendar/read; gmail/search or read; drive/search or read; public_information/lookup.',
  "Use public_information for public factual information such as weather.",
  "Use calendar, gmail, or drive only when the user's wording clearly asks for that private source or a task that obviously belongs to it.",
  "subjectTerms, if supplied, must be literal single tokens present in the user utterance. Do not invent synonyms, names, provider IDs, resource IDs, authority, facts, or results.",
  "This selection is not authorization and must never answer the user's question.",
].join("\n");

const PUBLIC_INFORMATION_SIGNAL = /\b(?:weather|rain|forecast|temperature|ssrn)\b/i;
const GMAIL_SIGNAL = /\b(?:gmail|gmails|email|emails|inbox)\b/i;
const GMAIL_REQUEST_FORM = /(?:\b(?:show|check|get|search|find|list|read|open|summari[sz]e)\b|^\s*(?:what|which|who|where|when|how)\b)/i;
const DRIVE_SIGNAL = /\bdrive\b/i;

export type DeterministicCapabilityConstraint = Readonly<{
  capability: "public_information" | "gmail" | "drive";
  fallbackOperation: "lookup" | "search" | "read";
}>;

export function deterministicCapabilityConstraint(utterance: string): DeterministicCapabilityConstraint | null {
  const normalized = utterance.normalize("NFKC");
  if (PUBLIC_INFORMATION_SIGNAL.test(normalized)) {
    return Object.freeze({ capability: "public_information", fallbackOperation: "lookup" });
  }
  if (GMAIL_SIGNAL.test(normalized) && GMAIL_REQUEST_FORM.test(normalized)) {
    const readLike = /\b(?:read|open|summari[sz]e)\b/i.test(normalized);
    return Object.freeze({ capability: "gmail", fallbackOperation: readLike ? "read" : "search" });
  }
  if (DRIVE_SIGNAL.test(normalized)) {
    const searchLike = /\b(?:search|find|look for)\b/i.test(normalized);
    return Object.freeze({ capability: "drive", fallbackOperation: searchLike ? "search" : "read" });
  }
  return null;
}

export function isConversationalCapabilitySelectionCandidate(utterance: string): boolean {
  return deterministicCapabilityConstraint(utterance) !== null;
}

function parseModelJson(text: string): unknown {
  const trimmed = text.trim().replace(/^\`\`\`(?:json)?\s*/i, "").replace(/\s*\`\`\`$/, "");
  try { return JSON.parse(trimmed); }
  catch { return null; }
}

function normalizeTokenSet(utterance: string): ReadonlySet<string> {
  return new Set(utterance.normalize("NFKC").toLowerCase().replace(/[^a-z0-9_-]+/g, " ").trim().split(/\s+/).filter(Boolean));
}

export function validateSelectedConversationalIntent(
  utterance: string,
  raw: unknown,
): ConversationalIntentCandidate | null {
  const candidate = validateConversationalIntentCandidate(raw);
  if (!candidate) return null;
  if (candidate.kind !== "capability_request") return candidate;

  // A private-source noun alone must never become an operation. The untouched
  // current utterance must itself contain a request/question form.
  if (candidate.capability === "gmail"
    && GMAIL_SIGNAL.test(utterance)
    && !GMAIL_REQUEST_FORM.test(utterance)) return null;

  if (!candidate.subjectTerms) return candidate;
  const allowed = normalizeTokenSet(utterance);
  return candidate.subjectTerms.every(term => allowed.has(term)) ? candidate : null;
}

export async function selectConversationalCapability(input: {
  readonly utterance: string;
  readonly callModel: ConversationalCapabilitySelectorModelCall;
}): Promise<ConversationalIntentCandidate | null> {
  const constraint = deterministicCapabilityConstraint(input.utterance);
  const result = await input.callModel(SELECTOR_PROMPT, [
    { role: "user", content: input.utterance },
  ]);
  const text = typeof result === "string" ? result : result.text;
  const selected = validateSelectedConversationalIntent(input.utterance, parseModelJson(text));

  if (!constraint) return selected;
  if (selected?.kind === "capability_request" && selected.capability === constraint.capability) {
    return selected;
  }

  return Object.freeze({
    kind: "capability_request",
    capability: constraint.capability,
    operation: constraint.fallbackOperation,
  });
}

export const CONVERSATIONAL_CAPABILITY_SELECTOR_PROMPT = SELECTOR_PROMPT;
