import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { describe, expect, it } from "vitest";
import {
  buildDawnwatchPresentation,
  formatDawnwatchVoiceObservation,
  getDawnwatchCapabilityStatus,
  getTomorrowAfternoonStatus,
} from "./dawnwatch-presentation";

const provenance = (sourceId: string, assertionId: string) => ({ sourceId, assertionId });
const configuration = { viewerTimeZone: "Australia/Melbourne", locale: "en-AU", referenceTime: "2026-07-31T12:00:00Z", sourceScope: ["canonical"], identityTieBreakRule: "canonical_identity_ascending" } as const;
const source = { id: "canonical", kind: "operational", availability: "available", observedAt: "2026-07-31T11:00:00Z", snapshotId: "snapshot-1", provenance: provenance("canonical", "source-1") } as const;

describe("governed DAWNWATCH presentation", () => {
  it("projects qualified observations deterministically without excluded legacy semantics", () => {
    const input = {
      priorities: [{ id: "p2", title: "Second identity", provenance: provenance("canonical", "p2-a") }, { id: "p1", title: "First identity", provenance: provenance("canonical", "p1-a") }],
      commitments: [{ id: "c1", title: "Planning", start: "2026-08-01T02:00:00Z", end: "2026-08-01T03:00:00Z", status: "scheduled", provenance: provenance("canonical", "c1-a") }],
      communications: [{ id: "m1", sender: "Operator", recipients: ["Team"], sentAt: "2026-07-31T10:00:00Z", subject: "Update", provenance: provenance("canonical", "m1-a") }],
      sources: [source],
    } as const;
    const first = buildDawnwatchPresentation(input, configuration);
    expect(first).toEqual(buildDawnwatchPresentation(input, configuration));
    expect(first.priorities.observations.map(item => item.id)).toEqual(["p1", "p2"]);
    expect(first.priorities.status).toBe("available");
    expect(first.overallStatus).toBe("unsupported");
    expect(JSON.stringify(first)).not.toMatch(/urgent|unread|important|calendarName|sourceLabel|snippet|needsAttention/i);
  });

  it("keeps empty and unavailable evidence explicit rather than making negative claims", () => {
    const empty = { priorities: [], commitments: [], communications: [], sources: [source] } as const;
    expect(buildDawnwatchPresentation(empty, configuration).priorities.status).toBe("insufficient_coverage");
    const unavailable = { ...empty, sources: [{ ...source, availability: "unavailable" as const }] };
    const result = buildDawnwatchPresentation(unavailable, configuration);
    expect(result.communications.status).toBe("unavailable");
    expect(result.voice).not.toMatch(/clear|free|nothing urgent/i);
  });

  it("returns explicit governed statuses for every Deferred and Rejected capability", () => {
    expect(getTomorrowAfternoonStatus()).toEqual({ capability: "temporal_window", status: "unsupported", availability: "pending_governance" });
    expect(getDawnwatchCapabilityStatus("priority_due").availability).toBe("pending_governance");
    expect(getDawnwatchCapabilityStatus("attention_statement").availability).toBe("rejected_by_governance");
    expect(getDawnwatchCapabilityStatus("priority_observations").availability).toBe("supported");
  });

  it("requires every replay parameter instead of reading environmental defaults", () => {
    expect(() => buildDawnwatchPresentation({ priorities: [], commitments: [], communications: [], sources: [] }, { ...configuration, referenceTime: "" }))
      .toThrow("referenceTime must be an explicit RFC 3339 instant");
    expect(() => buildDawnwatchPresentation({ priorities: [], commitments: [], communications: [], sources: [] }, { ...configuration, sourceScope: [] }))
      .toThrow("sourceScope must be explicit and non-empty");
  });

  it("prefers communication subjects, then senders, without changing title-first observations", () => {
    const result = buildDawnwatchPresentation({
      priorities: [{ id: "p1", title: "Priority title", provenance: provenance("canonical", "p1-a") }],
      commitments: [{ id: "c1", title: "Commitment title", status: "scheduled", provenance: provenance("canonical", "c1-a") }],
      communications: [
        { id: "<sender-fallback@example.test>", sender: "Sender Name", recipients: ["Team"], sentAt: "2026-07-31T10:00:00Z", provenance: provenance("canonical", "m1-a") },
        { id: "<subject-first@example.test>", subject: "Subject first", sender: "Hidden Sender", recipients: ["Team"], sentAt: "2026-07-31T10:01:00Z", provenance: provenance("canonical", "m2-a") },
      ],
      sources: [source],
    }, configuration);

    expect(result.voice).toContain("Priority observations: Priority title.");
    expect(result.voice).toContain("Commitment observations: Commitment title.");
    expect(result.voice).toContain("Communication observations: Sender Name, Subject first.");
    expect(result.voice).not.toContain("sender-fallback@example.test");
    expect(result.voice).not.toContain("Hidden Sender");
  });

  it("keeps a true ID fallback visible and code-formats a canonical Message-ID", () => {
    expect(formatDawnwatchVoiceObservation({ id: "ordinary-id" })).toBe("ordinary-id");
    expect(formatDawnwatchVoiceObservation({ id: "<message-id@example.test>" }))
      .toBe("`<message-id@example.test>`");
  });

  it("prevents Message-ID mailto links through the real Markdown surface without disabling genuine email links", () => {
    const fallback = formatDawnwatchVoiceObservation({ id: "<message-id@example.test>" });
    const renderMarkdown = (content: string) => renderToStaticMarkup(createElement(
      ReactMarkdown,
      { remarkPlugins: [remarkGfm] },
      content,
    ));
    const fallbackMarkup = renderMarkdown(fallback);
    expect(fallbackMarkup).toContain("&lt;message-id@example.test&gt;");
    expect(fallbackMarkup).not.toContain('href="mailto:message-id@example.test"');

    const emailMarkup = renderMarkdown("operator@example.test");
    expect(emailMarkup).toContain('href="mailto:operator@example.test"');
  });
});
