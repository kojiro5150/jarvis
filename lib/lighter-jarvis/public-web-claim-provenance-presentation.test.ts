import { describe, expect, it } from "vitest";
import type { ClaudeResult } from "../claude";
import {
  isPublicWebResearchRequest,
  PUBLIC_WEB_PROVENANCE_FAILURE_REPLY,
  renderPublicWebResearchWithProvenance,
} from "./public-web-claim-provenance-presentation";

const sourceA = { type: "web_search_result", url: "https://example.gov.au/a", title: "Government A", page_age: "2026-09-18" };
const sourceB = { type: "web_search_result", url: "https://journal.example/b", title: "Journal B", page_age: "2026-09-17" };

const result = (content: ClaudeResult["content"]): ClaudeResult => ({
  content,
  text: content
    .filter(block => block.type === "text" && typeof block.text === "string")
    .map(block => block.text as string)
    .join(""),
});

describe("public-web claim provenance presentation", () => {
  it("recognizes research-shaped public requests", () => {
    expect(isPublicWebResearchRequest("Research AI scribes in Australian hospitals")).toBe(true);
    expect(isPublicWebResearchRequest("Compare AI scribes used in hospitals")).toBe(true);
    expect(isPublicWebResearchRequest("Who is the current CEO of OpenAI?")).toBe(false);
    expect(isPublicWebResearchRequest("summarize it")).toBe(false);
    expect(isPublicWebResearchRequest("research")).toBe(false);
    expect(isPublicWebResearchRequest("explain this")).toBe(false);
  });

  it("publishes sourced segments with exact admitted sources and omits uncited synthesis", () => {
    const rendered = renderPublicWebResearchWithProvenance(result([
      { type: "web_search_tool_result", tool_use_id: "w1", content: [sourceA, sourceB] },
      { type: "text", text: "Claim A.", citations: [{ type: "web_search_result_location", url: sourceA.url, title: sourceA.title, cited_text: "Evidence A." }] },
      { type: "text", text: "Claim B.", citations: [{ type: "web_search_result_location", url: sourceB.url, title: sourceB.title, cited_text: "Evidence B." }] },
      { type: "text", text: "This is model synthesis without a citation." },
    ]));

    expect(rendered).toContain("Claim A.\nSource: Government A — https://example.gov.au/a");
    expect(rendered).toContain("Claim B.\nSource: Journal B — https://journal.example/b");
    expect(rendered).not.toContain("This is model synthesis without a citation.");
    expect(rendered).toContain("Synthesis or unsupported material was omitted");
  });

  it("fails closed when no text segment has admitted claim provenance", () => {
    expect(renderPublicWebResearchWithProvenance(result([
      { type: "web_search_tool_result", tool_use_id: "w1", content: [sourceA] },
      { type: "text", text: "Uncited factual prose." },
    ]))).toBe(PUBLIC_WEB_PROVENANCE_FAILURE_REPLY);
  });

  it("rejects same-URL citations whose source title does not match admitted identity", () => {
    expect(renderPublicWebResearchWithProvenance(result([
      { type: "web_search_tool_result", tool_use_id: "w1", content: [sourceA] },
      { type: "text", text: "Claim.", citations: [{ type: "web_search_result_location", url: sourceA.url, title: "Invented title", cited_text: "Evidence." }] },
    ]))).toBe(PUBLIC_WEB_PROVENANCE_FAILURE_REPLY);
  });

  it("does not render a fabricated citation URL", () => {
    const rendered = renderPublicWebResearchWithProvenance(result([
      { type: "web_search_tool_result", tool_use_id: "w1", content: [sourceA] },
      { type: "text", text: "Claim A.", citations: [{ type: "web_search_result_location", url: sourceA.url, title: sourceA.title, cited_text: "Evidence A." }] },
      { type: "text", text: "Fabricated claim.", citations: [{ type: "web_search_result_location", url: "https://fake.example/c", title: "Fake C", cited_text: "Fake." }] },
    ]));
    expect(rendered).toContain("Claim A.");
    expect(rendered).not.toContain("Fabricated claim.");
    expect(rendered).not.toContain("fake.example");
  });
});
