import type { LegacyClaim, LegacyClaimExtraction } from "./types";

const NUMBER_WORDS: Readonly<Record<string, number>> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
  sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
};
const NUMBER = "(\\d+|zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)";
const PATTERNS = [
  new RegExp(`\\b${NUMBER}\\s+(?:unread\\s+)?(?:communications?|messages?|emails?)\\s+(?:are\\s+)?(?:flagged for attention|requiring review|unread)\\b`, "gi"),
  new RegExp(`\\bthere (?:are|is)\\s+${NUMBER}\\s+(?:intelligence signals?|communications?|messages?|emails?)\\s+(?:requiring review|flagged for attention|unread)\\b`, "gi"),
];

function numericValue(token: string): number | undefined {
  if (/^\d+$/.test(token)) return Number(token);
  return NUMBER_WORDS[token.toLowerCase()];
}

/** A deliberately narrow parser: only allow-listed unread-count language is recognized. */
export function extractLegacyUnreadCount(output: unknown): LegacyClaimExtraction {
  if (typeof output !== "string") return { status: "failed", reason: "Legacy output must be a string." };
  if (output.length > 100_000) return { status: "failed", reason: "Legacy output exceeds the 100000 character validation limit." };
  const matches: Array<{ claim: LegacyClaim; evidence: string }> = [];
  for (const pattern of PATTERNS) {
    pattern.lastIndex = 0;
    for (const match of output.matchAll(pattern)) {
      const value = numericValue(match[1]);
      if (value !== undefined && Number.isSafeInteger(value)) {
        matches.push({ claim: { type: "unread-communication-count", value }, evidence: match[0] });
      }
    }
  }
  if (matches.length === 0) return { status: "not-found", evidence: output };

  const byValue = new Map<number, { claim: LegacyClaim; evidence: string }>();
  for (const match of matches) byValue.set(match.claim.value as number, match);
  if (byValue.size > 1) {
    return {
      status: "ambiguous",
      candidates: [...byValue.values()].map(({ claim }) => claim),
      evidence: matches.map(({ evidence }) => evidence).join(" | "),
    };
  }
  const first = matches[0];
  return { status: "extracted", claim: first.claim, evidence: first.evidence };
}
