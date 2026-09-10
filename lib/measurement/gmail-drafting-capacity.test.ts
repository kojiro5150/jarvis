import { describe, expect, it } from "vitest";
import {
  assessDraftFidelity,
  buildBoundaryProviderRejectionResumePlan,
  buildFailureResumePlan,
  buildFixture,
  buildHistory,
  buildProviderRejectionResumePlan,
  buildReportProgress,
  buildScreeningPlan,
  buildStepDownConfirmationPlan,
  buildStepDownCompletionPlan,
  buildStepDownFidelityRepairPlan,
  buildStepDownProbePlan,
  fixtureDigest,
  measurementCellKey,
  measurementAttemptKey,
  parseMeasurementReply,
  selectLowestCostFidelityFailure,
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

  it.each([
    "Thank you for the invitation, but I have to pass.",
    "I appreciate the invitation, but I can't accept.",
    "I am grateful for the invitation but will not participate.",
    "Thank you for reaching out, but I can't connect at this time.",
    "I appreciate the invitation, but I won't be able to connect.",
    "Thank you for the invitation to connect. I'm not accepting new connections at this time.",
    "Thanks for reaching out. I must decline.",
  ])("accepts a bounded deterministic decline equivalent: %s", draft => {
    expect(validateDraftReply({ sender: "Raman Bhola", subject: "LinkedIn connection invitation", draft }).ok).toBe(true);
  });

  it("reports separate privacy-safe fidelity signals", () => {
    expect(assessDraftFidelity("Thank you, but I have to pass on lunch on Thursday.")).toEqual({
      hasThankSignal: true,
      hasDeclineSignal: true,
      hasForbiddenDetail: true,
    });
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

  it("retains evidence and retries only fidelity failures", () => {
    const rows = buildScreeningPlan().map((cell, index) => ({
      ...cell,
      attempt: 1,
      status: index < 9 ? "failed" as const : "passed" as const,
      ...(index < 9 ? { failureKind: "fidelity_failure" as const } : {}),
    }));
    const resume = buildFailureResumePlan(rows, "fidelity_failure");
    expect(resume.retained).toHaveLength(51);
    expect(resume.retry).toEqual(buildScreeningPlan().slice(0, 9));
  });

  it("rejects incomplete or duplicate resume evidence", () => {
    const rows = buildScreeningPlan().map(cell => ({ ...cell, attempt: 1, status: "failed" as const, failureKind: "provider_rejection" as const }));
    expect(() => buildProviderRejectionResumePlan(rows.slice(1))).toThrow("exactly 60");
    expect(() => buildProviderRejectionResumePlan([rows[0], ...rows.slice(0, -1)])).toThrow("exact screening matrix");
  });

  it("retains 59 boundary attempts and retries only 21 provider rejections", () => {
    const cells = buildScreeningPlan().slice(0, 16);
    const rows = cells.flatMap(cell => Array.from({ length: 5 }, (_, index) => ({
      ...cell,
      attempt: index + 1,
      status: cells.indexOf(cell) >= 12 || (cells.indexOf(cell) === 11 && index === 4) ? "failed" as const : "passed" as const,
      ...(cells.indexOf(cell) >= 12 || (cells.indexOf(cell) === 11 && index === 4) ? { failureKind: "provider_rejection" as const } : {}),
    })));
    const resume = buildBoundaryProviderRejectionResumePlan(rows);
    expect(resume.retained).toHaveLength(59);
    expect(resume.retry).toHaveLength(21);
    expect(resume.retry.slice(0, 6).map(row => row.attempt)).toEqual([5, 1, 2, 3, 4, 5]);
  });

  it("rejects incomplete and duplicate boundary attempt matrices", () => {
    const rows = buildScreeningPlan().slice(0, 16).flatMap(cell => Array.from({ length: 5 }, (_, index) => ({
      ...cell,
      attempt: index + 1,
      status: "failed" as const,
      failureKind: "provider_rejection" as const,
    })));
    expect(() => buildBoundaryProviderRejectionResumePlan(rows.slice(1))).toThrow("exactly 80");
    expect(() => buildBoundaryProviderRejectionResumePlan([rows[0], ...rows.slice(0, -1)])).toThrow("duplicate or invalid attempts");
  });

  it("selects only inconsistent boundary cells at their next lower configured size", () => {
    const cells = buildScreeningPlan().slice(0, 16);
    const rows = cells.flatMap((cell, cellIndex) => Array.from({ length: 5 }, (_, index) => ({
      ...cell,
      attempt: index + 1,
      status: cellIndex === 4 && index === 2 ? "failed" as const : "passed" as const,
      ...(cellIndex === 4 && index === 2 ? { failureKind: "fidelity_failure" as const } : {}),
    })));
    expect(buildStepDownProbePlan(rows)).toEqual([{
      fixtureKind: cells[4].fixtureKind,
      targetCharacters: 8_000,
      historyKind: cells[4].historyKind,
    }]);
  });

  it("confirms only successful step-down probes with attempts two through five", () => {
    const cells = buildScreeningPlan().slice(0, 3);
    const plan = buildStepDownConfirmationPlan(cells.map((cell, index) => ({
      ...cell,
      attempt: 1,
      status: index === 1 ? "failed" as const : "passed" as const,
      ...(index === 1 ? { failureKind: "fidelity_failure" as const } : {}),
    })));
    expect(plan).toHaveLength(8);
    expect(plan.map(task => task.attempt)).toEqual([2, 3, 4, 5, 2, 3, 4, 5]);
    expect(plan.some(task => measurementCellKey(task.cell) === measurementCellKey(cells[1]))).toBe(false);
  });

  it("selects the lowest-token fidelity failure for synthetic diagnosis", () => {
    const cells = buildScreeningPlan().slice(0, 3);
    expect(selectLowestCostFidelityFailure([
      { ...cells[0], attempt: 1, status: "failed", failureKind: "fidelity_failure", usage: { inputTokens: 70_000 } },
      { ...cells[1], attempt: 1, status: "passed", usage: { inputTokens: 2_000 } },
      { ...cells[2], attempt: 1, status: "failed", failureKind: "fidelity_failure", usage: { inputTokens: 6_000 } },
    ])).toEqual(cells[2]);
  });

  it("retries only exact fidelity failures and completes only the repaired probe-only cell", () => {
    const cells = buildScreeningPlan().slice(0, 7);
    const rows = cells.flatMap((cell, cellIndex) => Array.from({ length: cellIndex === 0 ? 1 : 5 }, (_, index) => ({
      ...cell,
      attempt: index + 1,
      status: (cellIndex === 0 || (cellIndex === 2 && index === 3)) ? "failed" as const : "passed" as const,
      ...((cellIndex === 0 || (cellIndex === 2 && index === 3)) ? { failureKind: "fidelity_failure" as const } : {}),
    })));
    const repair = buildStepDownFidelityRepairPlan(rows);
    expect(repair.retry.map(measurementAttemptKey)).toEqual([measurementAttemptKey(rows[0]), measurementAttemptKey(rows[9])]);
    const repaired = rows.map(row => ({ ...row, status: "passed" as const, failureKind: undefined }));
    expect(buildStepDownCompletionPlan(repaired)).toEqual([2, 3, 4, 5].map(attempt => ({ cell: cells[0], attempt })));
    expect(() => buildStepDownCompletionPlan(rows)).toThrow("every retained result to pass");
  });
});
