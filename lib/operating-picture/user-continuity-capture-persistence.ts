import { randomUUID } from "node:crypto";

import {
  createCommitmentRecord,
  createDecisionRecord,
  createPlanRecord,
  createPreferenceRecord,
  createUserAssertionRecord,
  type PreferenceRecord,
  type UserAssertionRecord,
  type UserCommitmentRecord,
  type UserDecisionRecord,
  type UserPlanRecord,
} from "./record-core";
import {
  createInitialOperatingPictureRecordVersion,
  type OperatingPictureRecordVersion,
} from "./record-version-history";
import {
  createSupabaseOperatingPicturePersistence,
  loadSupabaseOperatingPictureConfig,
  type SupabaseOperatingPictureAppendResult,
} from "./supabase-persistence";
import type {
  UserContinuityCaptureCandidate,
} from "./user-continuity-capture-contract";

type CaptureValue = Readonly<{ statement: string }>;

export type UserContinuityCaptureRecord =
  | UserAssertionRecord<CaptureValue>
  | PreferenceRecord<CaptureValue>
  | UserPlanRecord<CaptureValue>
  | UserCommitmentRecord<CaptureValue>
  | UserDecisionRecord<CaptureValue>;

export type UserContinuityCapturePersistenceResult =
  | Readonly<{
      status: "persisted";
      recordId: string;
      versionId: string;
    }>
  | Readonly<{
      status: "rejected";
      reason:
        | "invalid_record_identity"
        | "invalid_initial_version"
        | "persistence_unavailable"
        | "persistence_rejected";
    }>;

type AppendVersion = (
  version: OperatingPictureRecordVersion<UserContinuityCaptureRecord>,
) => Promise<SupabaseOperatingPictureAppendResult>;

export type UserContinuityCapturePersistenceDependencies = Readonly<{
  createRecordId: () => string;
  clock: () => Date;
  appendVersion: AppendVersion;
}>;

const RECORD_ID_PREFIX = "user-continuity:";

function validRecordId(recordId: string): boolean {
  return recordId.startsWith(RECORD_ID_PREFIX)
    && recordId.length > RECORD_ID_PREFIX.length;
}

function captureSubject(
  recordId: string,
  semanticClass: UserContinuityCaptureCandidate["semanticClass"],
) {
  return Object.freeze({
    namespace: "user_continuity",
    entity: recordId,
    attribute: semanticClass,
    revision: "append_only" as const,
  });
}

export function createUserContinuityCaptureRecord(
  candidate: UserContinuityCaptureCandidate,
  recordId: string,
): UserContinuityCaptureRecord | null {
  if (!validRecordId(recordId)) return null;

  const common = {
    id: recordId,
    subject: captureSubject(recordId, candidate.semanticClass),
    visibility: candidate.visibilityPurposes,
    value: candidate.value,
    statedAt: candidate.authorship.statedAt,
  } as const;

  switch (candidate.semanticClass) {
    case "user_assertion":
      return createUserAssertionRecord(common);
    case "preference":
      return createPreferenceRecord(common);
    case "plan":
      return createPlanRecord(common);
    case "commitment":
      return createCommitmentRecord(common);
    case "decision":
      return createDecisionRecord(common);
    default:
      return null;
  }
}

export function createUserContinuityCaptureInitialVersion(
  candidate: UserContinuityCaptureCandidate,
  recordId: string,
  recordedAt: string,
): OperatingPictureRecordVersion<UserContinuityCaptureRecord> | null {
  const record = createUserContinuityCaptureRecord(candidate, recordId);
  if (!record) return null;
  return createInitialOperatingPictureRecordVersion(record, recordedAt);
}

export async function persistUserContinuityCaptureCandidate(
  candidate: UserContinuityCaptureCandidate,
  dependencies: UserContinuityCapturePersistenceDependencies,
): Promise<UserContinuityCapturePersistenceResult> {
  const recordId = dependencies.createRecordId();
  if (!validRecordId(recordId)) {
    return Object.freeze({
      status: "rejected",
      reason: "invalid_record_identity",
    });
  }

  const recordedAt = dependencies.clock().toISOString();
  const version = createUserContinuityCaptureInitialVersion(
    candidate,
    recordId,
    recordedAt,
  );
  if (!version) {
    return Object.freeze({
      status: "rejected",
      reason: "invalid_initial_version",
    });
  }

  const append = await dependencies.appendVersion(version);
  if (append.status !== "appended") {
    return Object.freeze({
      status: "rejected",
      reason: append.reason === "persistence_unavailable"
        ? "persistence_unavailable"
        : "persistence_rejected",
    });
  }

  return Object.freeze({
    status: "persisted",
    recordId: append.version.recordId,
    versionId: append.version.versionId,
  });
}

export async function persistUserContinuityCaptureCandidateToSupabase(
  candidate: UserContinuityCaptureCandidate,
): Promise<UserContinuityCapturePersistenceResult> {
  const config = loadSupabaseOperatingPictureConfig();
  if (!config) {
    return Object.freeze({
      status: "rejected",
      reason: "persistence_unavailable",
    });
  }

  const persistence = createSupabaseOperatingPicturePersistence(config);
  return persistUserContinuityCaptureCandidate(candidate, {
    createRecordId: () => `${RECORD_ID_PREFIX}${randomUUID()}`,
    clock: () => new Date(),
    appendVersion: persistence.appendVersion as AppendVersion,
  });
}
