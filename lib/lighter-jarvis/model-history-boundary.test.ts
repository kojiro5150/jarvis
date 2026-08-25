import { describe, expect, it } from "vitest";
import { sanitizeModelHistory } from "./model-history-boundary";

describe("ordinary-model history boundary", () => {
  it.each([
    "Gmail message IDs:\n- private-id\n- another-id",
    "Subject: Private subject",
    "Snippet: Private snippet\nPlain text body: Private body",
    "Tomorrow is clear.",
    "Next seven days you have 1 commitment:\n- Wed, 26 Aug, 7:00 PM – 8:00 PM",
    "Your Calendar has 1 commitment in Tue, 25 Aug, 2026, 10:00 AM to Wed, 26 Aug, 2026, 10:00 AM (up to five events):\n- private",
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

  it("preserves ordinary conversation history byte-for-byte", () => {
    const history = [{ role: "user" as const, content: "Call me Sam." },
      { role: "assistant" as const, content: "Certainly, Sam." },
      { role: "user" as const, content: "What should you call me?" }];
    expect(sanitizeModelHistory(history)).toEqual(history);
  });
});
