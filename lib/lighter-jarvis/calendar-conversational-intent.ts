import type { ChatMessage } from "../agents/types";
import {
  CALENDAR_FACTUAL_FILLER_TOKENS,
  CALENDAR_FACTUAL_MORPHOLOGY,
  type CalendarFactualQuery,
} from "./calendar-factual-query";

export type CalendarConversationalIntentModelCall = (
  systemPrompt: string,
  messages: ChatMessage[],
) => Promise<string | Readonly<{ text: string }>>;

const INTERPRETER_PROMPT = [
  "You are a bounded Calendar factual-intent interpreter.",
  "You receive only the user's current utterance. You receive no Calendar data, no event titles, no conversation history, and no authority state.",
  "Return JSON only.",
  'Allowed outputs: {"kind":"next_title_match","terms":["token"]} or {"kind":"unsupported"}.',
  "Use next_title_match only when the user is asking when a personal scheduled activity/event occurs next or again.",
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
  const record = raw as Record<string, unknown>;
  if (record.kind === "unsupported") return null;
  if (record.kind !== "next_title_match" || !hasExplicitNextCue(utterance)) return null;
  if (!Array.isArray(record.terms) || record.terms.length === 0 || record.terms.length > 6) return null;

  const allowed = allowedUtteranceTerms(utterance);
  const terms: string[] = [];
  for (const value of record.terms) {
    if (typeof value !== "string") return null;
    const token = canonicalToken(value);
    if (!token || !allowed.has(token)) return null;
    if (!terms.includes(token)) terms.push(token);
  }
  if (terms.length === 0) return null;
  return Object.freeze({ kind: "next_title_match", terms: Object.freeze(terms) });
}

export async function interpretCalendarConversationalIntent(input: {
  readonly utterance: string;
  readonly callModel: CalendarConversationalIntentModelCall;
}): Promise<CalendarFactualQuery | null> {
  if (!hasExplicitNextCue(input.utterance)) return null;
  const result = await input.callModel(INTERPRETER_PROMPT, [
    { role: "user", content: input.utterance },
  ]);
  const text = typeof result === "string" ? result : result.text;
  return validateCalendarConversationalIntent(input.utterance, parseModelJson(text));
}

export const CALENDAR_CONVERSATIONAL_INTENT_PROMPT = INTERPRETER_PROMPT;
