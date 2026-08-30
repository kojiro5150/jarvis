import { describe, expect, it } from "vitest";

import { createUserAssertionRecord } from "./record-core";
import { createInitialOperatingPictureRecordVersion } from "./record-version-history";
import { serializeOperatingPictureVersion } from "./persistence-record";

describe("Operating Picture persistence record", () => {
  it("serializes semantic state without serializing trust brands", () => {
    const record = createUserAssertionRecord({
      id: "user:priority:1",
      subject: {
        namespace: "user",
        entity: "today",
        attribute: "priority",
        revision: "append_only",
      },
      value: {
        label: "Finish the persistence milestone",
        rank: 1,
        qualifiers: ["bounded", "server-owned"],
      },
      statedAt: "2026-08-30T07:15:00Z",
      visibility: ["planning", "conversation"],
      staleAfter: "2026-08-31T00:00:00Z",
    });
    const version = createInitialOperatingPictureRecordVersion(
      record,
      "2026-08-30T07:15:01Z",
    );
    expect(version).not.toBeNull();

    const persisted = serializeOperatingPictureVersion(version!);

    expect(persisted).toEqual({
      versionId: version!.versionId,
      recordId: "user:priority:1",
      previousVersionId: null,
      recordedAt: "2026-08-30T07:15:01Z",
      semanticClass: "user_assertion",
      lifecycle: "current",
      subjectNamespace: "user",
      subjectEntity: "today",
      subjectAttribute: "priority",
      revisionSemantics: "append_only",
      visibilityPurposes: ["planning", "conversation"],
      validFrom: null,
      validUntil: null,
      staleAfter: "2026-08-31T00:00:00Z",
      supersededBy: null,
      payload: {
        label: "Finish the persistence milestone",
        rank: 1,
        qualifiers: ["bounded", "server-owned"],
      },
      authorshipSource: "user",
      authorshipAt: "2026-08-30T07:15:00Z",
      provenanceSource: null,
      provenanceObservedAt: null,
    });
    expect(JSON.stringify(persisted)).not.toContain("authority_evidence");
    expect(JSON.stringify(persisted)).not.toContain("governed_evidence");
    expect(JSON.stringify(persisted)).not.toContain("policy_proof");
    expect(JSON.stringify(persisted)).not.toContain("verification_proof");
    expect(JSON.stringify(persisted)).not.toContain("completion_proof");
  });

  it.each([
    new Date("2026-08-30T07:15:00Z"),
    undefined,
    Symbol("not-json"),
    () => "not durable data",
  ])("fails closed instead of coercing non-JSON payload %s", value => {
    const record = createUserAssertionRecord({
      id: "user:invalid-payload",
      subject: {
        namespace: "user",
        entity: "test",
        attribute: "payload",
        revision: "append_only",
      },
      value,
      statedAt: "2026-08-30T07:15:00Z",
      visibility: ["test"],
    });
    const version = createInitialOperatingPictureRecordVersion(
      record,
      "2026-08-30T07:15:01Z",
    );

    expect(version).not.toBeNull();
    expect(serializeOperatingPictureVersion(version!)).toBeNull();
  });

  it("preserves null as legitimate JSON rather than treating it as serialization failure", () => {
    const record = createUserAssertionRecord({
      id: "user:null-payload",
      subject: {
        namespace: "user",
        entity: "test",
        attribute: "nullable",
        revision: "append_only",
      },
      value: { answer: null },
      statedAt: "2026-08-30T07:15:00Z",
      visibility: ["test"],
    });
    const version = createInitialOperatingPictureRecordVersion(
      record,
      "2026-08-30T07:15:01Z",
    );

    expect(serializeOperatingPictureVersion(version!)?.payload).toEqual({
      answer: null,
    });
  });
});
