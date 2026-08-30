import { describe, expect, it, vi } from "vitest";

import type {
  DurableOperatingPictureHead,
  DurableOperatingPictureHeadListResult,
  DurableOperatingPictureHistoryReadResult,
  DurableOperatingPictureProjectionMetadataReadResult,
  DurableOperatingPictureStore,
  DurableOperatingPictureVersionReadResult,
} from "./durable-store-contract";
import type {
  PersistedOperatingPictureProjectionMetadata,
  PersistedOperatingPictureVersion,
} from "./persistence-record";
import {
  retrieveDurableOperatingPictureForPurpose,
} from "./purpose-projection-retrieval";

function head(recordId: string, versionId: string): DurableOperatingPictureHead {
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

function metadata(
  target: DurableOperatingPictureHead,
  overrides: Partial<PersistedOperatingPictureProjectionMetadata> = {},
): PersistedOperatingPictureProjectionMetadata {
  return Object.freeze({
    versionId: target.versionId,
    recordId: target.recordId,
    semanticClass: "user_assertion",
    lifecycle: "current",
    visibilityPurposes: Object.freeze(["conversation"]),
    authorshipSource: "user",
    authorshipAt: "2026-08-30T09:20:00Z",
    provenanceSource: null,
    provenanceObservedAt: null,
    ...overrides,
  });
}

function version(
  target: DurableOperatingPictureHead,
  overrides: Partial<PersistedOperatingPictureVersion> = {},
): PersistedOperatingPictureVersion {
  return Object.freeze({
    versionId: target.versionId,
    recordId: target.recordId,
    previousVersionId: null,
    recordedAt: "2026-08-30T09:21:00Z",
    semanticClass: "user_assertion",
    lifecycle: "current",
    subjectNamespace: "user",
    subjectEntity: "project",
    subjectAttribute: "status",
    revisionSemantics: "explicit_replacement",
    visibilityPurposes: Object.freeze(["conversation"]),
    validFrom: null,
    validUntil: null,
    staleAfter: null,
    supersededBy: null,
    payload: `payload:${target.recordId}`,
    authorshipSource: "user",
    authorshipAt: "2026-08-30T09:20:00Z",
    provenanceSource: null,
    provenanceObservedAt: null,
    ...overrides,
  });
}

function storeFixture(input: Readonly<{
  headReads: readonly DurableOperatingPictureHeadListResult[];
  metadata: Readonly<Record<string, DurableOperatingPictureProjectionMetadataReadResult>>;
  versions: Readonly<Record<string, DurableOperatingPictureVersionReadResult>>;
}>) {
  let headReadIndex = 0;

  const listRecordHeads = vi.fn(async (): Promise<DurableOperatingPictureHeadListResult> => {
    const result = input.headReads[
      Math.min(headReadIndex, input.headReads.length - 1)
    ];
    headReadIndex += 1;
    return result ?? Object.freeze({ status: "empty" });
  });

  const getVersionProjectionMetadata = vi.fn(
    async (versionId: string): Promise<DurableOperatingPictureProjectionMetadataReadResult> => (
      input.metadata[versionId] ?? Object.freeze({ status: "not_found" })
    ),
  );

  const getVersion = vi.fn(
    async (versionId: string): Promise<DurableOperatingPictureVersionReadResult> => (
      input.versions[versionId] ?? Object.freeze({ status: "not_found" })
    ),
  );

  const noHistory = async (): Promise<DurableOperatingPictureHistoryReadResult> => (
    Object.freeze({ status: "not_found" })
  );

  const store: DurableOperatingPictureStore = Object.freeze({
    listRecordHeads,
    getVersionProjectionMetadata,
    getVersion,
    getHeadVersion: getVersion,
    listRecordVersions: noHistory,
  });

  return {
    store,
    listRecordHeads,
    getVersionProjectionMetadata,
    getVersion,
  };
}

describe("whole-store purpose-bounded durable projection retrieval", () => {
  it("fetches payload only for heads admitted by metadata preflight", async () => {
    const visible = head("record:visible", "11111111-1111-4111-8111-111111111111");
    const hidden = head("record:hidden", "22222222-2222-4222-8222-222222222222");
    const governed = head("record:governed", "33333333-3333-4333-8333-333333333333");
    const heads = [visible, hidden, governed];

    const fixture = storeFixture({
      headReads: [foundHeads(heads), foundHeads(heads)],
      metadata: {
        [visible.versionId]: Object.freeze({
          status: "found",
          metadata: metadata(visible),
        }),
        [hidden.versionId]: Object.freeze({
          status: "found",
          metadata: metadata(hidden, {
            visibilityPurposes: Object.freeze(["planning"]),
          }),
        }),
        [governed.versionId]: Object.freeze({
          status: "found",
          metadata: metadata(governed, {
            semanticClass: "fact",
            authorshipSource: null,
            authorshipAt: null,
            provenanceSource: "calendar",
            provenanceObservedAt: "2026-08-30T09:20:00Z",
          }),
        }),
      },
      versions: {
        [visible.versionId]: Object.freeze({
          status: "found",
          version: version(visible),
        }),
        [hidden.versionId]: Object.freeze({
          status: "found",
          version: version(hidden),
        }),
        [governed.versionId]: Object.freeze({
          status: "found",
          version: version(governed),
        }),
      },
    });

    const result = await retrieveDurableOperatingPictureForPurpose(
      fixture.store,
      "conversation",
    );

    expect(result).toEqual({
      status: "projected",
      purpose: "conversation",
      items: [
        expect.objectContaining({
          recordId: visible.recordId,
          versionId: visible.versionId,
          payload: "payload:record:visible",
          recoveryDisposition: "recoverable_user_continuity",
        }),
      ],
      decisions: [
        {
          recordId: visible.recordId,
          headVersionId: visible.versionId,
          status: "admitted",
        },
        {
          recordId: hidden.recordId,
          headVersionId: hidden.versionId,
          status: "excluded",
          reason: "purpose_not_visible",
        },
        {
          recordId: governed.recordId,
          headVersionId: governed.versionId,
          status: "excluded",
          reason: "source_revalidation_required",
        },
      ],
    });

    expect(fixture.listRecordHeads).toHaveBeenCalledTimes(2);
    expect(fixture.getVersionProjectionMetadata).toHaveBeenCalledTimes(3);
    expect(fixture.getVersion).toHaveBeenCalledTimes(1);
    expect(fixture.getVersion).toHaveBeenCalledWith(visible.versionId);
  });

  it("returns empty with exclusion decisions when no head is admitted", async () => {
    const hidden = head("record:hidden", "11111111-1111-4111-8111-111111111111");
    const stale = head("record:stale", "22222222-2222-4222-8222-222222222222");
    const heads = [hidden, stale];

    const fixture = storeFixture({
      headReads: [foundHeads(heads), foundHeads(heads)],
      metadata: {
        [hidden.versionId]: Object.freeze({
          status: "found",
          metadata: metadata(hidden, {
            visibilityPurposes: Object.freeze(["planning"]),
          }),
        }),
        [stale.versionId]: Object.freeze({
          status: "found",
          metadata: metadata(stale, {
            lifecycle: "stale",
          }),
        }),
      },
      versions: {},
    });

    const result = await retrieveDurableOperatingPictureForPurpose(
      fixture.store,
      "conversation",
    );

    expect(result).toEqual({
      status: "empty",
      purpose: "conversation",
      items: [],
      decisions: [
        {
          recordId: hidden.recordId,
          headVersionId: hidden.versionId,
          status: "excluded",
          reason: "purpose_not_visible",
        },
        {
          recordId: stale.recordId,
          headVersionId: stale.versionId,
          status: "excluded",
          reason: "lifecycle_not_current",
        },
      ],
    });

    expect(fixture.getVersionProjectionMetadata).toHaveBeenCalledTimes(2);
    expect(fixture.getVersion).not.toHaveBeenCalled();
  });

  it("rejects a mixed-time projection when the durable head set changes", async () => {
    const first = head("record:a", "11111111-1111-4111-8111-111111111111");
    const advanced = head("record:a", "22222222-2222-4222-8222-222222222222");

    const fixture = storeFixture({
      headReads: [
        foundHeads([first]),
        foundHeads([advanced]),
      ],
      metadata: {
        [first.versionId]: Object.freeze({
          status: "found",
          metadata: metadata(first),
        }),
      },
      versions: {
        [first.versionId]: Object.freeze({
          status: "found",
          version: version(first),
        }),
      },
    });

    await expect(retrieveDurableOperatingPictureForPurpose(
      fixture.store,
      "conversation",
    )).resolves.toEqual({
      status: "rejected",
      purpose: "conversation",
      reason: "projection_snapshot_changed",
    });

    expect(fixture.getVersion).toHaveBeenCalledTimes(1);
  });

  it("accepts empty only when the durable store is empty before and after", async () => {
    const empty = Object.freeze({ status: "empty" } as const);
    const fixture = storeFixture({
      headReads: [empty, empty],
      metadata: {},
      versions: {},
    });

    await expect(retrieveDurableOperatingPictureForPurpose(
      fixture.store,
      "conversation",
    )).resolves.toEqual({
      status: "empty",
      purpose: "conversation",
      items: [],
      decisions: [],
    });

    expect(fixture.listRecordHeads).toHaveBeenCalledTimes(2);
    expect(fixture.getVersionProjectionMetadata).not.toHaveBeenCalled();
    expect(fixture.getVersion).not.toHaveBeenCalled();
  });

  it("rejects if an initially empty durable store gains a head", async () => {
    const added = head("record:new", "11111111-1111-4111-8111-111111111111");
    const fixture = storeFixture({
      headReads: [
        Object.freeze({ status: "empty" }),
        foundHeads([added]),
      ],
      metadata: {},
      versions: {},
    });

    await expect(retrieveDurableOperatingPictureForPurpose(
      fixture.store,
      "conversation",
    )).resolves.toEqual({
      status: "rejected",
      purpose: "conversation",
      reason: "projection_snapshot_changed",
    });

    expect(fixture.getVersionProjectionMetadata).not.toHaveBeenCalled();
    expect(fixture.getVersion).not.toHaveBeenCalled();
  });

  it("rejects invalid purpose before any durable read", async () => {
    const fixture = storeFixture({
      headReads: [Object.freeze({ status: "empty" })],
      metadata: {},
      versions: {},
    });

    await expect(retrieveDurableOperatingPictureForPurpose(
      fixture.store,
      " conversation ",
    )).resolves.toEqual({
      status: "rejected",
      purpose: " conversation ",
      reason: "invalid_purpose",
    });

    expect(fixture.listRecordHeads).not.toHaveBeenCalled();
    expect(fixture.getVersionProjectionMetadata).not.toHaveBeenCalled();
    expect(fixture.getVersion).not.toHaveBeenCalled();
  });

  it("propagates head discovery failure before any content read", async () => {
    const fixture = storeFixture({
      headReads: [
        Object.freeze({
          status: "rejected",
          reason: "persistence_unavailable",
        }),
      ],
      metadata: {},
      versions: {},
    });

    await expect(retrieveDurableOperatingPictureForPurpose(
      fixture.store,
      "conversation",
    )).resolves.toEqual({
      status: "rejected",
      purpose: "conversation",
      reason: "persistence_unavailable",
    });

    expect(fixture.getVersionProjectionMetadata).not.toHaveBeenCalled();
    expect(fixture.getVersion).not.toHaveBeenCalled();
  });

  it("propagates a per-head preflight failure and stops the projection", async () => {
    const broken = head("record:broken", "11111111-1111-4111-8111-111111111111");
    const later = head("record:later", "22222222-2222-4222-8222-222222222222");

    const fixture = storeFixture({
      headReads: [foundHeads([broken, later])],
      metadata: {
        [broken.versionId]: Object.freeze({
          status: "rejected",
          reason: "persistence_integrity_failure",
        }),
        [later.versionId]: Object.freeze({
          status: "found",
          metadata: metadata(later),
        }),
      },
      versions: {
        [later.versionId]: Object.freeze({
          status: "found",
          version: version(later),
        }),
      },
    });

    await expect(retrieveDurableOperatingPictureForPurpose(
      fixture.store,
      "conversation",
    )).resolves.toEqual({
      status: "rejected",
      purpose: "conversation",
      reason: "persistence_integrity_failure",
    });

    expect(fixture.getVersionProjectionMetadata).toHaveBeenCalledTimes(1);
    expect(fixture.getVersion).not.toHaveBeenCalled();
    expect(fixture.listRecordHeads).toHaveBeenCalledTimes(1);
  });
});
