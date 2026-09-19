import { describe, expect, it } from "vitest";

import type { ClaudeResult } from "../claude";
import { projectPublicWebClaimProvenance } from "./public-web-claim-provenance";

const sourceA = Object.freeze({
  type: "web_search_result",
  url: "https://example.gov.au/source-a",
  title: "Source A",
  page_age: "2026-09-18",
  encrypted_content: "opaque-source-a",
});

const sourceB = Object.freeze({
  type: "web_search_result",
  url: "https://journal.example/source-b",
  title: "Source B",
  page_age: "2026-09-17",
  encrypted_content: "opaque-source-b",
});

function providerResult(content: ClaudeResult["content"]): ClaudeResult {
  return Object.freeze({
    content,
    text: content
      .filter(block => block.type === "text" && typeof block.text === "string")
      .map(block => block.text as string)
      .join(""),
  });
}

describe("public-web claim provenance projection", () => {
  it("binds two factual segments to their own admitted sources and leaves uncited synthesis as synthesis", () => {
    const result = providerResult([
      {
        type: "server_tool_use",
        name: "web_search",
        input: { query: "AI scribes Australian hospitals" },
      },
      {
        type: "web_search_tool_result",
        tool_use_id: "web_search_1",
        content: [sourceA, sourceB],
      },
      {
        type: "text",
        text: "Claim A is established by the government source.",
        citations: [{
          type: "web_search_result_location",
          url: sourceA.url,
          title: sourceA.title,
          cited_text: "Government evidence supporting claim A.",
          encrypted_index: "opaque-index-a",
        }],
      },
      {
        type: "text",
        text: "Claim B is established by the journal source.",
        citations: [{
          type: "web_search_result_location",
          url: sourceB.url,
          title: sourceB.title,
          cited_text: "Journal evidence supporting claim B.",
          encrypted_index: "opaque-index-b",
        }],
      },
      {
        type: "text",
        text: "Taken together, these findings suggest an implementation opportunity.",
      },
    ]);

    expect(projectPublicWebClaimProvenance(result)).toEqual({
      sources: [
        { url: sourceA.url, title: sourceA.title, pageAge: "2026-09-18" },
        { url: sourceB.url, title: sourceB.title, pageAge: "2026-09-17" },
      ],
      segments: [
        {
          text: "Claim A is established by the government source.",
          provenance: {
            kind: "source_derived",
            citations: [{
              sourceUrl: sourceA.url,
              title: sourceA.title,
              citedText: "Government evidence supporting claim A.",
            }],
          },
        },
        {
          text: "Claim B is established by the journal source.",
          provenance: {
            kind: "source_derived",
            citations: [{
              sourceUrl: sourceB.url,
              title: sourceB.title,
              citedText: "Journal evidence supporting claim B.",
            }],
          },
        },
        {
          text: "Taken together, these findings suggest an implementation opportunity.",
          provenance: { kind: "synthesis", citations: [] },
        },
      ],
      rejectedCitations: [],
      malformedSourceCount: 0,
    });
  });

  it("rejects a fabricated citation whose URL was not returned in the same search turn", () => {
    const result = providerResult([
      {
        type: "web_search_tool_result",
        tool_use_id: "web_search_1",
        content: [sourceA],
      },
      {
        type: "text",
        text: "A fluent factual claim with a fabricated source.",
        citations: [{
          type: "web_search_result_location",
          url: "https://fabricated.example/source-c",
          title: "Source C",
          cited_text: "Fabricated supporting text.",
        }],
      },
    ]);

    expect(projectPublicWebClaimProvenance(result)).toEqual({
      sources: [{ url: sourceA.url, title: sourceA.title, pageAge: "2026-09-18" }],
      segments: [{
        text: "A fluent factual claim with a fabricated source.",
        provenance: { kind: "synthesis", citations: [] },
      }],
      rejectedCitations: [{ segmentIndex: 0, reason: "source_not_admitted" }],
      malformedSourceCount: 0,
    });
  });

  it("does not repair malformed source or citation metadata", () => {
    const result = providerResult([
      {
        type: "web_search_tool_result",
        tool_use_id: "web_search_1",
        content: [
          { type: "web_search_result", title: "Missing URL", page_age: "2026-09-18" },
          sourceA,
        ],
      },
      {
        type: "text",
        text: "This citation is malformed.",
        citations: [{
          type: "web_search_result_location",
          url: sourceA.url,
          title: sourceA.title,
        }],
      },
    ]);

    expect(projectPublicWebClaimProvenance(result)).toEqual({
      sources: [{ url: sourceA.url, title: sourceA.title, pageAge: "2026-09-18" }],
      segments: [{
        text: "This citation is malformed.",
        provenance: { kind: "synthesis", citations: [] },
      }],
      rejectedCitations: [{ segmentIndex: 0, reason: "malformed_citation" }],
      malformedSourceCount: 1,
    });
  });

  it("never projects encrypted provider fields into semantic provenance", () => {
    const result = providerResult([
      {
        type: "web_search_tool_result",
        tool_use_id: "web_search_1",
        content: [sourceA],
        encrypted_content: "opaque-tool-result",
      },
      {
        type: "text",
        text: "Claim A.",
        citations: [{
          type: "web_search_result_location",
          url: sourceA.url,
          title: sourceA.title,
          cited_text: "Supporting text.",
          encrypted_index: "opaque-citation-index",
        }],
      },
    ]);

    const projection = projectPublicWebClaimProvenance(result);
    const serialized = JSON.stringify(projection);

    expect(serialized).not.toContain("opaque-source-a");
    expect(serialized).not.toContain("opaque-tool-result");
    expect(serialized).not.toContain("opaque-citation-index");
    expect(projection.segments[0].provenance.kind).toBe("source_derived");
  });

  it("does not treat a retrieved source as support for an uncited text segment", () => {
    const result = providerResult([
      {
        type: "web_search_tool_result",
        tool_use_id: "web_search_1",
        content: [sourceA],
      },
      {
        type: "text",
        text: "The source exists in the turn, but this segment carries no citation.",
      },
    ]);

    expect(projectPublicWebClaimProvenance(result).segments[0]).toEqual({
      text: "The source exists in the turn, but this segment carries no citation.",
      provenance: { kind: "synthesis", citations: [] },
    });
  });

  it("requires exact URL identity rather than normalizing near-matches", () => {
    const result = providerResult([
      {
        type: "web_search_tool_result",
        tool_use_id: "web_search_1",
        content: [sourceA],
      },
      {
        type: "text",
        text: "Near-match URL claim.",
        citations: [{
          type: "web_search_result_location",
          url: sourceA.url + "/",
          title: sourceA.title,
          cited_text: "Supporting text.",
        }],
      },
    ]);

    expect(projectPublicWebClaimProvenance(result).rejectedCitations).toEqual([
      { segmentIndex: 0, reason: "source_not_admitted" },
    ]);
  });
});
