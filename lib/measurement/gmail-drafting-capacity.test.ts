import { describe, expect, it } from "vitest";
import {
  buildFixture,
  buildHistory,
  buildScreeningPlan,
  fixtureDigest,
  selectBoundaryCandidates,
  validateDraftReply,
} from "./gmail-drafting-capacity";

describe("Gmail drafting capacity measurement", () => {
  it("builds the frozen 60-call screening matrix", () => {
    const plan = buildScreeningPlan();
    expect(plan).toHaveLength(60);
    expect(new Set(plan.map(cell => cell.historyKind))).toEqual(new Set(["empty", "representative_39", "maximum_admissible_39"]));
  });

  it("generates exact-size deterministic privacy-safe fixtures", () => {
    const first = buildFixture("raman_shaped", 14_000);
    expect(first).toHaveLength(14_000);
    expect(buildFixture("raman_shaped", 14_000)).toBe(first);
    expect(first).toContain("Raman Bhola");
    expect(first).not.toContain("samdhayward");
    expect(fixtureDigest(first)).toHaveLength(64);
  });

  it("builds representative and maximum admissible 39-message histories", () => {
    expect(buildHistory("empty")).toEqual([]);
    expect(buildHistory("representative_39")).toHaveLength(39);
    const maximum = buildHistory("maximum_admissible_39");
    expect(maximum).toHaveLength(39);
    expect(maximum.every(message => message.content.length === 7_999)).toBe(true);
    expect(maximum.reduce((sum, message) => sum + message.content.length, 0)).toBe(311_961);
  });

  it("accepts faithful drafts and rejects the Raman fabrication", () => {
    expect(validateDraftReply({ sender: "Raman Bhola", subject: "LinkedIn connection invitation", draft: "Thank you for the invitation, Raman. I appreciate it, but I must politely decline." }).ok).toBe(true);
    expect(validateDraftReply({ sender: "Raman Bhola", subject: "LinkedIn connection invitation", draft: "Thanks. I will decline lunch on Thursday." })).toEqual({ ok: false, detail: "draft introduced forbidden fabricated details" });
  });

  it("selects the nearest successful and first failing screening cells", () => {
    const rows = [8_000, 16_000, 32_000].map(targetCharacters => ({
      fixtureKind: "plain_text" as const,
      historyKind: "empty" as const,
      targetCharacters,
      status: targetCharacters < 32_000 ? "passed" as const : "failed" as const,
    }));
    expect(selectBoundaryCandidates(rows)).toEqual([
      { fixtureKind: "plain_text", historyKind: "empty", targetCharacters: 16_000 },
      { fixtureKind: "plain_text", historyKind: "empty", targetCharacters: 32_000 },
    ]);
  });
});
