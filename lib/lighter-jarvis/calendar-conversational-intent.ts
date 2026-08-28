import type { ChatMessage } from "../agents/types";
import {
  CALENDAR_FACTUAL_FILLER_TOKENS,
  CALENDAR_FACTUAL_MORPHOLOGY,
  parseCalendarFactualQuery,
  type CalendarFactualQuery,
} from "./calendar-factual-query";

export type CalendarConversationalIntentModelCall = (
  systemPrompt: string,
  messages: ChatMessage[],
) => Promise<string | Readonly<{ text: string }>>;

const INTERPRETER_FORBIDDEN_TERMS = new Set(["when", "what", "where", "which", "who", "why", "how", "i", "me", "we", "you", "am", "is", "are", "do", "does", "did", "have", "has"]);
const RELATIONAL_LEVEL_2_PATTERN = /\\b(?:doing some work|doing work|work on|related to|relate to|connected to|associated with|something about|something connected to|something related to)\\b/i;

const INTERPRETER_PROMPT = [
  "You are a bounded Calendar factual-intent interpreter.",
  "You receive only the user's current utterance. You receive no Calendar data, no event titles, no conversation history, and no authority state.",
  "Return JSON only.",
  'Allowed outputs: {"kind":"next_title_match","terms":["token"]} or {"kind":"unsupported"}.',
  "Use next_title_match only when the user is asking when a literal named personal scheduled activity/event occurs next or again.",
  "Return unsupported for conceptual or relational wording such as work on, related to, connected to, associated with, or something about; those require a later private-title semantic boundary.",
  "Terms identify literal title words the user supplied. You may omit conversational or relational scaffolding, but you must not invent synonyms, categories, names, priorities, urgency, or facts.",
  "Do not answer the Calendar question. Do not request permission. Do not claim Calendar access.",
].join("\n");

function normalizeText(value: string): string {
  return value.normalize("NFKC").toLowerCase().replace(/[‘’]/g, "'").replace(/[^a-z0-9]+/g, " ").trim();
}

function canonicalToken(token: string): string {
  const normalized = normalizeText(token);
  return CALENDAR_FACTUAL_MORPHOLOGY[normalized] ?? normalized;
}

function allowedUtteranceTerms(utterance: string): ReadonlySet<string> {
  const tokens = normalizeText(utterance).split(/\s+/).filter(Boolean)
    .filter(token => !CALENDAR_FACTUAL_FILLER_TOKENS.has(token))
    .map(canonicalToken);
  return new Set(tokens);
}

function hasExplicitNextCue(utterance: string): boolean {
  return /\b(?:next|again)\b/i.test(normalizeText(utterance));
}

function parseModelJson(text: string): unknown {
  const trimmed = text.trim().replace(/^\`\`\`(?:json)?\s*/i, "").replace(/\s*\`\`\`$/, "");
  try { return JSON.parse(trimmed); }
  catch { return null; }
}

export function validateCalendarConversationalIntent(
  utterance: string,
  raw: unknown,
): CalendarFactualQuery | null {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return null;
  if (RELATIONAL_LEVEL_2_PATTERN.test(normalizeText(utterance))) return null;
  const record = raw as Record<string, unknown>;
  if (record.kind === "unsupported") {
    return Object.keys(record).every(key => key === "kind") ? null : null;
  }
  if (record.kind !== "next_title_match" || !hasExplicitNextCue(utterance)) return null;
  if (Object.keys(record).some(key => key !== "kind" && key !== "terms")) return null;
  if (!Array.isArray(record.terms) || record.terms.length === 0 || record.terms.length > 6) return null;

  const allowed = allowedUtteranceTerms(utterance);
  const terms: string[] = [];
  for (const value of record.terms) {
    if (typeof value !== "string") return null;
    const token = canonicalToken(value);
    if (!token || !allowed.has(token) || INTERPRETER_FORBIDDEN_TERMS.has(token)) return null;
    if (!terms.includes(token)) terms.push(token);
  }
  if (terms.length === 0) return null;
  return Object.freeze({ kind: "next_title_match", terms: Object.freeze(terms) });
}

export function isCalendarConversationalIntentCandidate(utterance: string): boolean {
  if (parseCalendarFactualQuery(utterance)) return false;
  const normalized = normalizeText(utterance);
  return /\bwhen\b/.test(normalized) && /\b(?:next|again)\b/.test(normalized);
}

export async function interpretCalendarConversationalIntent(input: {
  readonly utterance: string;
  readonly callModel: CalendarConversationalIntentModelCall;
}): Promise<CalendarFactualQuery | null> {
  if (!isCalendarConversationalIntentCandidate(input.utterance)) return null;
  const result = await input.callModel(INTERPRETER_PROMPT, [
    { role: "user", content: input.utterance },
  ]);
  const text = typeof result === "string" ? result : result.text;
  return validateCalendarConversationalIntent(input.utterance, parseModelJson(text));
}

export const CALENDAR_CONVERSATIONAL_INTENT_PROMPT = INTERPRETER_PROMPT;
