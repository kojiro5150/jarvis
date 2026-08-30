import { describe, expect, it } from "vitest";
import {
  createUserAssertionRecord,
} from "./record-core";
import {
  applyExplicitReplacementSupersession,
  evaluateOperatingPictureStaleness,
} from "./lifecycle-core";
import {
  proveExplicitReplacementSupersession,
  type ExplicitReplacementDeclaration,
} from "./supersession-proof";
import {
  appendOperatingPictureStalenessVersion,
  appendOperatingPictureSupersessionVersion,
  createInitialOperatingPictureRecordVersion,
} from "./record-version-history";

function explicitDeclaration(
  previousRecordId: string,
  replacementRecordId: string,
  statedAt: string,
): ExplicitReplacementDeclaration {
  return { previousRecordId, replacementRecordId, statedAt } as ExplicitReplacementDeclaration;
}

describe("Governed Operating Picture record version history", () => {
  it("preserves the initial record and appends staleness as a new version", () => {
    const record = createUserAssertionRecord({
      id: "user:preference:1",
      subject: {
        namespace: "user",
        entity: "preferences",
        attribute: "time_of_day",
        revision: "explicit_replacement",
      },
      value: "I prefer mornings.",
      statedAt: "2026-08-30T04:30:00Z",
      visibility: ["planning"],
      staleAfter: "2026-09-30T00:00:00Z",
    });

    const initial = createInitialOperatingPictureRecordVersion(record, "2026-08-30T04:31:00Z");
    expect(initial).not.toBeNull();
    if (!initial) throw new Error("expected initial record version");

    const stale = evaluateOperatingPictureStaleness(record, "2026-09-30T00:00:00Z");
    expect(stale.status).toBe("transitioned");
    if (stale.status !== "transitioned") throw new Error("expected stale transition");

    const next = appendOperatingPictureStalenessVersion(
      initial,
      stale,
      "2026-09-30T00:00:01Z",
    );
    expect(next).not.toBeNull();
    if (!next) throw new Error("expected stale record version");

    expect(next.versionId).not.toBe(initial.versionId);
    expect(next.recordId).toBe(initial.recordId);
    expect(next.previousVersionId).toBe(initial.versionId);
    expect(initial.record.lifecycle).toBe("current");
    expect(next.record.lifecycle).toBe("stale");
    expect(Object.isFrozen(initial)).toBe(true);
    expect(Object.isFrozen(next)).toBe(true);
  });

  it("appends supersession without overwriting the previous lifecycle version", () => {
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

    const transition = applyExplicitReplacementSupersession(previous, proof);
    expect(transition.status).toBe("transitioned");
    if (transition.status !== "transitioned") throw new Error("expected supersession transition");

    const initial = createInitialOperatingPictureRecordVersion(previous, "2026-08-30T04:31:00Z");
    expect(initial).not.toBeNull();
    if (!initial) throw new Error("expected initial record version");

    const next = appendOperatingPictureSupersessionVersion(
      initial,
      transition,
      "2026-09-01T04:31:00Z",
    );
    expect(next).not.toBeNull();
    if (!next) throw new Error("expected superseded record version");

    expect(initial.record.lifecycle).toBe("current");
    expect(initial.record.supersededBy).toBeUndefined();
    expect(next.record.lifecycle).toBe("superseded");
    expect(next.record.supersededBy).toBe(replacement.id);
    expect(next.previousVersionId).toBe(initial.versionId);
  });

  it("rejects history append when the transition is for a different record", () => {
    const first = createUserAssertionRecord({
      id: "user:record:1",
      subject: {
        namespace: "user",
        entity: "preferences",
        attribute: "time_of_day",
        revision: "explicit_replacement",
      },
      value: "Morning.",
      statedAt: "2026-08-30T04:30:00Z",
      visibility: ["planning"],
      staleAfter: "2026-09-01T00:00:00Z",
    });
    const other = createUserAssertionRecord({
      id: "user:record:2",
      subject: first.subject,
      value: "Afternoon.",
      statedAt: "2026-08-31T04:30:00Z",
      visibility: ["planning"],
      staleAfter: "2026-09-01T00:00:00Z",
    });

    const initial = createInitialOperatingPictureRecordVersion(first, "2026-08-30T04:31:00Z");
    expect(initial).not.toBeNull();
    if (!initial) throw new Error("expected initial record version");

    const staleOther = evaluateOperatingPictureStaleness(other, "2026-09-01T00:00:00Z");
    expect(staleOther.status).toBe("transitioned");
    if (staleOther.status !== "transitioned") throw new Error("expected stale transition");

    expect(appendOperatingPictureStalenessVersion(
      initial,
      staleOther,
      "2026-09-01T00:00:01Z",
    )).toBeNull();
  });
});
