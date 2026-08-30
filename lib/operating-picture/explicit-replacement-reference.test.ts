import { describe, expect, it } from "vitest";
import {
  createUserAssertionRecord,
} from "./record-core";
import {
  evaluateOperatingPictureStaleness,
} from "./lifecycle-core";
import {
  appendInitialOperatingPictureRecord,
  appendOperatingPictureStalenessTransition,
} from "./server-store";
import {
  createOperatingPictureReplacementReference,
  resolveOperatingPictureReplacementReference,
} from "./explicit-replacement-reference";
import {
  createExplicitReplacementDeclarationFromExactResolution,
  proveExplicitReplacementSupersession,
} from "./supersession-proof";

describe("Operating Picture exact explicit-replacement reference", () => {
  it("resolves exact stored heads into a one-shot replacement declaration", () => {
    const previous = createUserAssertionRecord({
      id: "replace:previous:1",
      subject: {
        namespace: "user",
        entity: "preferences",
        attribute: "time_of_day",
        revision: "explicit_replacement",
      },
      value: "I prefer mornings.",
      statedAt: "2026-08-30T06:00:00Z",
      visibility: ["planning"],
    });
    const replacement = createUserAssertionRecord({
      id: "replace:replacement:1",
      subject: previous.subject,
      value: "I now prefer afternoons.",
      statedAt: "2026-08-30T06:01:00Z",
      visibility: ["planning"],
    });

    const previousStored = appendInitialOperatingPictureRecord(previous, "2026-08-30T06:00:01Z");
    const replacementStored = appendInitialOperatingPictureRecord(replacement, "2026-08-30T06:01:01Z");
    expect(previousStored.status).toBe("appended");
    expect(replacementStored.status).toBe("appended");
    if (previousStored.status !== "appended" || replacementStored.status !== "appended") {
      throw new Error("expected stored records");
    }

    const reference = createOperatingPictureReplacementReference({
      previousVersionId: previousStored.version.versionId,
      replacementVersionId: replacementStored.version.versionId,
    });
    expect(reference).not.toBeNull();
    if (!reference) throw new Error("expected replacement reference");
    expect(Object.keys(reference)).toEqual(["operatingPictureReplacementReferenceId"]);

    const ambiguous = resolveOperatingPictureReplacementReference({
      replacementReference: reference,
      currentUserUtterance: "maybe later",
      confirmedAt: "2026-08-30T06:02:00Z",
    });
    expect(ambiguous).toEqual({
      status: "ask",
      reason: "not_confirmed",
      resolution: null,
      replacementReference: reference,
    });

    const confirmed = resolveOperatingPictureReplacementReference({
      replacementReference: reference,
      currentUserUtterance: "yes",
      confirmedAt: "2026-08-30T06:02:00Z",
    });
    expect(confirmed.status).toBe("confirmed");
    if (confirmed.status !== "confirmed") throw new Error("expected confirmed replacement");

    const declaration = createExplicitReplacementDeclarationFromExactResolution(confirmed.resolution);
    const proof = proveExplicitReplacementSupersession(previous, replacement, declaration);
    expect(proof).toMatchObject({
      basis: "explicit_replacement",
      previousRecordId: previous.id,
      replacementRecordId: replacement.id,
      statedAt: "2026-08-30T06:02:00Z",
    });

    expect(resolveOperatingPictureReplacementReference({
      replacementReference: reference,
      currentUserUtterance: "yes",
      confirmedAt: "2026-08-30T06:03:00Z",
    })).toEqual({
      status: "ask",
      reason: "already_consumed",
      resolution: null,
      replacementReference: null,
    });
  });

  it("fails closed when either referenced stored head changes before confirmation", () => {
    const previous = createUserAssertionRecord({
      id: "replace:previous:stale-head",
      subject: {
        namespace: "user",
        entity: "project",
        attribute: "role",
        revision: "explicit_replacement",
      },
      value: "I am project lead.",
      statedAt: "2026-01-01T00:00:00Z",
      visibility: ["conversation"],
      staleAfter: "2026-06-01T00:00:00Z",
    });
    const replacement = createUserAssertionRecord({
      id: "replace:replacement:stale-head",
      subject: previous.subject,
      value: "I am no longer project lead.",
      statedAt: "2026-07-01T00:00:00Z",
      visibility: ["conversation"],
    });

    const previousStored = appendInitialOperatingPictureRecord(previous, "2026-01-01T00:00:01Z");
    const replacementStored = appendInitialOperatingPictureRecord(replacement, "2026-07-01T00:00:01Z");
    expect(previousStored.status).toBe("appended");
    expect(replacementStored.status).toBe("appended");
    if (previousStored.status !== "appended" || replacementStored.status !== "appended") {
      throw new Error("expected stored records");
    }

    const reference = createOperatingPictureReplacementReference({
      previousVersionId: previousStored.version.versionId,
      replacementVersionId: replacementStored.version.versionId,
    });
    expect(reference).not.toBeNull();
    if (!reference) throw new Error("expected replacement reference");

    const stale = evaluateOperatingPictureStaleness(previous, "2026-07-01T00:00:00Z");
    expect(stale.status).toBe("transitioned");
    if (stale.status !== "transitioned") throw new Error("expected stale transition");

    expect(appendOperatingPictureStalenessTransition(
      previousStored.version.versionId,
      stale,
      "2026-07-01T00:00:02Z",
    ).status).toBe("appended");

    expect(resolveOperatingPictureReplacementReference({
      replacementReference: reference,
      currentUserUtterance: "yes",
      confirmedAt: "2026-07-01T00:00:03Z",
    })).toEqual({
      status: "ask",
      reason: "record_head_changed",
      resolution: null,
      replacementReference: null,
    });
  });

  it("refuses to create replacement intent across different subjects or append-only semantics", () => {
    const first = createUserAssertionRecord({
      id: "replace:subject:first",
      subject: {
        namespace: "user",
        entity: "preferences",
        attribute: "time_of_day",
        revision: "explicit_replacement",
      },
      value: "Morning.",
      statedAt: "2026-08-30T06:10:00Z",
      visibility: ["planning"],
    });
    const different = createUserAssertionRecord({
      id: "replace:subject:different",
      subject: {
        namespace: "user",
        entity: "preferences",
        attribute: "meeting_length",
        revision: "explicit_replacement",
      },
      value: "30 minutes.",
      statedAt: "2026-08-30T06:11:00Z",
      visibility: ["planning"],
    });
    const appendOnly = createUserAssertionRecord({
      id: "replace:append-only",
      subject: {
        namespace: "user",
        entity: "journal",
        attribute: "observation",
        revision: "append_only",
      },
      value: "Observation.",
      statedAt: "2026-08-30T06:12:00Z",
      visibility: ["conversation"],
    });
    const appendOnly2 = createUserAssertionRecord({
      id: "replace:append-only-2",
      subject: appendOnly.subject,
      value: "Another observation.",
      statedAt: "2026-08-30T06:13:00Z",
      visibility: ["conversation"],
    });

    const a = appendInitialOperatingPictureRecord(first, "2026-08-30T06:10:01Z");
    const b = appendInitialOperatingPictureRecord(different, "2026-08-30T06:11:01Z");
    const c = appendInitialOperatingPictureRecord(appendOnly, "2026-08-30T06:12:01Z");
    const d = appendInitialOperatingPictureRecord(appendOnly2, "2026-08-30T06:13:01Z");
    if (a.status !== "appended" || b.status !== "appended" || c.status !== "appended" || d.status !== "appended") {
      throw new Error("expected stored records");
    }

    expect(createOperatingPictureReplacementReference({
      previousVersionId: a.version.versionId,
      replacementVersionId: b.version.versionId,
    })).toBeNull();

    expect(createOperatingPictureReplacementReference({
      previousVersionId: c.version.versionId,
      replacementVersionId: d.version.versionId,
    })).toBeNull();
  });
});
