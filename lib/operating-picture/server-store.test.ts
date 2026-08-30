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
  getOperatingPictureHeadVersion,
  getOperatingPictureVersion,
  listOperatingPictureRecordVersions,
} from "./server-store";

describe("Governed Operating Picture server store", () => {
  it("appends an initial version once and exposes exact lookup without overwrite", () => {
    const record = createUserAssertionRecord({
      id: "store:initial:1",
      subject: {
        namespace: "user",
        entity: "preferences",
        attribute: "time_of_day",
        revision: "explicit_replacement",
      },
      value: "I prefer mornings.",
      statedAt: "2026-08-30T05:00:00Z",
      visibility: ["planning"],
    });

    const first = appendInitialOperatingPictureRecord(record, "2026-08-30T05:00:01Z");
    expect(first.status).toBe("appended");
    if (first.status !== "appended") throw new Error("expected initial append");

    expect(getOperatingPictureVersion(first.version.versionId)).toBe(first.version);
    expect(getOperatingPictureHeadVersion(record.id)).toBe(first.version);

    expect(appendInitialOperatingPictureRecord(record, "2026-08-30T05:00:02Z")).toEqual({
      status: "rejected",
      reason: "record_already_exists",
    });
    expect(getOperatingPictureHeadVersion(record.id)).toBe(first.version);
  });

  it("advances only from the exact current head and preserves prior versions", () => {
    const record = createUserAssertionRecord({
      id: "store:stale:1",
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

    const initial = appendInitialOperatingPictureRecord(record, "2026-01-01T00:00:01Z");
    expect(initial.status).toBe("appended");
    if (initial.status !== "appended") throw new Error("expected initial append");

    const stale = evaluateOperatingPictureStaleness(record, "2026-07-01T00:00:00Z");
    expect(stale.status).toBe("transitioned");
    if (stale.status !== "transitioned") throw new Error("expected stale transition");

    const appended = appendOperatingPictureStalenessTransition(
      initial.version.versionId,
      stale,
      "2026-07-01T00:00:01Z",
    );
    expect(appended.status).toBe("appended");
    if (appended.status !== "appended") throw new Error("expected stale append");

    expect(getOperatingPictureVersion(initial.version.versionId)).toBe(initial.version);
    expect(getOperatingPictureHeadVersion(record.id)).toBe(appended.version);
    expect(listOperatingPictureRecordVersions(record.id).map(version => version.versionId)).toEqual([
      initial.version.versionId,
      appended.version.versionId,
    ]);

    expect(appendOperatingPictureStalenessTransition(
      initial.version.versionId,
      stale,
      "2026-07-01T00:00:02Z",
    )).toEqual({
      status: "rejected",
      reason: "previous_version_not_current_head",
    });
  });

  it("fails closed when a transition changes semantic payload", () => {
    const record = createUserAssertionRecord({
      id: "store:tamper:1",
      subject: {
        namespace: "user",
        entity: "preferences",
        attribute: "time_of_day",
        revision: "explicit_replacement",
      },
      value: "Morning.",
      statedAt: "2026-08-30T05:00:00Z",
      visibility: ["planning"],
      staleAfter: "2026-09-01T00:00:00Z",
    });

    const initial = appendInitialOperatingPictureRecord(record, "2026-08-30T05:00:01Z");
    expect(initial.status).toBe("appended");
    if (initial.status !== "appended") throw new Error("expected initial append");

    const fabricated = {
      status: "transitioned",
      record: Object.freeze({
        ...record,
        value: "Changed by caller.",
        lifecycle: "stale",
      }),
      transition: Object.freeze({
        from: "current",
        to: "stale",
        basis: "explicit_stale_after_elapsed",
        evaluatedAt: "2026-09-01T00:00:00Z",
        staleAfter: "2026-09-01T00:00:00Z",
      }),
    } as ReturnType<typeof evaluateOperatingPictureStaleness>;

    expect(appendOperatingPictureStalenessTransition(
      initial.version.versionId,
      fabricated,
      "2026-09-01T00:00:01Z",
    )).toEqual({
      status: "rejected",
      reason: "transition_invalid",
    });
    expect(getOperatingPictureHeadVersion(record.id)).toBe(initial.version);
  });

  it("rejects unknown previous versions instead of creating orphan history", () => {
    const record = createUserAssertionRecord({
      id: "store:unknown:1",
      subject: {
        namespace: "user",
        entity: "preferences",
        attribute: "temporary",
        revision: "explicit_replacement",
      },
      value: "Temporary.",
      statedAt: "2026-08-30T05:00:00Z",
      visibility: ["planning"],
      staleAfter: "2026-09-01T00:00:00Z",
    });
    const stale = evaluateOperatingPictureStaleness(record, "2026-09-01T00:00:00Z");
    expect(stale.status).toBe("transitioned");
    if (stale.status !== "transitioned") throw new Error("expected stale transition");

    expect(appendOperatingPictureStalenessTransition(
      "missing-version",
      stale,
      "2026-09-01T00:00:01Z",
    )).toEqual({
      status: "rejected",
      reason: "previous_version_not_found",
    });
  });
});
