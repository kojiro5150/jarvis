import { describe, expect, it } from "vitest";

import type { PersistedOperatingPictureVersion } from "./persistence-record";
import type { RecoveredOperatingPictureVersion } from "./restart-recovery";
import type {
  OperatingPictureRestartSnapshotRecord,
  OperatingPictureRestartSnapshotResult,
} from "./restart-snapshot";
import {
  projectDurableOperatingPictureForPurpose,
} from "./durable-projection";

function persisted(
  overrides: Partial<PersistedOperatingPictureVersion> = {},
): PersistedOperatingPictureVersion {
  return Object.freeze({
    versionId: "11111111-1111-4111-8111-111111111111",
    recordId: "record:projection:1",
    previousVersionId: null,
    recordedAt: "2026-08-30T08:45:00Z",
    semanticClass: "user_assertion",
    lifecycle: "current",
    subjectNamespace: "user",
    subjectEntity: "project",
    subjectAttribute: "role",
    revisionSemantics: "explicit_replacement",
    visibilityPurposes: Object.freeze(["conversation"]),
    validFrom: null,
    validUntil: null,
    staleAfter: null,
    supersededBy: null,
    payload: "Project lead",
    authorshipSource: "user",
    authorshipAt: "2026-08-30T08:44:00Z",
    provenanceSource: null,
    provenanceObservedAt: null,
    ...overrides,
  });
}

function recovered(
  version: PersistedOperatingPictureVersion,
  disposition: RecoveredOperatingPictureVersion["disposition"] = "recoverable_user_continuity",
): RecoveredOperatingPictureVersion {
  const reason = disposition === "recoverable_user_continuity"
    ? "user_authorship_persists_as_historical_continuity"
    : disposition === "recoverable_model_continuity"
      ? "model_authorship_persists_as_low_trust_continuity"
      : "governed_fact_requires_source_revalidation";

  return Object.freeze({
    version,
    disposition,
    reason,
  }) as RecoveredOperatingPictureVersion;
}

function snapshotRecord(
  versions: readonly RecoveredOperatingPictureVersion[],
): OperatingPictureRestartSnapshotRecord {
  const head = versions[versions.length - 1];
  if (!head) throw new Error("fixture requires head");
  return Object.freeze({
    status: "found",
    recordId: head.version.recordId,
    headVersionId: head.version.versionId,
    versions: Object.freeze([...versions]),
  });
}

function snapshot(
  records: readonly OperatingPictureRestartSnapshotRecord[],
): OperatingPictureRestartSnapshotResult {
  return Object.freeze({
    status: "recovered",
    records: Object.freeze([...records]),
  });
}

describe("purpose-bounded durable Operating Picture projection", () => {
  it("admits only current recoverable continuity explicitly visible for the requested purpose", () => {
    const user = persisted();
    const model = persisted({
      versionId: "22222222-2222-4222-8222-222222222222",
      recordId: "record:projection:2",
      semanticClass: "inference",
      payload: "This may need follow-up.",
      authorshipSource: "model",
      authorshipAt: "2026-08-30T08:44:30Z",
      visibilityPurposes: Object.freeze(["conversation", "planning"]),
    });

    const result = projectDurableOperatingPictureForPurpose(
      snapshot([
        snapshotRecord([recovered(user)]),
        snapshotRecord([recovered(model, "recoverable_model_continuity")]),
      ]),
      "conversation",
    );

    expect(result).toEqual({
      status: "projected",
      purpose: "conversation",
      items: [
        expect.objectContaining({
          recordId: user.recordId,
          versionId: user.versionId,
          semanticClass: "user_assertion",
          lifecycle: "current",
          recoveryDisposition: "recoverable_user_continuity",
          payload: "Project lead",
          visibilityPurposes: ["conversation"],
        }),
        expect.objectContaining({
          recordId: model.recordId,
          versionId: model.versionId,
          semanticClass: "inference",
          lifecycle: "current",
          recoveryDisposition: "recoverable_model_continuity",
          payload: "This may need follow-up.",
          visibilityPurposes: ["conversation", "planning"],
        }),
      ],
      decisions: [
        {
          recordId: user.recordId,
          headVersionId: user.versionId,
          status: "admitted",
        },
        {
          recordId: model.recordId,
          headVersionId: model.versionId,
          status: "admitted",
        },
      ],
    });
  });

  it("excludes a current record when the requested purpose is not explicitly visible", () => {
    const item = persisted({
      visibilityPurposes: Object.freeze(["planning"]),
    });

    const result = projectDurableOperatingPictureForPurpose(
      snapshot([snapshotRecord([recovered(item)])]),
      "conversation",
    );

    expect(result).toEqual({
      status: "empty",
      purpose: "conversation",
      items: [],
      decisions: [{
        recordId: item.recordId,
        headVersionId: item.versionId,
        status: "excluded",
        reason: "purpose_not_visible",
      }],
    });
  });

  it("quarantines source-backed records even when current and visible", () => {
    const fact = persisted({
      semanticClass: "fact",
      payload: { status: "confirmed" },
      authorshipSource: null,
      authorshipAt: null,
      provenanceSource: "calendar",
      provenanceObservedAt: "2026-08-30T08:44:00Z",
    });

    const result = projectDurableOperatingPictureForPurpose(
      snapshot([
        snapshotRecord([recovered(fact, "requires_source_revalidation")]),
      ]),
      "conversation",
    );

    expect(result).toEqual({
      status: "empty",
      purpose: "conversation",
      items: [],
      decisions: [{
        recordId: fact.recordId,
        headVersionId: fact.versionId,
        status: "excluded",
        reason: "source_revalidation_required",
      }],
    });
  });

  it.each([
    "stale",
    "superseded",
    "withdrawn",
  ] as const)("excludes %s heads from active projection", lifecycle => {
    const item = persisted({
      lifecycle,
      ...(lifecycle === "superseded"
        ? { supersededBy: "record:replacement:1" }
        : {}),
    });

    const result = projectDurableOperatingPictureForPurpose(
      snapshot([snapshotRecord([recovered(item)])]),
      "conversation",
    );

    expect(result).toEqual({
      status: "empty",
      purpose: "conversation",
      items: [],
      decisions: [{
        recordId: item.recordId,
        headVersionId: item.versionId,
        status: "excluded",
        reason: "lifecycle_not_current",
      }],
    });
  });

  it("projects only the exact durable head, never an earlier historical version", () => {
    const earlier = persisted({
      versionId: "11111111-1111-4111-8111-111111111111",
      payload: "Earlier value",
    });
    const head = persisted({
      versionId: "22222222-2222-4222-8222-222222222222",
      previousVersionId: earlier.versionId,
      payload: "Current value",
    });

    const result = projectDurableOperatingPictureForPurpose(
      snapshot([
        snapshotRecord([
          recovered(earlier),
          recovered(head),
        ]),
      ]),
      "conversation",
    );

    expect(result.status).toBe("projected");
    if (result.status !== "projected") throw new Error("expected projection");
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toEqual(expect.objectContaining({
      versionId: head.versionId,
      payload: "Current value",
    }));
  });

  it("returns an explicit empty projection for a stable empty restart snapshot", () => {
    expect(projectDurableOperatingPictureForPurpose(
      Object.freeze({ status: "empty" }),
      "conversation",
    )).toEqual({
      status: "empty",
      purpose: "conversation",
      items: [],
      decisions: [],
    });
  });

  it("rejects invalid purpose or an unrecovered snapshot instead of guessing", () => {
    expect(projectDurableOperatingPictureForPurpose(
      Object.freeze({ status: "empty" }),
      " conversation ",
    )).toEqual({
      status: "rejected",
      purpose: " conversation ",
      reason: "invalid_purpose",
    });

    expect(projectDurableOperatingPictureForPurpose(
      Object.freeze({
        status: "rejected",
        reason: "persistence_unavailable",
      }),
      "conversation",
    )).toEqual({
      status: "rejected",
      purpose: "conversation",
      reason: "snapshot_not_recovered",
    });
  });

  it("fails closed when the snapshot head is missing or inconsistent", () => {
    const item = persisted();
    const inconsistent = Object.freeze({
      status: "recovered",
      records: Object.freeze([
        Object.freeze({
          status: "found",
          recordId: item.recordId,
          headVersionId: "99999999-9999-4999-8999-999999999999",
          versions: Object.freeze([recovered(item)]),
        }),
      ]),
    }) as OperatingPictureRestartSnapshotResult;

    expect(projectDurableOperatingPictureForPurpose(
      inconsistent,
      "conversation",
    )).toEqual({
      status: "rejected",
      purpose: "conversation",
      reason: "head_missing_or_inconsistent",
    });
  });

  it("does not turn projection absence into a factual negation", () => {
    const hidden = persisted({
      visibilityPurposes: Object.freeze(["planning"]),
      payload: "A real durable record exists.",
    });

    const result = projectDurableOperatingPictureForPurpose(
      snapshot([snapshotRecord([recovered(hidden)])]),
      "conversation",
    );

    expect(result.status).toBe("empty");
    if (result.status !== "empty") throw new Error("expected empty projection");
    expect(result.items).toEqual([]);
    expect(result.decisions).toEqual([
      expect.objectContaining({
        status: "excluded",
        reason: "purpose_not_visible",
      }),
    ]);
    expect(JSON.stringify(result)).not.toContain("does_not_exist");
    expect(JSON.stringify(result)).not.toContain("false");
  });
});
