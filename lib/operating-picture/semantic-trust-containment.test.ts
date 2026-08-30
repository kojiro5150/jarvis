import { describe, expect, it } from "vitest";
import {
  createGovernedCommitmentRecord,
  createGovernedDecisionRecord,
  createGovernedPlanRecord,
  createPlanRecord,
} from "./record-core";
import type {
  GovernedEvidence,
  GovernedProvenance,
} from "../governance-core/trust-types";

function governedEvidence<T>(value: T): GovernedEvidence<T> {
  return Object.freeze({ value }) as GovernedEvidence<T>;
}

function governedProvenance(source: string, observedAt: string): GovernedProvenance {
  return Object.freeze({ source, observedAt }) as GovernedProvenance;
}

describe("Operating Picture semantic trust containment", () => {
  it("keeps ordinary plan construction explicitly user-authored", () => {
    const record = createPlanRecord({
      id: "user:plan:1",
      subject: {
        namespace: "user",
        entity: "project",
        attribute: "plan",
        revision: "explicit_replacement",
      },
      value: "Prepare the board paper.",
      statedAt: "2026-08-30T06:20:00Z",
      visibility: ["planning"],
    });

    expect(record.authorship).toEqual({
      source: "user",
      statedAt: "2026-08-30T06:20:00Z",
    });
    expect("evidence" in record).toBe(false);
    expect("provenance" in record).toBe(false);
  });

  it("constructs governed plan authorship only from governed evidence and provenance", () => {
    const evidence = governedEvidence("Prepare the governed release.");
    const provenance = governedProvenance("project_system", "2026-08-30T06:21:00Z");

    const record = createGovernedPlanRecord({
      id: "governed:plan:1",
      subject: {
        namespace: "system",
        entity: "project",
        attribute: "plan",
        revision: "explicit_replacement",
      },
      evidence,
      provenance,
      statedAt: "2026-08-30T06:21:00Z",
      visibility: ["planning"],
    });

    expect(record.value).toBe(evidence.value);
    expect(record.authorship.source).toBe("governed_system");
    expect(record.evidence).toBe(evidence);
    expect(record.provenance).toBe(provenance);
  });

  it("keeps governed commitment and decision source labels constructor-owned", () => {
    const evidence = governedEvidence("Approved state.");
    const provenance = governedProvenance("decision_system", "2026-08-30T06:22:00Z");

    const commitment = createGovernedCommitmentRecord({
      id: "governed:commitment:1",
      subject: {
        namespace: "system",
        entity: "project",
        attribute: "commitment",
        revision: "explicit_replacement",
      },
      evidence,
      provenance,
      statedAt: "2026-08-30T06:22:00Z",
      visibility: ["planning"],
    });

    const decision = createGovernedDecisionRecord({
      id: "governed:decision:1",
      subject: {
        namespace: "system",
        entity: "project",
        attribute: "decision",
        revision: "explicit_replacement",
      },
      evidence,
      provenance,
      statedAt: "2026-08-30T06:22:00Z",
      visibility: ["planning"],
    });

    expect(commitment.authorship.source).toBe("governed_source");
    expect(decision.authorship.source).toBe("governed_decision_source");
    expect(commitment.evidence).toBe(evidence);
    expect(decision.evidence).toBe(evidence);
    expect(commitment.provenance).toBe(provenance);
    expect(decision.provenance).toBe(provenance);
  });
});
