import { describe, expect, it } from "vitest";

import type {
  DurableOperatingPictureHead,
  DurableOperatingPictureHeadListResult,
  DurableOperatingPictureHistoryReadResult,
  DurableOperatingPictureStore,
  DurableOperatingPictureVersionReadResult,
} from "./durable-store-contract";
import type { PersistedOperatingPictureVersion } from "./persistence-record";
import {
  recoverOperatingPictureSnapshotAfterRestart,
} from "./restart-snapshot";

function version(
  recordId: string,
  versionId: string,
  overrides: Partial<PersistedOperatingPictureVersion> = {},
): PersistedOperatingPictureVersion {
  return Object.freeze({
    versionId,
    recordId,
    previousVersionId: null,
    recordedAt: "2026-08-30T08:30:00Z",
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
    authorshipAt: "2026-08-30T08:29:00Z",
    provenanceSource: null,
    provenanceObservedAt: null,
    ...overrides,
  });
}

function head(
  recordId: string,
  versionId: string,
): DurableOperatingPictureHead {
  return Object.freeze({ recordId, versionId });
}

function foundHeads(
  heads: readonly DurableOperatingPictureHead[],
): DurableOperatingPictureHeadListResult {
  return Object.freeze({
    status: "found",
    heads: Object.freeze([...heads]),
  });
}

function history(
  headVersionId: string,
  versions: readonly PersistedOperatingPictureVersion[],
): DurableOperatingPictureHistoryReadResult {
  return Object.freeze({
    status: "found",
    headVersionId,
    versions: Object.freeze([...versions]),
  });
}

function storeFixture(input: Readonly<{
  headReads: readonly DurableOperatingPictureHeadListResult[];
  histories: Readonly<Record<string, DurableOperatingPictureHistoryReadResult>>;
}>): DurableOperatingPictureStore {
  let headReadIndex = 0;

  const unsupportedVersionRead = async (): Promise<DurableOperatingPictureVersionReadResult> => (
    Object.freeze({ status: "not_found" })
  );

  return Object.freeze({
    async listRecordHeads(): Promise<DurableOperatingPictureHeadListResult> {
      const result = input.headReads[
        Math.min(headReadIndex, input.headReads.length - 1)
      ];
      headReadIndex += 1;
      return result ?? Object.freeze({ status: "empty" });
    },
    getVersion: unsupportedVersionRead,
    getHeadVersion: unsupportedVersionRead,
    async listRecordVersions(
      recordId: string,
    ): Promise<DurableOperatingPictureHistoryReadResult> {
      return input.histories[recordId]
        ?? Object.freeze({ status: "not_found" });
    },
  });
}

describe("Operating Picture all-record restart snapshot", () => {
  it("recovers a stable bounded snapshot across all discovered durable heads", async () => {
    const user = version(
      "record:user:1",
      "11111111-1111-4111-8111-111111111111",
    );
    const fact = version(
      "record:fact:1",
      "22222222-2222-4222-8222-222222222222",
      {
        semanticClass: "fact",
        payload: { status: "confirmed" },
        authorshipSource: null,
        authorshipAt: null,
        provenanceSource: "calendar",
        provenanceObservedAt: "2026-08-30T08:29:00Z",
      },
    );

    const heads = [
      head(user.recordId, user.versionId),
      head(fact.recordId, fact.versionId),
    ];

    const result = await recoverOperatingPictureSnapshotAfterRestart(
      storeFixture({
        headReads: [foundHeads(heads), foundHeads(heads)],
        histories: {
          [user.recordId]: history(user.versionId, [user]),
          [fact.recordId]: history(fact.versionId, [fact]),
        },
      }),
    );

    expect(result).toEqual({
      status: "recovered",
      records: [
        {
          status: "found",
          recordId: user.recordId,
          headVersionId: user.versionId,
          versions: [{
            version: user,
            disposition: "recoverable_user_continuity",
            reason: "user_authorship_persists_as_historical_continuity",
          }],
        },
        {
          status: "found",
          recordId: fact.recordId,
          headVersionId: fact.versionId,
          versions: [{
            version: fact,
            disposition: "requires_source_revalidation",
            reason: "governed_fact_requires_source_revalidation",
          }],
        },
      ],
    });
  });

  it("returns empty only when the durable store is empty before and after recovery", async () => {
    const empty = Object.freeze({ status: "empty" } as const);

    await expect(
      recoverOperatingPictureSnapshotAfterRestart(
        storeFixture({
          headReads: [empty, empty],
          histories: {},
        }),
      ),
    ).resolves.toEqual({ status: "empty" });
  });

  it("fails closed if a discovered record advances before its history is recovered", async () => {
    const discoveredVersionId = "11111111-1111-4111-8111-111111111111";
    const advanced = version(
      "record:user:1",
      "22222222-2222-4222-8222-222222222222",
      {
        previousVersionId: discoveredVersionId,
        lifecycle: "stale",
      },
    );

    await expect(
      recoverOperatingPictureSnapshotAfterRestart(
        storeFixture({
          headReads: [
            foundHeads([head(advanced.recordId, discoveredVersionId)]),
          ],
          histories: {
            [advanced.recordId]: history(advanced.versionId, [advanced]),
          },
        }),
      ),
    ).resolves.toEqual({
      status: "rejected",
      reason: "recovery_snapshot_changed",
    });
  });

  it("fails closed if a discovered record disappears during recovery", async () => {
    const item = version(
      "record:user:1",
      "11111111-1111-4111-8111-111111111111",
    );

    await expect(
      recoverOperatingPictureSnapshotAfterRestart(
        storeFixture({
          headReads: [foundHeads([head(item.recordId, item.versionId)])],
          histories: {
            [item.recordId]: Object.freeze({ status: "not_found" }),
          },
        }),
      ),
    ).resolves.toEqual({
      status: "rejected",
      reason: "recovery_snapshot_changed",
    });
  });

  it("fails closed if the durable head set changes after all records are recovered", async () => {
    const first = version(
      "record:user:1",
      "11111111-1111-4111-8111-111111111111",
    );
    const second = version(
      "record:user:2",
      "22222222-2222-4222-8222-222222222222",
    );

    await expect(
      recoverOperatingPictureSnapshotAfterRestart(
        storeFixture({
          headReads: [
            foundHeads([head(first.recordId, first.versionId)]),
            foundHeads([
              head(first.recordId, first.versionId),
              head(second.recordId, second.versionId),
            ]),
          ],
          histories: {
            [first.recordId]: history(first.versionId, [first]),
          },
        }),
      ),
    ).resolves.toEqual({
      status: "rejected",
      reason: "recovery_snapshot_changed",
    });
  });

  it("fails closed if an initially empty store gains a head during recovery", async () => {
    const added = version(
      "record:user:1",
      "11111111-1111-4111-8111-111111111111",
    );

    await expect(
      recoverOperatingPictureSnapshotAfterRestart(
        storeFixture({
          headReads: [
            Object.freeze({ status: "empty" }),
            foundHeads([head(added.recordId, added.versionId)]),
          ],
          histories: {},
        }),
      ),
    ).resolves.toEqual({
      status: "rejected",
      reason: "recovery_snapshot_changed",
    });
  });

  it("propagates durable integrity and recovery-classification failures", async () => {
    const broken = version(
      "record:broken:1",
      "11111111-1111-4111-8111-111111111111",
      {
        semanticClass: "fact",
        authorshipSource: "user",
        provenanceSource: null,
        provenanceObservedAt: null,
      },
    );

    await expect(
      recoverOperatingPictureSnapshotAfterRestart(
        storeFixture({
          headReads: [foundHeads([head(broken.recordId, broken.versionId)])],
          histories: {
            [broken.recordId]: history(broken.versionId, [broken]),
          },
        }),
      ),
    ).resolves.toEqual({
      status: "rejected",
      reason: "recovery_classification_invalid",
    });

    await expect(
      recoverOperatingPictureSnapshotAfterRestart(
        storeFixture({
          headReads: [
            Object.freeze({
              status: "rejected",
              reason: "persistence_integrity_failure",
            }),
          ],
          histories: {},
        }),
      ),
    ).resolves.toEqual({
      status: "rejected",
      reason: "persistence_integrity_failure",
    });
  });
});
