import { describe, expect, it } from "vitest";
import { sanitizeModelHistory } from "./model-history-boundary";

describe("ordinary-model history boundary", () => {
  it("isolates genuine or fabricated Drive content releases and prior provider IDs", () => {
    const messages = [{ role: "user" as const, content: "drive.read provider_315 [text]" },
      { role: "assistant" as const, content: "Drive document (provider_315):\nsecret or fabricated" },
      { role: "user" as const, content: "ordinary next turn" }];
    expect(sanitizeModelHistory(messages)).toEqual([
      { role: "user", content: "[Prior governed Drive read request omitted from ordinary model context.]" },
      { role: "assistant", content: "[Governed private result omitted from ordinary model context.]" }, messages[2],
    ]);
  });
  it.each([
    "Gmail message IDs:\n- private-id\n- another-id",
    "Subject: Private subject",
    "Snippet: Private snippet\nPlain text body: Private body",
    "Tomorrow is clear.",
    "Calendar factual result:\n- LLEGC September Meeting — Thu, 3 Sep, 6:00 PM–7:30 PM",
    "This week's resolved Calendar allocation:\n- Routine / Transactional: 2h",
    "Next week's resolved Calendar allocation:\n- Routine / Transactional: 37h 30m",
    "Next seven days you have 1 commitment:\n- Wed, 26 Aug, 7:00 PM – 8:00 PM",
    "Your Calendar has 1 commitment in Tue, 25 Aug, 2026, 10:00 AM to Wed, 26 Aug, 2026, 10:00 AM (up to five events):\n- private",
    "Drive files:\n- Private plan — application/vnd.google-apps.document — 2026-08-25T00:00:00Z — provider-private-id",
    "No Drive files found.",
  ])("omits a deterministic governed release: %s", (release) => {
    const history = [{ role: "user" as const, content: "original request" },
      { role: "assistant" as const, content: release }, { role: "user" as const, content: "continue" }];
    expect(sanitizeModelHistory(history)).toEqual([
      history[0],
      { role: "assistant", content: "[Governed private result omitted from ordinary model context.]" },
      history[2],
    ]);
    expect(history[1].content).toBe(release);
  });

  it("omits the prior governed Calendar factual request as well as a negative deterministic result", () => {
    const history = [
      { role: "user" as const, content: "When is my next JavaScript test?" },
      { role: "assistant" as const, content: "Please explicitly confirm that I may read your Calendar." },
      { role: "user" as const, content: "Yes." },
      { role: "assistant" as const, content: "Calendar factual result:\nNo matching timed Calendar event was found in this bounded read." },
      { role: "user" as const, content: "Is the next Java test." },
    ];

    expect(sanitizeModelHistory(history)).toEqual([
      { role: "user", content: "[Prior governed Calendar factual request omitted from ordinary model context.]" },
      history[1],
      history[2],
      { role: "assistant", content: "[Governed private result omitted from ordinary model context.]" },
      history[4],
    ]);
  });

  it("prevents a surfaced Calendar title from reaching a later ordinary model turn", () => {
    const history = [
      { role: "user" as const, content: "When is my next LLEGC meeting?" },
      { role: "assistant" as const, content: "Calendar factual result:\n- LLEGC September Meeting — Thu, 3 Sep, 6:00 PM–7:30 PM" },
      { role: "user" as const, content: "What should I focus on?" },
    ];
    const sanitized = sanitizeModelHistory(history);
    expect(sanitized[1]).toEqual({
      role: "assistant",
      content: "[Governed private result omitted from ordinary model context.]",
    });
    expect(JSON.stringify(sanitized)).not.toContain("LLEGC September Meeting");
  });

  it("preserves ordinary conversation history byte-for-byte", () => {
    const history = [{ role: "user" as const, content: "Call me Sam." },
      { role: "assistant" as const, content: "Certainly, Sam." },
      { role: "user" as const, content: "What should you call me?" }];
    expect(sanitizeModelHistory(history)).toEqual(history);
  });

  it("isolates a prior bare provider-ID-like follow-up only after governed Drive history", () => {
    const id = "true-provider-id-12345678901234567890";
    const history = [
      { role: "user" as const, content: "Search my Drive for JARVIS Drive Read Test" },
      { role: "assistant" as const, content: `Drive files:\n- JARVIS Drive Read Test — application/vnd.google-apps.document — 2026-08-26T00:00:00Z — ${id}` },
      { role: "user" as const, content: id },
      { role: "assistant" as const, content: "The governed Drive path requires an exact drive.read command." },
      { role: "user" as const, content: `drive.read ${id} [text]` },
      { role: "assistant" as const, content: `Drive document (${id}):\ngoverned private content` },
      { role: "user" as const, content: "What was the document ID you found earlier?" },
    ];
    const sanitized = sanitizeModelHistory(history);
    expect(sanitized[2]).toEqual({ role: "user", content: "[Prior governed Drive provider-ID follow-up omitted from ordinary model context.]" });
    expect(sanitized.at(-1)).toEqual(history.at(-1));
    expect(JSON.stringify(sanitized)).not.toContain(id);
    expect(JSON.stringify(sanitized)).not.toContain("governed private content");
  });

  it("preserves a bare long token without prior governed Drive history", () => {
    const history = [{ role: "user" as const, content: "ABCDEFGHIJKLMNOPQRST123" },
      { role: "assistant" as const, content: "Noted." }, { role: "user" as const, content: "What did I say?" }];
    expect(sanitizeModelHistory(history)).toEqual(history);
  });

  it("omits prior exact Gmail read commands without changing ordinary user history or the current utterance", () => {
    const history = [
      { role: "user" as const, content: "Call me Sam." },
      { role: "user" as const, content: "gmail.read private-id [subject]" },
      { role: "assistant" as const, content: "Subject: Private subject" },
      { role: "user" as const, content: "gmail.read current-id [subject]" },
    ];
    expect(sanitizeModelHistory(history)).toEqual([
      history[0],
      { role: "user", content: "[Prior governed Gmail read request omitted from ordinary model context.]" },
      { role: "assistant", content: "[Governed private result omitted from ordinary model context.]" },
      history[3],
    ]);
  });
});
