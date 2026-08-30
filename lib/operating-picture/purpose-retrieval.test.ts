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
  retrieveDurableOperatingPictureHeadForPurpose,
} from "./purpose-retrieval";

const HEAD: DurableOperatingPictureHead = Object.freeze({
  recordId: "record:purpose:1",
  versionId: "11111111-1111-4111-8111-111111111111",
});

function metadata(
  overrides: Partial<PersistedOperatingPictureProjectionMetadata> = {},
): PersistedOperatingPictureProjectionMetadata {
  return Object.freeze({
    versionId: HEAD.versionId,
    recordId: HEAD.recordId,
    semanticClass: "user_assertion",
    lifecycle: "current",
    visibilityPurposes: Object.freeze(["conversation"]),
    authorshipSource: "user",
    authorshipAt: "2026-08-30T09:10:00Z",
    provenanceSource: null,
    provenanceObservedAt: null,
    ...overrides,
  });
}

function version(
  overrides: Partial<PersistedOperatingPictureVersion> = {},
): PersistedOperatingPictureVersion {
  return Object.freeze({
    versionId: HEAD.versionId,
    recordId: HEAD.recordId,
    previousVersionId: null,
    recordedAt: "2026-08-30T09:11:00Z",
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
    authorshipAt: "2026-08-30T09:10:00Z",
    provenanceSource: null,
    provenanceObservedAt: null,
    ...overrides,
  });
}

function storeFixture(input: Readonly<{
  metadataResult: DurableOperatingPictureProjectionMetadataReadResult;
  versionResult: DurableOperatingPictureVersionReadResult;
}>) {
  const metadataRead = vi.fn(async (): Promise<DurableOperatingPictureProjectionMetadataReadResult> => (
    input.metadataResult
  ));
  const versionRead = vi.fn(async (): Promise<DurableOperatingPictureVersionReadResult> => (
    input.versionResult
  ));

  const emptyHeads = async (): Promise<DurableOperatingPictureHeadListResult> => (
    Object.freeze({ status: "empty" })
  );
  const noHistory = async (): Promise<DurableOperatingPictureHistoryReadResult> => (
    Object.freeze({ status: "not_found" })
  );

  const store: DurableOperatingPictureStore = Object.freeze({
    listRecordHeads: emptyHeads,
    getVersionProjectionMetadata: metadataRead,
    getVersion: versionRead,
    getHeadVersion: versionRead,
    listRecordVersions: noHistory,
  });

  return { store, metadataRead, versionRead };
}

describe("purpose-bounded conditional durable payload retrieval", () => {
  it("fetches payload only after exact-head metadata is admitted", async () => {
    const fixture = storeFixture({
      metadataResult: Object.freeze({
        status: "found",
        metadata: metadata(),
      }),
      versionResult: Object.freeze({
        status: "found",
        version: version(),
      }),
    });

    const result = await retrieveDurableOperatingPictureHeadForPurpose(
      fixture.store,
      HEAD,
      "conversation",
    );

    expect(result).toEqual({
      status: "admitted",
      item: expect.objectContaining({
        recordId: HEAD.recordId,
        versionId: HEAD.versionId,
        purpose: "conversation",
        semanticClass: "user_assertion",
        lifecycle: "current",
        recoveryDisposition: "recoverable_user_continuity",
        payload: "Project lead",
      }),
    });
    expect(fixture.metadataRead).toHaveBeenCalledTimes(1);
    expect(fixture.metadataRead).toHaveBeenCalledWith(HEAD.versionId);
    expect(fixture.versionRead).toHaveBeenCalledTimes(1);
    expect(fixture.versionRead).toHaveBeenCalledWith(HEAD.versionId);
    expect(fixture.metadataRead.mock.invocationCallOrder[0])
      .toBeLessThan(fixture.versionRead.mock.invocationCallOrder[0]);
  });

  it("never fetches payload when the purpose is not visible", async () => {
    const fixture = storeFixture({
      metadataResult: Object.freeze({
        status: "found",
        metadata: metadata({
          visibilityPurposes: Object.freeze(["planning"]),
        }),
      }),
      versionResult: Object.freeze({
        status: "found",
        version: version(),
      }),
    });

    await expect(retrieveDurableOperatingPictureHeadForPurpose(
      fixture.store,
      HEAD,
      "conversation",
    )).resolves.toEqual({
      status: "excluded",
      recordId: HEAD.recordId,
      headVersionId: HEAD.versionId,
      reason: "purpose_not_visible",
    });

    expect(fixture.metadataRead).toHaveBeenCalledTimes(1);
    expect(fixture.versionRead).not.toHaveBeenCalled();
  });

  it.each([
    "stale",
    "superseded",
    "withdrawn",
  ] as const)("never fetches payload for %s metadata", async lifecycle => {
    const fixture = storeFixture({
      metadataResult: Object.freeze({
        status: "found",
        metadata: metadata({ lifecycle }),
      }),
      versionResult: Object.freeze({
        status: "found",
        version: version(),
      }),
    });

    await expect(retrieveDurableOperatingPictureHeadForPurpose(
      fixture.store,
      HEAD,
      "conversation",
    )).resolves.toEqual({
      status: "excluded",
      recordId: HEAD.recordId,
      headVersionId: HEAD.versionId,
      reason: "lifecycle_not_current",
    });

    expect(fixture.versionRead).not.toHaveBeenCalled();
  });

  it("never fetches payload for source-backed metadata requiring revalidation", async () => {
    const fixture = storeFixture({
      metadataResult: Object.freeze({
        status: "found",
        metadata: metadata({
          semanticClass: "fact",
          authorshipSource: null,
          authorshipAt: null,
          provenanceSource: "calendar",
          provenanceObservedAt: "2026-08-30T09:10:00Z",
        }),
      }),
      versionResult: Object.freeze({
        status: "found",
        version: version(),
      }),
    });

    await expect(retrieveDurableOperatingPictureHeadForPurpose(
      fixture.store,
      HEAD,
      "conversation",
    )).resolves.toEqual({
      status: "excluded",
      recordId: HEAD.recordId,
      headVersionId: HEAD.versionId,
      reason: "source_revalidation_required",
    });

    expect(fixture.versionRead).not.toHaveBeenCalled();
  });

  it("admits model continuity without promoting it to fact", async () => {
    const modelMetadata = metadata({
      semanticClass: "inference",
      authorshipSource: "model",
      authorshipAt: "2026-08-30T09:10:00Z",
    });
    const modelVersion = version({
      semanticClass: "inference",
      payload: "This may need follow-up.",
      authorshipSource: "model",
      authorshipAt: "2026-08-30T09:10:00Z",
    });

    const fixture = storeFixture({
      metadataResult: Object.freeze({
        status: "found",
        metadata: modelMetadata,
      }),
      versionResult: Object.freeze({
        status: "found",
        version: modelVersion,
      }),
    });

    const result = await retrieveDurableOperatingPictureHeadForPurpose(
      fixture.store,
      HEAD,
      "conversation",
    );

    expect(result).toEqual({
      status: "admitted",
      item: expect.objectContaining({
        semanticClass: "inference",
        recoveryDisposition: "recoverable_model_continuity",
        payload: "This may need follow-up.",
      }),
    });
  });

  it("rejects exact-head identity mismatch before payload retrieval", async () => {
    const fixture = storeFixture({
      metadataResult: Object.freeze({
        status: "found",
        metadata: metadata({
          recordId: "record:other",
        }),
      }),
      versionResult: Object.freeze({
        status: "found",
        version: version(),
      }),
    });

    await expect(retrieveDurableOperatingPictureHeadForPurpose(
      fixture.store,
      HEAD,
      "conversation",
    )).resolves.toEqual({
      status: "rejected",
      reason: "head_missing_or_inconsistent",
    });

    expect(fixture.versionRead).not.toHaveBeenCalled();
  });

  it("fails closed when full payload metadata disagrees with admitted preflight", async () => {
    const fixture = storeFixture({
      metadataResult: Object.freeze({
        status: "found",
        metadata: metadata(),
      }),
      versionResult: Object.freeze({
        status: "found",
        version: version({
          visibilityPurposes: Object.freeze(["planning"]),
        }),
      }),
    });

    await expect(retrieveDurableOperatingPictureHeadForPurpose(
      fixture.store,
      HEAD,
      "conversation",
    )).resolves.toEqual({
      status: "rejected",
      reason: "persistence_integrity_failure",
    });

    expect(fixture.versionRead).toHaveBeenCalledTimes(1);
  });

  it("rejects invalid purpose before any durable read", async () => {
    const fixture = storeFixture({
      metadataResult: Object.freeze({
        status: "found",
        metadata: metadata(),
      }),
      versionResult: Object.freeze({
        status: "found",
        version: version(),
      }),
    });

    await expect(retrieveDurableOperatingPictureHeadForPurpose(
      fixture.store,
      HEAD,
      " conversation ",
    )).resolves.toEqual({
      status: "rejected",
      reason: "invalid_purpose",
    });

    expect(fixture.metadataRead).not.toHaveBeenCalled();
    expect(fixture.versionRead).not.toHaveBeenCalled();
  });

  it("propagates preflight provider failure without payload retrieval", async () => {
    const fixture = storeFixture({
      metadataResult: Object.freeze({
        status: "rejected",
        reason: "persistence_unavailable",
      }),
      versionResult: Object.freeze({
        status: "found",
        version: version(),
      }),
    });

    await expect(retrieveDurableOperatingPictureHeadForPurpose(
      fixture.store,
      HEAD,
      "conversation",
    )).resolves.toEqual({
      status: "rejected",
      reason: "persistence_unavailable",
    });

    expect(fixture.versionRead).not.toHaveBeenCalled();
  });
});
