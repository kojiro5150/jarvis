import type { ClaudeContentBlock, ClaudeResult } from "../claude";

export type PublicWebSource = Readonly<{
  url: string;
  title: string;
  pageAge?: string;
}>;

export type PublicWebCitation = Readonly<{
  sourceUrl: string;
  title: string;
  citedText: string;
}>;

export type PublicWebTextSegment = Readonly<{
  text: string;
  provenance:
    | Readonly<{ kind: "source_derived"; citations: readonly PublicWebCitation[] }>
    | Readonly<{ kind: "synthesis"; citations: readonly [] }>;
}>;

export type PublicWebRejectedCitation = Readonly<{
  segmentIndex: number;
  reason: "malformed_citation" | "source_not_admitted" | "source_identity_mismatch";
}>;

export type PublicWebClaimProvenanceProjection = Readonly<{
  sources: readonly PublicWebSource[];
  segments: readonly PublicWebTextSegment[];
  rejectedCitations: readonly PublicWebRejectedCitation[];
  malformedSourceCount: number;
}>;

function nonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function record(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function projectSource(value: unknown): PublicWebSource | null {
  const candidate = record(value);
  if (!candidate || candidate.type !== "web_search_result") return null;
  const url = nonEmptyString(candidate.url);
  const title = nonEmptyString(candidate.title);
  if (!url || !title) return null;
  const pageAge = nonEmptyString(candidate.page_age);
  return Object.freeze({
    url,
    title,
    ...(pageAge ? { pageAge } : {}),
  });
}

function sourceResults(block: ClaudeContentBlock): readonly unknown[] | null {
  if (block.type !== "web_search_tool_result") return null;
  return Array.isArray(block.content) ? block.content : null;
}

function projectCitation(
  value: unknown,
  admittedSources: ReadonlyMap<string, PublicWebSource>,
): PublicWebCitation | "source_not_admitted" | "source_identity_mismatch" | "malformed_citation" {
  const candidate = record(value);
  if (!candidate || candidate.type !== "web_search_result_location") return "malformed_citation";
  const url = nonEmptyString(candidate.url);
  const title = nonEmptyString(candidate.title);
  const citedText = nonEmptyString(candidate.cited_text);
  if (!url || !title || !citedText) return "malformed_citation";
  const admittedSource = admittedSources.get(url);
  if (!admittedSource) return "source_not_admitted";
  if (admittedSource.title !== title) return "source_identity_mismatch";
  return Object.freeze({ sourceUrl: url, title, citedText });
}

/**
 * Deterministically projects claim-level public-web provenance from one
 * provider response. The model does not participate in source admission,
 * citation binding, or synthesis classification.
 */
export function projectPublicWebClaimProvenance(
  result: ClaudeResult,
): PublicWebClaimProvenanceProjection {
  const sources: PublicWebSource[] = [];
  let malformedSourceCount = 0;

  for (const block of result.content) {
    const rawResults = sourceResults(block);
    if (rawResults === null) continue;
    for (const rawResult of rawResults) {
      const source = projectSource(rawResult);
      if (source) sources.push(source);
      else malformedSourceCount += 1;
    }
  }

  const admittedSources = new Map(sources.map(source => [source.url, source] as const));
  const segments: PublicWebTextSegment[] = [];
  const rejectedCitations: PublicWebRejectedCitation[] = [];

  for (const block of result.content) {
    if (block.type !== "text" || typeof block.text !== "string" || block.text.length === 0) continue;
    const segmentIndex = segments.length;
    const citations = Array.isArray(block.citations) ? block.citations : [];
    const admittedCitations: PublicWebCitation[] = [];

    for (const rawCitation of citations) {
      const citation = projectCitation(rawCitation, admittedSources);
      if (typeof citation === "string") {
        rejectedCitations.push(Object.freeze({ segmentIndex, reason: citation }));
      } else {
        admittedCitations.push(citation);
      }
    }

    segments.push(Object.freeze({
      text: block.text,
      provenance: admittedCitations.length > 0
        ? Object.freeze({
            kind: "source_derived" as const,
            citations: Object.freeze(admittedCitations),
          })
        : Object.freeze({
            kind: "synthesis" as const,
            citations: Object.freeze([]) as readonly [],
          }),
    }));
  }

  return Object.freeze({
    sources: Object.freeze(sources),
    segments: Object.freeze(segments),
    rejectedCitations: Object.freeze(rejectedCitations),
    malformedSourceCount,
  });
}
