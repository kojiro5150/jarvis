import { describe, expect, it } from "vitest";

import type {
  DurableOperatingPictureHistoryReadResult,
  DurableOperatingPictureProjectionMetadataReadResult,
  DurableOperatingPictureStore,
  DurableOperatingPictureVersionReadResult,
} from "./durable-store-contract";
import type { PersistedOperatingPictureVersion } from "./persistence-record";
import {
  recoverOperatingPictureRecordHistoryAfterRestart,
} from "./restart-recovery";

function version(
  overrides: Partial<PersistedOperatingPictureVersion> = {},
): PersistedOperatingPictureVersion {
  return Object.freeze({
    versionId: "11111111-1111-4111-8111-111111111111",
    recordId: "record:restart:1",
    previousVersionId: null,
    recordedAt: "2026-08-30T08:10:00Z",
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
    authorshipAt: "2026-08-30T08:09:00Z",
    provenanceSource: null,
    provenanceObservedAt: null,
    ...overrides,
  });
}

function durableStore(
  history: DurableOperatingPictureHistoryReadResult,
): DurableOperatingPictureStore {
  const unsupportedVersionRead = async (): Promise<DurableOperatingPictureVersionReadResult> => (
    Object.freeze({ status: "not_found" })
  );
  const unsupportedMetadataRead = async (): Promise<DurableOperatingPictureProjectionMetadataReadResult> => (
    Object.freeze({ status: "not_found" })
  );

  return Object.freeze({
    async listRecordHeads() {
      return Object.freeze({ status: "empty" } as const);
    },
    getVersionProjectionMetadata: unsupportedMetadataRead,
    getVersion: unsupportedVersionRead,
    getHeadVersion: unsupportedVersionRead,
    async listRecordVersions(): Promise<DurableOperatingPictureHistoryReadResult> {
      return history;
    },
  });
}

describe("Operating Picture restart recovery", () => {
  it("recovers user-authored history as historical semantic continuity", async () => {
    const first = version();
    const second = version({
      versionId: "22222222-2222-4222-8222-222222222222",
      previousVersionId: first.versionId,
      lifecycle: "stale",
      recordedAt: "2026-09-01T00:00:01Z",
    });

    const result = await recoverOperatingPictureRecordHistoryAfterRestart(
      durableStore(Object.freeze({
        status: "found",
        headVersionId: second.versionId,
        versions: Object.freeze([first, second]),
      })),
      first.recordId,
    );

    expect(result).toEqual({
      status: "found",
      recordId: first.recordId,
      headVersionId: second.versionId,
      versions: [
        {
          version: first,
          disposition: "recoverable_user_continuity",
          reason: "user_authorship_persists_as_historical_continuity",
        },
        {
          version: second,
          disposition: "recoverable_user_continuity",
          reason: "user_authorship_persists_as_historical_continuity",
        },
      ],
    });
  });

  it("recovers model-authored material only as low-trust model continuity", async () => {
    const inference = version({
      semanticClass: "inference",
      payload: "This may need follow-up.",
      authorshipSource: "model",
      provenanceSource: null,
      provenanceObservedAt: null,
    });

    const result = await recoverOperatingPictureRecordHistoryAfterRestart(
      durableStore(Object.freeze({
        status: "found",
        headVersionId: inference.versionId,
        versions: Object.freeze([inference]),
      })),
      inference.recordId,
    );

    expect(result).toEqual({
      status: "found",
      recordId: inference.recordId,
      headVersionId: inference.versionId,
      versions: [{
        version: inference,
        disposition: "recoverable_model_continuity",
        reason: "model_authorship_persists_as_low_trust_continuity",
      }],
    });
  });

  it("requires source revalidation for persisted governed facts", async () => {
    const fact = version({
      semanticClass: "fact",
      payload: { status: "confirmed" },
      authorshipSource: null,
      authorshipAt: null,
      provenanceSource: "calendar",
      provenanceObservedAt: "2026-08-30T08:09:00Z",
    });

    const result = await recoverOperatingPictureRecordHistoryAfterRestart(
      durableStore(Object.freeze({
        status: "found",
        headVersionId: fact.versionId,
        versions: Object.freeze([fact]),
      })),
      fact.recordId,
    );

    expect(result).toEqual({
      status: "found",
      recordId: fact.recordId,
      headVersionId: fact.versionId,
      versions: [{
        version: fact,
        disposition: "requires_source_revalidation",
        reason: "governed_fact_requires_source_revalidation",
      }],
    });
  });

  it.each([
    {
      semanticClass: "plan" as const,
      authorshipSource: "governed_system" as const,
      reason: "governed_plan_requires_source_revalidation",
    },
    {
      semanticClass: "commitment" as const,
      authorshipSource: "governed_source" as const,
      reason: "governed_commitment_requires_source_revalidation",
    },
    {
      semanticClass: "decision" as const,
      authorshipSource: "governed_decision_source" as const,
      reason: "governed_decision_requires_source_revalidation",
    },
  ])("requires source revalidation for governed $semanticClass records", async fixture => {
    const governed = version({
      semanticClass: fixture.semanticClass,
      authorshipSource: fixture.authorshipSource,
      provenanceSource: "governed-source",
      provenanceObservedAt: "2026-08-30T08:09:00Z",
    });

    const result = await recoverOperatingPictureRecordHistoryAfterRestart(
      durableStore(Object.freeze({
        status: "found",
        headVersionId: governed.versionId,
        versions: Object.freeze([governed]),
      })),
      governed.recordId,
    );

    expect(result).toEqual({
      status: "found",
      recordId: governed.recordId,
      headVersionId: governed.versionId,
      versions: [{
        version: governed,
        disposition: "requires_source_revalidation",
        reason: fixture.reason,
      }],
    });
  });

  it("preserves durable-store not-found and rejection instead of inventing recovery", async () => {
    await expect(recoverOperatingPictureRecordHistoryAfterRestart(
      durableStore(Object.freeze({ status: "not_found" })),
      "missing",
    )).resolves.toEqual({ status: "not_found" });

    await expect(recoverOperatingPictureRecordHistoryAfterRestart(
      durableStore(Object.freeze({
        status: "rejected",
        reason: "persistence_integrity_failure",
      })),
      "broken",
    )).resolves.toEqual({
      status: "rejected",
      reason: "persistence_integrity_failure",
    });
  });

  it("fails closed if the recovered head does not match durable history", async () => {
    const only = version();

    await expect(recoverOperatingPictureRecordHistoryAfterRestart(
      durableStore(Object.freeze({
        status: "found",
        headVersionId: "99999999-9999-4999-8999-999999999999",
        versions: Object.freeze([only]),
      })),
      only.recordId,
    )).resolves.toEqual({
      status: "rejected",
      reason: "recovery_classification_invalid",
    });
  });
});
