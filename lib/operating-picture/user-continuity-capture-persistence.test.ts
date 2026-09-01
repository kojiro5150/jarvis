import { describe, expect, it, vi } from "vitest";

import {
  persistUserContinuityCaptureCandidate,
  createUserContinuityCaptureInitialVersion,
  createUserContinuityCaptureRecord,
  type UserContinuityCapturePersistenceDependencies,
} from "./user-continuity-capture-persistence";
import {
  buildUserContinuityCaptureCandidate,
  parseExplicitUserContinuityCaptureRequest,
  validateUserContinuityCaptureClassification,
  type UserContinuityCaptureCandidate,
  type UserContinuityCaptureClass,
} from "./user-continuity-capture-contract";

function candidate(
  semanticClass: UserContinuityCaptureClass = "preference",
  statement = "I prefer short status updates.",
): UserContinuityCaptureCandidate {
  const request = parseExplicitUserContinuityCaptureRequest(`Remember that ${statement}`);
  if (request.status !== "matched") throw new Error("expected matched capture");
  const classification = validateUserContinuityCaptureClassification({
    responseType: "user_continuity_capture_classification",
    status: "classified",
    semanticClass,
  });
  const result = buildUserContinuityCaptureCandidate(
    request.request,
    classification,
    "2026-09-01T04:15:00.000Z",
  );
  if (result.status !== "ready") throw new Error("expected ready candidate");
  return result.candidate;
}

describe("explicit user continuity capture persistence boundary", () => {
  it.each([
    "user_assertion",
    "preference",
    "plan",
    "commitment",
    "decision",
  ] as const)("materialises %s through the existing user-authored record constructor semantics", (semanticClass) => {
    const recordId = `user-continuity:${semanticClass}-1`;
    const record = createUserContinuityCaptureRecord(
      candidate(semanticClass),
      recordId,
    );

    expect(record).toEqual({
      id: recordId,
      class: semanticClass,
      value: { statement: "I prefer short status updates." },
      subject: {
        namespace: "user_continuity",
        entity: recordId,
        attribute: semanticClass,
        revision: "append_only",
      },
      lifecycle: "current",
      visibility: { purposes: ["conversation"] },
      authorship: {
        source: "user",
        statedAt: "2026-09-01T04:15:00.000Z",
      },
    });

    expect(record).not.toHaveProperty("evidence");
    expect(record).not.toHaveProperty("provenance");
    expect(record).not.toHaveProperty("supersededBy");
  });

  it("preserves the exact user-supplied statement without classifier or persistence rewriting", () => {
    const statement = "Keep THIS punctuation — exactly: yes, even this!";
    const record = createUserContinuityCaptureRecord(
      candidate("user_assertion", statement),
      "user-continuity:exact-text-1",
    );

    expect(record?.value).toEqual({ statement });
  });

  it("rejects identities outside the server-owned capture namespace", () => {
    expect(createUserContinuityCaptureRecord(
      candidate(),
      "user:preference:working-style",
    )).toBeNull();
  });

  it("creates an initial current version with no previous version or replacement semantics", () => {
    const version = createUserContinuityCaptureInitialVersion(
      candidate("preference"),
      "user-continuity:version-1",
      "2026-09-01T04:16:00.000Z",
    );

    expect(version).not.toBeNull();
    expect(version).toMatchObject({
      recordId: "user-continuity:version-1",
      previousVersionId: null,
      recordedAt: "2026-09-01T04:16:00.000Z",
      record: {
        id: "user-continuity:version-1",
        class: "preference",
        lifecycle: "current",
        subject: {
          revision: "append_only",
        },
      },
    });
    expect(version?.versionId).toEqual(expect.any(String));
  });

  it("appends the initial version through the injected existing persistence boundary and reports success only after append succeeds", async () => {
    const appendVersion = vi.fn(async (version) => Object.freeze({
      status: "appended" as const,
      version,
    }));
    const dependencies: UserContinuityCapturePersistenceDependencies = {
      createRecordId: () => "user-continuity:persist-1",
      clock: () => new Date("2026-09-01T04:17:00.000Z"),
      appendVersion,
    };

    const result = await persistUserContinuityCaptureCandidate(
      candidate("preference"),
      dependencies,
    );

    expect(result).toEqual({
      status: "persisted",
      recordId: "user-continuity:persist-1",
      versionId: expect.any(String),
    });
    expect(appendVersion).toHaveBeenCalledOnce();

    const appended = appendVersion.mock.calls[0][0];
    expect(appended).toMatchObject({
      recordId: "user-continuity:persist-1",
      previousVersionId: null,
      recordedAt: "2026-09-01T04:17:00.000Z",
      record: {
        class: "preference",
        value: { statement: "I prefer short status updates." },
        authorship: {
          source: "user",
          statedAt: "2026-09-01T04:15:00.000Z",
        },
        subject: {
          namespace: "user_continuity",
          entity: "user-continuity:persist-1",
          attribute: "preference",
          revision: "append_only",
        },
      },
    });
  });

  it("does not claim persistence when the existing append boundary rejects the write", async () => {
    const appendVersion = vi.fn(async () => Object.freeze({
      status: "rejected" as const,
      reason: "persistence_unavailable" as const,
    }));

    expect(await persistUserContinuityCaptureCandidate(candidate(), {
      createRecordId: () => "user-continuity:failed-1",
      clock: () => new Date("2026-09-01T04:17:00.000Z"),
      appendVersion,
    })).toEqual({
      status: "rejected",
      reason: "persistence_unavailable",
    });
  });

  it("creates separate current records for contradictory append-only captures rather than selecting or superseding a winner", async () => {
    const appended: unknown[] = [];
    let nextId = 0;
    const appendVersion = vi.fn(async (version) => {
      appended.push(version);
      return Object.freeze({
        status: "appended" as const,
        version,
      });
    });
    const dependencies: UserContinuityCapturePersistenceDependencies = {
      createRecordId: () => `user-continuity:contradiction-${++nextId}`,
      clock: () => new Date("2026-09-01T04:20:00.000Z"),
      appendVersion,
    };

    const first = await persistUserContinuityCaptureCandidate(
      candidate("preference", "I prefer mornings."),
      dependencies,
    );
    const second = await persistUserContinuityCaptureCandidate(
      candidate("preference", "I prefer afternoons."),
      dependencies,
    );

    expect(first).toMatchObject({
      status: "persisted",
      recordId: "user-continuity:contradiction-1",
    });
    expect(second).toMatchObject({
      status: "persisted",
      recordId: "user-continuity:contradiction-2",
    });
    expect(appendVersion).toHaveBeenCalledTimes(2);

    const serialized = JSON.stringify(appended);
    expect(serialized).toContain("I prefer mornings.");
    expect(serialized).toContain("I prefer afternoons.");
    expect(serialized).not.toContain("supersededBy");
    expect(serialized).not.toContain("explicit_replacement");
  });

  it("contains no parallel store, direct table write, supersession, connector, or chat-runtime machinery", async () => {
    const source = await import("node:fs").then(({ readFileSync }) =>
      readFileSync("lib/operating-picture/user-continuity-capture-persistence.ts", "utf8"));

    for (const forbidden of [
      "operating_picture_versions?",
      "operating_picture_heads?",
      "appendOperatingPictureSupersession",
      "explicit_replacement",
      "GoogleCalendar",
      "Gmail",
      "Drive",
      "chat-handler",
      "/api/lighter/chat",
      "GovernedEvidence",
      "AuthorityEvidence",
      "PolicyProof",
      "VerificationProof",
      "CompletionProof",
    ]) {
      expect(source).not.toContain(forbidden);
    }

    expect(source).toContain("createSupabaseOperatingPicturePersistence");
    expect(source).toContain("createInitialOperatingPictureRecordVersion");
  });
});
