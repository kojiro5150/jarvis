import { describe, expect, it } from "vitest";
import {
  createFactRecord,
  createUserAssertionRecord,
} from "./record-core";
import {
  applyAuthoritativeSnapshotSupersession,
  applyExplicitReplacementSupersession,
  evaluateOperatingPictureStaleness,
} from "./lifecycle-core";
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

describe("Governed Operating Picture supersession transitions", () => {
  it("applies authoritative snapshot proof without mutating the prior fact", () => {
    const previous = createFactRecord({
      id: "abs:vic-unemployment:previous",
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
      id: "abs:vic-unemployment:replacement",
      subject: previous.subject,
      evidence: governedEvidence({ rate: 5.1 }),
      provenance: governedProvenance("abs", "2026-08-13T01:30:00Z"),
      visibility: ["executive_reasoning"],
    });

    const proof = proveAuthoritativeSnapshotSupersession(previous, replacement);
    expect(proof).not.toBeNull();
    if (!proof) throw new Error("expected authoritative supersession proof");

    const result = applyAuthoritativeSnapshotSupersession(previous, proof);
    expect(result.status).toBe("transitioned");
    if (result.status !== "transitioned") throw new Error("expected supersession transition");

    expect(result.record.lifecycle).toBe("superseded");
    expect(result.record.supersededBy).toBe(replacement.id);
    expect(result.transition).toEqual({
      from: "current",
      to: "superseded",
      basis: "authoritative_snapshot",
      replacementRecordId: replacement.id,
    });
    expect(previous.lifecycle).toBe("current");
    expect(previous.supersededBy).toBeUndefined();
    expect(Object.isFrozen(result.record)).toBe(true);
    expect(Object.isFrozen(result.transition)).toBe(true);
  });

  it("applies explicit replacement proof only to the exact referenced record", () => {
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
    expect(proof).not.toBeNull();
    if (!proof) throw new Error("expected explicit replacement proof");

    const result = applyExplicitReplacementSupersession(previous, proof);
    expect(result.status).toBe("transitioned");
    if (result.status !== "transitioned") throw new Error("expected explicit supersession transition");
    expect(result.record.lifecycle).toBe("superseded");
    expect(result.record.supersededBy).toBe(replacement.id);

    const other = createUserAssertionRecord({
      id: "user:preference:other",
      subject: previous.subject,
      value: "A separate record instance.",
      statedAt: "2026-08-31T04:30:00Z",
      visibility: ["planning"],
    });
    expect(applyExplicitReplacementSupersession(other, proof)).toEqual({
      status: "unchanged",
      reason: "proof_record_mismatch",
      record: other,
    });
  });

  it("can supersede an explicitly stale record but cannot revive a terminal record", () => {
    const previous = createUserAssertionRecord({
      id: "user:role:old",
      subject: {
        namespace: "user",
        entity: "project",
        attribute: "role",
        revision: "explicit_replacement",
      },
      value: "I am the project lead.",
      statedAt: "2026-01-01T00:00:00Z",
      visibility: ["conversation"],
      staleAfter: "2026-06-01T00:00:00Z",
    });
    const stale = evaluateOperatingPictureStaleness(previous, "2026-07-01T00:00:00Z");
    expect(stale.status).toBe("transitioned");
    if (stale.status !== "transitioned") throw new Error("expected stale record");

    const replacement = createUserAssertionRecord({
      id: "user:role:new",
      subject: previous.subject,
      value: "I am no longer the project lead.",
      statedAt: "2026-07-01T00:00:00Z",
      visibility: ["conversation"],
    });
    const proof = proveExplicitReplacementSupersession(
      stale.record,
      replacement,
      explicitDeclaration(stale.record.id, replacement.id, "2026-07-01T00:00:00Z"),
    );
    expect(proof).not.toBeNull();
    if (!proof) throw new Error("expected explicit replacement proof");

    const superseded = applyExplicitReplacementSupersession(stale.record, proof);
    expect(superseded.status).toBe("transitioned");
    if (superseded.status !== "transitioned") throw new Error("expected superseded record");
    expect(superseded.transition.from).toBe("stale");

    expect(applyExplicitReplacementSupersession(superseded.record, proof)).toEqual({
      status: "unchanged",
      reason: "not_supersedable",
      record: superseded.record,
    });
  });
});
