import { describe, expect, it } from "vitest";

import { createUserAssertionRecord } from "./record-core";
import { evaluateOperatingPictureStaleness } from "./lifecycle-core";
import { createInMemoryOperatingPictureStore } from "./server-store";
import type { OperatingPictureStore } from "./store-contract";

function fixtureRecord(id: string) {
  return createUserAssertionRecord({
    id,
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
}

function proveStoreContract(store: OperatingPictureStore, id: string) {
  const record = fixtureRecord(id);

  const initial = store.appendInitialRecord(record, "2026-01-01T00:00:01Z");
  expect(initial.status).toBe("appended");
  if (initial.status !== "appended") throw new Error("expected initial append");

  expect(store.getVersion(initial.version.versionId)).toBe(initial.version);
  expect(store.getHeadVersion(record.id)).toBe(initial.version);

  expect(store.appendInitialRecord(record, "2026-01-01T00:00:02Z")).toEqual({
    status: "rejected",
    reason: "record_already_exists",
  });

  const stale = evaluateOperatingPictureStaleness(record, "2026-07-01T00:00:00Z");
  expect(stale.status).toBe("transitioned");
  if (stale.status !== "transitioned") throw new Error("expected stale transition");

  const next = store.appendStalenessTransition(
    initial.version.versionId,
    stale,
    "2026-07-01T00:00:01Z",
  );
  expect(next.status).toBe("appended");
  if (next.status !== "appended") throw new Error("expected stale append");

  expect(store.getHeadVersion(record.id)).toBe(next.version);
  expect(store.listRecordVersions(record.id).map(version => version.versionId)).toEqual([
    initial.version.versionId,
    next.version.versionId,
  ]);

  expect(store.appendStalenessTransition(
    initial.version.versionId,
    stale,
    "2026-07-01T00:00:02Z",
  )).toEqual({
    status: "rejected",
    reason: "previous_version_not_current_head",
  });
}

describe("Operating Picture store contract", () => {
  it("preserves the verified append/reject/head/history semantics on a fresh store instance", () => {
    proveStoreContract(createInMemoryOperatingPictureStore(), "contract:parity:1");
  });

  it("isolates separate store instances instead of sharing process-global state", () => {
    const left = createInMemoryOperatingPictureStore();
    const right = createInMemoryOperatingPictureStore();
    const record = fixtureRecord("contract:isolation:1");

    const appended = left.appendInitialRecord(record, "2026-01-01T00:00:01Z");
    expect(appended.status).toBe("appended");

    expect(left.getHeadVersion(record.id)).not.toBeNull();
    expect(right.getHeadVersion(record.id)).toBeNull();
    expect(right.listRecordVersions(record.id)).toEqual([]);
  });

  it("models process restart as a genuinely fresh empty in-memory instance", () => {
    const beforeRestart = createInMemoryOperatingPictureStore();
    const record = fixtureRecord("contract:restart:1");

    const appended = beforeRestart.appendInitialRecord(record, "2026-01-01T00:00:01Z");
    expect(appended.status).toBe("appended");
    expect(beforeRestart.getHeadVersion(record.id)).not.toBeNull();

    const afterRestart = createInMemoryOperatingPictureStore();

    expect(afterRestart.getHeadVersion(record.id)).toBeNull();
    expect(afterRestart.listRecordVersions(record.id)).toEqual([]);
  });

  it("fails closed on semantic payload mutation through the contract", () => {
    const store = createInMemoryOperatingPictureStore();
    const record = fixtureRecord("contract:tamper:1");

    const initial = store.appendInitialRecord(record, "2026-01-01T00:00:01Z");
    expect(initial.status).toBe("appended");
    if (initial.status !== "appended") throw new Error("expected initial append");

    const fabricated = {
      status: "transitioned",
      record: Object.freeze({
        ...record,
        value: "Caller changed semantic payload.",
        lifecycle: "stale",
      }),
      transition: Object.freeze({
        from: "current",
        to: "stale",
        basis: "explicit_stale_after_elapsed",
        evaluatedAt: "2026-07-01T00:00:00Z",
        staleAfter: "2026-06-01T00:00:00Z",
      }),
    } as ReturnType<typeof evaluateOperatingPictureStaleness>;

    expect(store.appendStalenessTransition(
      initial.version.versionId,
      fabricated,
      "2026-07-01T00:00:01Z",
    )).toEqual({
      status: "rejected",
      reason: "transition_invalid",
    });
    expect(store.getHeadVersion(record.id)).toBe(initial.version);
  });
});
