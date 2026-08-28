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

const PUBLIC_INFORMATION_SIGNAL = /\b(?:weather|rain|forecast|temperature)\b/i;
const GMAIL_SIGNAL = /\b(?:gmail|email|emails|inbox)\b/i;
const DRIVE_SIGNAL = /\bdrive\b/i;

export function isConversationalCapabilitySelectionCandidate(utterance: string): boolean {
  const normalized = utterance.normalize("NFKC");
  return PUBLIC_INFORMATION_SIGNAL.test(normalized)
    || GMAIL_SIGNAL.test(normalized)
    || DRIVE_SIGNAL.test(normalized);
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
  if (candidate.kind !== "capability_request" || !candidate.subjectTerms) return candidate;

  const allowed = normalizeTokenSet(utterance);
  return candidate.subjectTerms.every(term => allowed.has(term)) ? candidate : null;
}

export async function selectConversationalCapability(input: {
  readonly utterance: string;
  readonly callModel: ConversationalCapabilitySelectorModelCall;
}): Promise<ConversationalIntentCandidate | null> {
  const result = await input.callModel(SELECTOR_PROMPT, [
    { role: "user", content: input.utterance },
  ]);
  const text = typeof result === "string" ? result : result.text;
  return validateSelectedConversationalIntent(input.utterance, parseModelJson(text));
}

export const CONVERSATIONAL_CAPABILITY_SELECTOR_PROMPT = SELECTOR_PROMPT;
