import { describe, expect, it } from "vitest";
import {
  createFactRecord,
  createUserAssertionRecord,
} from "./record-core";
import {
  proveAuthoritativeSnapshotSupersession,
  proveExplicitReplacementSupersession,
  type ExplicitReplacementDeclaration,
} from "./supersession-proof";
import type {
  GovernedEvidence,
  GovernedProvenance,
} from "../governance-core/trust-types";

function governedEvidence<T>(value: T): GovernedEvidence<T> {
  return { value } as GovernedEvidence<T>;
}

function governedProvenance(source: string, observedAt: string): GovernedProvenance {
  return { source, observedAt } as GovernedProvenance;
}

function explicitDeclaration(
  previousRecordId: string,
  replacementRecordId: string,
  statedAt: string,
): ExplicitReplacementDeclaration {
  return { previousRecordId, replacementRecordId, statedAt } as ExplicitReplacementDeclaration;
}

describe("Governed Operating Picture supersession proofs", () => {
  it("proves authoritative snapshot supersession only for same-source newer trusted facts", () => {
    const previous = createFactRecord({
      id: "abs:vic-unemployment:jul-1",
      subject: {
        namespace: "abs",
        entity: "victoria",
        attribute: "unemployment_rate",
        revision: "authoritative_snapshot",
      },
      evidence: governedEvidence({ rate: 5.0 }),
      provenance: governedProvenance("abs", "2026-07-17T01:30:00Z"),
      visibility: ["executive_reasoning"],
    });
    const replacement = createFactRecord({
      id: "abs:vic-unemployment:jul-2",
      subject: {
        namespace: "abs",
        entity: "victoria",
        attribute: "unemployment_rate",
        revision: "authoritative_snapshot",
      },
      evidence: governedEvidence({ rate: 5.1 }),
      provenance: governedProvenance("abs", "2026-08-13T01:30:00Z"),
      visibility: ["executive_reasoning"],
    });

    expect(proveAuthoritativeSnapshotSupersession(previous, replacement)).toMatchObject({
      basis: "authoritative_snapshot",
      previousRecordId: previous.id,
      replacementRecordId: replacement.id,
      source: "abs",
      previousObservedAt: "2026-07-17T01:30:00Z",
      replacementObservedAt: "2026-08-13T01:30:00Z",
    });

    const older = createFactRecord({
      id: "abs:vic-unemployment:older",
      subject: replacement.subject,
      evidence: governedEvidence({ rate: 4.9 }),
      provenance: governedProvenance("abs", "2026-06-01T00:00:00Z"),
      visibility: ["executive_reasoning"],
    });
    expect(proveAuthoritativeSnapshotSupersession(previous, older)).toBeNull();

    const otherSource = createFactRecord({
      id: "other:vic-unemployment",
      subject: replacement.subject,
      evidence: governedEvidence({ rate: 5.2 }),
      provenance: governedProvenance("other-source", "2026-08-14T00:00:00Z"),
      visibility: ["executive_reasoning"],
    });
    expect(proveAuthoritativeSnapshotSupersession(previous, otherSource)).toBeNull();
  });

  it("requires exact record-bound declaration for explicit replacement", () => {
    const previous = createUserAssertionRecord({
      id: "user:preference:morning",
      subject: {
        namespace: "user",
        entity: "preferences",
        attribute: "time_of_day",
        revision: "explicit_replacement",
      },
      value: "I prefer mornings.",
      statedAt: "2026-08-30T04:30:00Z",
      visibility: ["planning"],
    });
    const replacement = createUserAssertionRecord({
      id: "user:preference:afternoon",
      subject: previous.subject,
      value: "I now prefer afternoons.",
      statedAt: "2026-09-01T04:30:00Z",
      visibility: ["planning"],
    });

    const proof = proveExplicitReplacementSupersession(
      previous,
      replacement,
      explicitDeclaration(previous.id, replacement.id, "2026-09-01T04:30:00Z"),
    );

    expect(proof).toMatchObject({
      basis: "explicit_replacement",
      previousRecordId: previous.id,
      replacementRecordId: replacement.id,
      statedAt: "2026-09-01T04:30:00Z",
    });

    expect(proveExplicitReplacementSupersession(
      previous,
      replacement,
      explicitDeclaration("wrong-record", replacement.id, "2026-09-01T04:30:00Z"),
    )).toBeNull();
  });

  it("never treats append-only same-subject records as explicit replacement", () => {
    const previous = createUserAssertionRecord({
      id: "note:1",
      subject: {
        namespace: "user",
        entity: "journal",
        attribute: "observation",
        revision: "append_only",
      },
      value: "First observation.",
      statedAt: "2026-08-30T04:30:00Z",
      visibility: ["conversation"],
    });
    const replacement = createUserAssertionRecord({
      id: "note:2",
      subject: previous.subject,
      value: "Second observation.",
      statedAt: "2026-09-01T04:30:00Z",
      visibility: ["conversation"],
    });

    expect(proveExplicitReplacementSupersession(
      previous,
      replacement,
      explicitDeclaration(previous.id, replacement.id, "2026-09-01T04:30:00Z"),
    )).toBeNull();
  });
});
