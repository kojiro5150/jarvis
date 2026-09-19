import type { ClaudeResult } from "../claude";
import { projectPublicWebClaimProvenance } from "./public-web-claim-provenance";

export const PUBLIC_WEB_PROVENANCE_FAILURE_REPLY =
  "I found public-web material, but I couldn't verify claim-level provenance well enough to publish a research answer safely.";

export function isPublicWebResearchRequest(utterance: string): boolean {
  return /\b(?:research|explain|compare|analyse|analyze|summary|summarise|summarize|tell me about|what can you tell me|detail|context|background|trend|history)\b/i
    .test(utterance);
}

function sourceLine(citations: readonly { sourceUrl: string; title: string }[]): string {
  const unique = [...new Map(citations.map(citation => [citation.sourceUrl, citation] as const)).values()];
  const label = unique.length === 1 ? "Source" : "Sources";
  return label + ": " + unique.map(citation => citation.title + " — " + citation.sourceUrl).join("; ");
}

export function renderPublicWebResearchWithProvenance(result: ClaudeResult): string {
  const projection = projectPublicWebClaimProvenance(result);
  const published: string[] = [];
  let omittedSynthesis = false;

  for (const segment of projection.segments) {
    if (segment.provenance.kind === "source_derived") {
      published.push(segment.text.trim() + "\n" + sourceLine(segment.provenance.citations));
    } else if (segment.text.trim().length > 0) {
      omittedSynthesis = true;
    }
  }

  if (published.length === 0) return PUBLIC_WEB_PROVENANCE_FAILURE_REPLY;

  if (omittedSynthesis || projection.rejectedCitations.length > 0 || projection.malformedSourceCount > 0) {
    published.push("Synthesis or unsupported material was omitted because it was not bound to admitted same-turn sources.");
  }

  return published.join("\n\n");
}
