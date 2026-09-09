import { describe, expect, it } from "vitest";
import {
  buildFixture,
  buildHistory,
  buildProviderRejectionResumePlan,
  buildReportProgress,
  buildScreeningPlan,
  fixtureDigest,
  parseMeasurementReply,
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

  it("accepts raw JSON", () => {
    expect(parseMeasurementReply('{"sender":"Raman Bhola"}')).toEqual({ ok: true, value: { sender: "Raman Bhola" }, format: "raw_json" });
  });

  it("accepts exactly one complete JSON code fence", () => {
    expect(parseMeasurementReply('```json\n{"sender":"Raman Bhola"}\n```')).toEqual({ ok: true, value: { sender: "Raman Bhola" }, format: "json_fence" });
  });

  it("rejects prose surrounding otherwise valid JSON", () => {
    expect(parseMeasurementReply('Here is the result:\n```json\n{"sender":"Raman Bhola"}\n```').ok).toBe(false);
  });

  it("rejects malformed JSON", () => {
    expect(parseMeasurementReply('```json\n{"sender":\n```')).toEqual({ ok: false, detail: "response was not valid JSON" });
  });

  it("represents interrupted checkpoints without claiming completion", () => {
    expect(buildReportProgress(7, 60, true)).toEqual({ status: "interrupted", completed: 7, remaining: 53, interrupted: true });
    expect(buildReportProgress(60, 60, false)).toEqual({ status: "completed", completed: 60, remaining: 0, interrupted: false });
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

  it("retains evidence and retries only provider rejections", () => {
    const rows = buildScreeningPlan().map((cell, index) => ({
      ...cell,
      attempt: 1,
      status: index === 42 || index === 59 ? "failed" as const : "passed" as const,
      ...(index === 42 || index === 59 ? { failureKind: "provider_rejection" as const } : {}),
    }));
    const resume = buildProviderRejectionResumePlan(rows);
    expect(resume.retained).toHaveLength(58);
    expect(resume.retry).toEqual([buildScreeningPlan()[42], buildScreeningPlan()[59]]);
  });

  it("rejects incomplete or duplicate resume evidence", () => {
    const rows = buildScreeningPlan().map(cell => ({ ...cell, attempt: 1, status: "failed" as const, failureKind: "provider_rejection" as const }));
    expect(() => buildProviderRejectionResumePlan(rows.slice(1))).toThrow("exactly 60");
    expect(() => buildProviderRejectionResumePlan([rows[0], ...rows.slice(0, -1)])).toThrow("exact screening matrix");
  });
});
