import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  compareLegacyAndEos,
  extractLegacyUnreadCount,
  validateSyntheticLegacyRuns,
  type EosClaim,
} from ".";

const eosFive: EosClaim = { type: "unread-communication-count", value: 5 };

describe("bounded legacy claim extraction", () => {
  it("extracts digits and preserves the exact recognized evidence span", () => {
    expect(extractLegacyUnreadCount("Update: 5 unread communications are flagged for attention. Review soon.")).toEqual({
      status: "extracted",
      claim: { type: "unread-communication-count", value: 5 },
      evidence: "5 unread communications are flagged for attention",
    });
  });

  it("supports alternate allow-listed number-word phrasing", () => {
    expect(extractLegacyUnreadCount("There are four intelligence signals requiring review.")).toEqual({
      status: "extracted",
      claim: { type: "unread-communication-count", value: 4 },
      evidence: "There are four intelligence signals requiring review",
    });
  });

  it("does not guess from unrelated or unsupported language", () => {
    expect(extractLegacyUnreadCount("You have 7 priorities and several important notes.").status).toBe("not-found");
    expect(extractLegacyUnreadCount("A handful of communications need a look.").status).toBe("not-found");
  });

  it("returns ambiguity for conflicting recognized claims, ignoring unrelated numbers", () => {
    const result = extractLegacyUnreadCount(
      "At 9am, four messages are unread; later, five communications are flagged for attention.",
    );
    expect(result.status).toBe("ambiguous");
    if (result.status === "ambiguous") {
      expect(result.candidates).toEqual([
        { type: "unread-communication-count", value: 4 },
        { type: "unread-communication-count", value: 5 },
      ]);
      expect(result.evidence).not.toContain("9am");
    }
  });

  it("bounds malformed output failures", () => {
    expect(extractLegacyUnreadCount({ prose: "five messages are unread" })).toEqual({
      status: "failed", reason: "Legacy output must be a string.",
    });
    expect(extractLegacyUnreadCount("x".repeat(100_001)).status).toBe("failed");
  });
});

describe("claim comparison", () => {
  const extracted = (value: number) => ({
    status: "extracted" as const,
    claim: { type: "unread-communication-count" as const, value },
    evidence: `${value} unread messages`,
  });

  it("separates matches and mismatches", () => {
    expect(compareLegacyAndEos(extracted(5), eosFive)).toBe("match");
    expect(compareLegacyAndEos(extracted(4), eosFive)).toBe("mismatch");
  });

  it("does not misclassify extraction outcomes as mismatches", () => {
    expect(compareLegacyAndEos({ status: "not-found", evidence: "none" }, eosFive)).toBe("legacy-claim-not-found");
    expect(compareLegacyAndEos({ status: "ambiguous", candidates: [], evidence: "two claims" }, eosFive)).toBe("legacy-claim-ambiguous");
    expect(compareLegacyAndEos({ status: "failed", reason: "bad output" }, eosFive)).toBe("legacy-extraction-failed");
  });

  it("reports unavailable and incomparable EOS facts separately", () => {
    expect(compareLegacyAndEos(extracted(5), null)).toBe("eos-claim-unavailable");
    expect(compareLegacyAndEos(extracted(5), { type: "availability", value: "available" })).toBe("not-comparable");
  });
});

describe("repeated synthetic legacy validation", () => {
  it("retains each run and audit evidence while measuring instability", () => {
    const report = validateSyntheticLegacyRuns({
      fixtureId: "synthetic-inbox-a",
      eosProvenance: ["synthetic://inbox/unread"],
      legacyRuns: [
        "Four messages are unread.",
        "Five communications are flagged for attention.",
        "No inbox count was mentioned.",
        "There are five intelligence signals requiring review.",
        { malformed: true },
      ],
      deriveEosClaim: () => ({ ...eosFive }),
    }, { now: () => "2030-01-14T11:00:00.000Z" });

    expect(report.records).toHaveLength(5);
    expect(report.records.map(({ runId }) => runId)).toEqual([
      "synthetic-inbox-a:legacy:1", "synthetic-inbox-a:legacy:2", "synthetic-inbox-a:legacy:3",
      "synthetic-inbox-a:legacy:4", "synthetic-inbox-a:legacy:5",
    ]);
    expect(report.records[1]).toMatchObject({
      rawLegacyOutput: "Five communications are flagged for attention.",
      eosClaim: eosFive,
      eosProvenance: ["synthetic://inbox/unread"],
      timestamp: "2030-01-14T11:00:00.000Z",
      comparison: "match",
    });
    expect(report.extractionSuccessRate).toBe(3 / 5);
    expect(report.distinctExtractedClaims).toHaveLength(2);
    expect(report.contradictionCount).toBe(1);
    expect(report.withinLegacyConsistency).toBe(2 / 3);
    expect(report.agreementRate).toBe(2 / 3);
    expect(report.eosDeterministic).toBe(true);
  });

  it("excludes absent, ambiguous, and failed extraction from agreement", () => {
    const report = validateSyntheticLegacyRuns({
      fixtureId: "synthetic-no-comparable-claims",
      eosProvenance: [],
      legacyRuns: ["Nothing stated.", "Four messages are unread; five emails are unread.", null],
      deriveEosClaim: () => eosFive,
    });
    expect(report.agreementRate).toBeNull();
    expect(report.extractionSuccessRate).toBe(0);
  });

  it("surfaces a non-deterministic EOS derivation across identical-fixture runs", () => {
    let value = 4;
    const report = validateSyntheticLegacyRuns({
      fixtureId: "synthetic-eos-probe",
      eosProvenance: ["synthetic://probe"],
      legacyRuns: ["Five messages are unread.", "Five messages are unread."],
      deriveEosClaim: () => ({ type: "unread-communication-count", value: value++ }),
    });
    expect(report.eosDeterministic).toBe(false);
  });
});

describe("production isolation", () => {
  it("does not wire validation into the governed conversational runtime", () => {
    const governedRoute = readFileSync("app/api/lighter/chat/route.ts", "utf8");
    const governedHandler = readFileSync("lib/lighter-jarvis/chat-handler.ts", "utf8");
    expect(governedRoute).not.toContain("legacy-claim-validation");
    expect(governedRoute).not.toContain("validateSyntheticLegacyRuns");
    expect(governedHandler).not.toContain("legacy-claim-validation");
    expect(governedHandler).not.toContain("validateSyntheticLegacyRuns");
  });
});
